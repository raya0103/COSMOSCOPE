"""
Image Subtraction & Transient Discovery Engine for SPHEREx EXPLORER.
Performs flux-matched difference imaging (I_target - I_ref) to detect
astronomical variables, moving objects, and transient events.
"""
from typing import Dict, Any, Tuple
import numpy as np
from scipy.ndimage import zoom

def compute_image_difference(
    img1: np.ndarray,
    img2: np.ndarray,
    normalize: bool = True
) -> Dict[str, Any]:
    """
    Computes difference between two aligned observation epochs: D = img2 - img1.
    Includes background matching and positive/negative excursion analysis.
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
    
    # Optional flux scaling factor estimation using median ratio of non-zero pixels
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
    
    return {
        "difference_data": diff.tolist(),
        "shape": list(diff.shape),
        "scale_factor_applied": scale_factor,
        "sigma_noise": sigma_diff,
        "pos_residual_pixels": pos_peaks_count,
        "neg_residual_pixels": neg_peaks_count,
        "max_positive_residual": max_pos_residual,
        "max_negative_residual": min_neg_residual,
        "has_significant_change": bool(pos_peaks_count > 4 or neg_peaks_count > 4),
        "explanation": (
            f"Difference analysis reveals {pos_peaks_count} brightened pixels and {neg_peaks_count} "
            f"faded pixels exceeding 3σ significance (noise floor: {sigma_diff:.4f} MJy/sr)."
        )
    }
