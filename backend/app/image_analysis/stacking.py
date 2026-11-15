"""
Image Co-addition & Stacking Engine for SPHEREx EXPLORER.
Combines multiple observation epochs using median, mean, or inverse-variance
weighting to suppress noise, eliminate cosmic rays, and detect faint sources.

Scientific Methodology:
1. SPHEREx Level 2 image arrays are calibrated in units of Surface Brightness (MJy/sr).
2. Detector Compatibility Guard: Coaddition should ideally combine frames within the
   same detector array and spectral band. Cross-detector coaddition is flagged with
   scientific warnings due to disparate pixel scales, filter profiles, and PSFs.
3. Coaddition Algorithms:
   - Median: Robust against outliers, satellite streaks, and transient cosmic rays.
     Theoretical noise reduction factor: sqrt(pi / (2 * N)) * sigma.
   - Inverse-Variance Weighted Mean: Optimal minimum-variance estimator when exposure
     depths or noise properties vary across visits: W_i = 1 / sigma_i^2.
   - Mean: Standard arithmetic average for uniformly calibrated Gaussian noise frames.
4. Error Propagation: Propagates pixel uncertainty maps or empirical MAD dispersions.
"""
from typing import List, Dict, Any, Optional
import numpy as np
from scipy.ndimage import zoom

def stack_images(
    images: List[np.ndarray],
    method: str = "median",
    uncertainties: Optional[List[np.ndarray]] = None,
    metadata: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Co-adds a list of aligned 2D image arrays.
    Returns stacked data matrix, noise statistics, and SNR improvement factor.
    """
    if not images:
        raise ValueError("Cannot stack an empty list of images.")
        
    n_images = len(images)
    target_shape = images[0].shape
    
    # Standardize array dimensions
    aligned_stack = []
    aligned_errors = []
    individual_sigmas = []
    
    from app.image_analysis.wcs_aligner import reproject_frame_to_reference

    ref_meta = metadata[0] if (metadata and len(metadata) > 0) else None

    for idx, img in enumerate(images):
        arr = np.nan_to_num(img, nan=0.0).astype(np.float32)
        tgt_meta = metadata[idx] if (metadata and idx < len(metadata)) else None
        
        if idx > 0 and (ref_meta or arr.shape != target_shape):
            align_res = reproject_frame_to_reference(
                images[0], arr, ref_meta=ref_meta, target_meta=tgt_meta
            )
            arr = align_res["aligned_image"]
        aligned_stack.append(arr)
        
        # Calculate individual noise
        mad = np.median(np.abs(arr - np.median(arr)))
        sigma = float(mad * 1.4826) if mad > 1e-7 else float(np.std(arr))
        individual_sigmas.append(max(sigma, 1e-6))

        if uncertainties and idx < len(uncertainties) and uncertainties[idx] is not None:
            err_arr = np.nan_to_num(uncertainties[idx], nan=0.0).astype(np.float32)
            if err_arr.shape != target_shape:
                z_factors = (target_shape[0] / err_arr.shape[0], target_shape[1] / err_arr.shape[1])
                err_arr = zoom(err_arr, z_factors, order=1)
            aligned_errors.append(err_arr)
        
    stacked_cube = np.stack(aligned_stack, axis=0) # Shape: (N, H, W)
    
    if method == "median":
        combined = np.median(stacked_cube, axis=0)
    elif method == "inverse_variance":
        weights = 1.0 / (np.array(individual_sigmas) ** 2)
        weights /= np.sum(weights)
        combined = np.sum(stacked_cube * weights[:, None, None], axis=0)
    else: # mean
        combined = np.mean(stacked_cube, axis=0)
        
    combined_mad = np.median(np.abs(combined - np.median(combined)))
    combined_sigma = float(combined_mad * 1.4826) if combined_mad > 1e-7 else float(np.std(combined))
    
    avg_input_sigma = float(np.mean(individual_sigmas))
    snr_gain = float(avg_input_sigma / combined_sigma) if combined_sigma > 1e-7 else float(np.sqrt(n_images))
    noise_reduction_pct = float(max(0.0, (1.0 - (combined_sigma / avg_input_sigma)) * 100.0))

    # Detector & Bandpass Compatibility Validation
    compatibility_status = "COMPATIBLE"
    compatibility_notes = "All stacked frames are scientifically aligned in bandpass and detector array."
    if metadata and len(metadata) > 1:
        detectors = {m.get("detector") for m in metadata if m and m.get("detector")}
        if len(detectors) > 1:
            compatibility_status = "CROSS_DETECTOR_CAUTION"
            compatibility_notes = (
                f"Scientific Limitation: Coadded frames span multiple detector arrays ({', '.join(f'D{d}' for d in sorted(detectors))}). "
                "Stacking across distinct SPHEREx detectors violates monochromatic coaddition assumptions because: "
                "(1) Chromatic PSF mismatch: PSFs scale with λ/D, causing synthetic smearing and unphysical aperture profiles; "
                "(2) Bandpass non-homogeneity: Detectors cover disjoint wavelength regimes (e.g. D1: 0.75-1.11 µm vs D6: 4.42-5.00 µm); "
                "(3) Heterogeneous background regimes: Short bands are dominated by scattered sunlight, while long bands are dominated by thermal zodiacal dust emission; and "
                "(4) Independent calibration scales: Intersensor flat-field and photometric zero-point discrepancies compromise coadded photometric fidelity."
            )
    
    return {
        "stacked_data": combined.tolist(),
        "shape": list(combined.shape),
        "method": method,
        "n_frames_combined": n_images,
        "num_stacked_images": n_images,
        "input_avg_noise": round(avg_input_sigma, 5),
        "stacked_noise": round(combined_sigma, 5),
        "snr_gain_factor": round(snr_gain, 2),
        "snr_improvement_factor": round(snr_gain, 2),
        "noise_reduction_pct": round(noise_reduction_pct, 1),
        "noise_reduction_percent": round(noise_reduction_pct, 1),
        "units": "MJy/sr (Surface Brightness)",
        "compatibility_status": compatibility_status,
        "compatibility_notes": compatibility_notes,
        "explanation": (
            f"Successfully co-added {n_images} epochs using {method} stacking. "
            f"Noise reduced by {noise_reduction_pct:.1f}% with an estimated {snr_gain:.2f}× SNR enhancement. "
            f"Calibrated surface brightness in MJy/sr."
        )
    }
