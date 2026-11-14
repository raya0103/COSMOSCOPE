"""
Image Co-addition & Stacking Engine for SPHEREx EXPLORER.
Combines multiple observation epochs using median, mean, or inverse-variance
weighting to suppress noise, eliminate cosmic rays, and detect faint sources.
"""
from typing import List, Dict, Any
import numpy as np
from scipy.ndimage import zoom

def stack_images(images: List[np.ndarray], method: str = "median") -> Dict[str, Any]:
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
    individual_sigmas = []
    
    for idx, img in enumerate(images):
        arr = np.nan_to_num(img, nan=0.0).astype(np.float32)
        if arr.shape != target_shape:
            z_factors = (target_shape[0] / arr.shape[0], target_shape[1] / arr.shape[1])
            arr = zoom(arr, z_factors, order=1)
        aligned_stack.append(arr)
        
        # Calculate individual noise
        mad = np.median(np.abs(arr - np.median(arr)))
        sigma = float(mad * 1.4826) if mad > 1e-7 else float(np.std(arr))
        individual_sigmas.append(max(sigma, 1e-6))
        
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
    
    return {
        "stacked_data": combined.tolist(),
        "shape": list(combined.shape),
        "method": method,
        "n_frames_combined": n_images,
        "input_avg_noise": avg_input_sigma,
        "stacked_noise": combined_sigma,
        "snr_gain_factor": round(snr_gain, 2),
        "noise_reduction_pct": round(noise_reduction_pct, 1),
        "explanation": (
            f"Successfully co-added {n_images} epochs using {method} stacking. "
            f"Noise reduced by {noise_reduction_pct:.1f}% with an estimated {snr_gain:.2f}× SNR enhancement."
        )
    }
