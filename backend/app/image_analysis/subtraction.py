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
    meta2: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Computes difference between two aligned observation epochs: D = S * (img2 - bg2) - (img1 - bg1).
    Includes background matching, scale factor estimation, and 3-sigma excursion analysis.
    """
    arr1 = np.nan_to_num(img1, nan=0.0).astype(np.float32)
    arr2 = np.nan_to_num(img2, nan=0.0).astype(np.float32)
    
    # Resample if shapes differ
    if arr1.shape != arr2.shape:
        zoom_factors = (arr1.shape[0] / arr2.shape[0], arr1.shape[1] / arr2.shape[1])
        arr2 = zoom(arr2, zoom_factors, order=1)
        
    # Background level estimation (median of lower quartile)
    p50_1 = np.percentile(arr1, 50)
    valid1 = arr1[arr1 <= p50_1]
    bg1 = float(np.median(valid1)) if len(valid1) > 0 else float(np.median(arr1))

    p50_2 = np.percentile(arr2, 50)
    valid2 = arr2[arr2 <= p50_2]
    bg2 = float(np.median(valid2)) if len(valid2) > 0 else float(np.median(arr2))
    
    sub1 = arr1 - bg1
    sub2 = arr2 - bg2
    
    # Flux scaling factor S estimation using median ratio of non-zero pixels
    # S = median(|sub1|) / median(|sub2|)
    scale_factor = 1.0
    if normalize:
        m1 = np.median(np.abs(sub1))
        m2 = np.median(np.abs(sub2))
        if m1 > 1e-6 and m2 > 1e-6:
            scale_factor = float(m1 / m2)
            sub2 = sub2 * scale_factor
            
    diff = sub2 - sub1
    
    # Noise standard deviation estimate via Median Absolute Deviation (MAD)
    diff_mad = np.median(np.abs(diff - np.median(diff)))
    sigma_diff = float(diff_mad * 1.4826) if diff_mad > 1e-7 else float(np.std(diff))
    
    # Detect positive and negative residuals > 3 sigma
    pos_mask = diff > (3.0 * sigma_diff)
    neg_mask = diff < (-3.0 * sigma_diff)
    
    pos_peaks_count = int(np.count_nonzero(pos_mask))
    neg_peaks_count = int(np.count_nonzero(neg_mask))
    
    max_pos_residual = float(np.max(diff))
    min_neg_residual = float(np.min(diff))

    # Scientific Compatibility & Metadata Validation
    compatibility_status = "COMPATIBLE"
    compatibility_notes = "Observation epochs are matched in bandpass and detector configuration."
    if meta1 and meta2:
        det1 = meta1.get("detector")
        det2 = meta2.get("detector")
        wave1 = meta1.get("central_wavelength_um")
        wave2 = meta2.get("central_wavelength_um")
        
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
        "explanation": (
            f"Difference analysis reveals {pos_peaks_count} brightened pixels and {neg_peaks_count} "
            f"faded pixels exceeding 3σ significance (noise floor: {sigma_diff:.4f} MJy/sr; "
            f"flux scale factor S={scale_factor:.4f})."
        )
    }
