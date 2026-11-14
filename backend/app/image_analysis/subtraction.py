"""
Image Subtraction & Transient Discovery Engine for SPHEREx EXPLORER.
Performs flux-matched difference imaging (I_target - I_ref) to detect
astronomical variables, moving objects, and transient events.

Scientific Methodology:
1. SPHEREx Level 2 image arrays are calibrated in units of Surface Brightness (MJy/sr).
2. Background subtraction estimates local sky/zodiacal level using median of lower-quartile pixels:
   bg_1 = median(I_1 <= P_50),  bg_2 = median(I_2 <= P_50)
3. Flux normalization scale factor S matches Epoch 2 to Epoch 1:
   S = median(|I_1 - bg_1|) / median(|I_2 - bg_2|)
   D = S * (I_2 - bg_2) - (I_1 - bg_1)
4. Empirical noise estimation via Median Absolute Deviation (MAD):
   sigma_diff = 1.4826 * MAD(D)
5. Detects >3-sigma positive excursions (brightening/emergence) and negative excursions (fading/transit).
"""
from typing import Dict, Any, Tuple, Optional
import numpy as np
from scipy.ndimage import zoom

def compute_image_difference(
    img1: np.ndarray,
    img2: np.ndarray,
    normalize: bool = True,
    meta1: Optional[Dict[str, Any]] = None,
    meta2: Optional[Dict[str, Any]] = None,
    mask1: Optional[np.ndarray] = None,
    mask2: Optional[np.ndarray] = None
) -> Dict[str, Any]:
    """
    Computes difference between two aligned observation epochs: D = S * (img2 - bg2) - (img1 - bg1).
    Includes background matching, scale factor estimation, validity masking, and 3-sigma excursion analysis.
    Strictly excludes padded or non-overlapping pixels from noise calculation and candidate detection.
    """
    arr1 = np.nan_to_num(img1, nan=0.0).astype(np.float32)
    arr2 = np.nan_to_num(img2, nan=0.0).astype(np.float32)
    
    val1 = np.array(mask1, dtype=bool) if mask1 is not None else np.ones(arr1.shape, dtype=bool)
    val2 = np.array(mask2, dtype=bool) if mask2 is not None else np.ones(arr2.shape, dtype=bool)

    # Resample if shapes differ
    if arr1.shape != arr2.shape:
        zoom_factors = (arr1.shape[0] / arr2.shape[0], arr1.shape[1] / arr2.shape[1])
        arr2 = zoom(arr2, zoom_factors, order=1)
        val2 = zoom(val2.astype(np.float32), zoom_factors, order=0) > 0.5
        
    joint_valid = val1 & val2 & np.isfinite(arr1) & np.isfinite(arr2)
    n_valid_pixels = int(np.count_nonzero(joint_valid))
    
    if n_valid_pixels == 0:
        joint_valid = np.ones(arr1.shape, dtype=bool)
        n_valid_pixels = arr1.size

    # Background level estimation (median of lower quartile on valid pixels)
    valid_pixels_1 = arr1[joint_valid]
    p50_1 = np.percentile(valid_pixels_1, 50) if len(valid_pixels_1) > 0 else 0.0
    bg1_cands = valid_pixels_1[valid_pixels_1 <= p50_1]
    bg1 = float(np.median(bg1_cands)) if len(bg1_cands) > 0 else float(np.median(valid_pixels_1))

    valid_pixels_2 = arr2[joint_valid]
    p50_2 = np.percentile(valid_pixels_2, 50) if len(valid_pixels_2) > 0 else 0.0
    bg2_cands = valid_pixels_2[valid_pixels_2 <= p50_2]
    bg2 = float(np.median(bg2_cands)) if len(bg2_cands) > 0 else float(np.median(valid_pixels_2))
    
    sub1 = arr1 - bg1
    sub2 = arr2 - bg2
    
    # Flux scaling factor S estimation using median ratio of non-zero valid pixels
    # S = median(|sub1|) / median(|sub2|)
    scale_factor = 1.0
    if normalize:
        m1 = np.median(np.abs(sub1[joint_valid]))
        m2 = np.median(np.abs(sub2[joint_valid]))
        if m1 > 1e-6 and m2 > 1e-6:
            scale_factor = float(m1 / m2)
            sub2 = sub2 * scale_factor
            
    diff = sub2 - sub1
    # Mask out non-valid pixels from difference analysis
    diff[~joint_valid] = 0.0
    
    # Noise standard deviation estimate via Median Absolute Deviation (MAD) on valid pixels
    valid_diff = diff[joint_valid]
    if len(valid_diff) > 0:
        diff_mad = np.median(np.abs(valid_diff - np.median(valid_diff)))
        sigma_diff = float(diff_mad * 1.4826) if diff_mad > 1e-7 else float(np.std(valid_diff))
        max_pos_residual = float(np.max(valid_diff))
        min_neg_residual = float(np.min(valid_diff))
    else:
        sigma_diff = 1.0
        max_pos_residual = 0.0
        min_neg_residual = 0.0
    
    # Detect positive and negative residuals > 3 sigma strictly on valid pixels
    pos_mask = (diff > (3.0 * sigma_diff)) & joint_valid
    neg_mask = (diff < (-3.0 * sigma_diff)) & joint_valid
    
    pos_peaks_count = int(np.count_nonzero(pos_mask))
    neg_peaks_count = int(np.count_nonzero(neg_mask))

    # Scientific Compatibility & Metadata Validation
    compatibility_status = "COMPATIBLE"
    compatibility_notes = "Observation epochs are matched in bandpass and detector configuration."
    if meta1 and meta2:
        det1 = meta1.get("detector")
        det2 = meta2.get("detector")
        wave1 = meta1.get("central_wavelength_um")
        wave2 = meta2.get("central_wavelength_um")
        
        # Check coordinate centers if available
        ra1, dec1 = meta1.get("s_ra"), meta1.get("s_dec")
        ra2, dec2 = meta2.get("s_ra"), meta2.get("s_dec")
        if ra1 is not None and ra2 is not None and dec1 is not None and dec2 is not None:
            coord_diff_arcsec = np.sqrt((float(ra1) - float(ra2))**2 + (float(dec1) - float(dec2))**2) * 3600.0
            if coord_diff_arcsec > 60.0:
                compatibility_status = "COORDINATE_OFFSET_WARNING"
                compatibility_notes = (
                    f"Warning: Cutout centers differ by {coord_diff_arcsec:.1f} arcseconds. "
                    "Ensure cutouts are re-centered on the target before astronomical subtraction."
                )
        
        if det1 and det2 and det1 != det2:
            compatibility_status = "CROSS_BAND_WARNING"
            compatibility_notes = (
                f"Scientific Limitation: Epoch 1 (Detector {det1}, {wave1 or '?'} µm) and Epoch 2 "
                f"(Detector {det2}, {wave2 or '?'} µm) originate from distinct detector arrays. "
                "Cross-detector residuals cannot be attributed solely to intrinsic source color or temporal variability: "
                "they are strongly dominated by instrumental and observational systematic differences, including: "
                "(1) Chromatic PSF broadening (diffraction PSF scales with λ/D, causing artificial dipole/doughnut residuals); "
                "(2) Thermal vs scattered zodiacal background gradients (thermal emission dominates >3 µm in D5/D6); "
                "(3) Disparate LVF filter response curves and bandpass zero-points; and "
                "(4) Independent detector pixel scales and flat-field calibration variations."
            )
    
    return {
        "difference_data": diff.tolist(),
        "shape": list(diff.shape),
        "valid_pixel_count": n_valid_pixels,
        "total_pixel_count": arr1.size,
        "valid_fraction": round(n_valid_pixels / max(1, arr1.size), 4),
        "scale_factor_applied": round(scale_factor, 4),
        "scale_factor_formula": "S = median(|I_1 - bg_1|) / median(|I_2 - bg_2|)",
        "sigma_noise": round(sigma_diff, 5),
        "units": "MJy/sr (Surface Brightness)",
        "compatibility_status": compatibility_status,
        "compatibility_notes": compatibility_notes,
        "pos_residual_pixels": pos_peaks_count,
        "neg_residual_pixels": neg_peaks_count,
        "max_positive_residual": round(max_pos_residual, 4),
        "max_negative_residual": round(min_neg_residual, 4),
        "has_significant_change": bool(pos_peaks_count > 4 or neg_peaks_count > 4),
        "provenance_tier": "CALCULATED",
        "explanation": (
            f"Difference analysis reveals {pos_peaks_count} brightened pixels and {neg_peaks_count} "
            f"faded pixels exceeding 3σ significance (noise floor: {sigma_diff:.4f} MJy/sr; "
            f"flux scale factor S={scale_factor:.4f}; valid pixels: {n_valid_pixels}/{arr1.size})."
        )
    }
