"""
Aperture Photometry & Centroiding for SPHEREx EXPLORER.
Measures physical source fluxes, background noise, and astrometric centroids.
Converts surface brightness (MJy/sr) into microJanskys (uJy) and AB magnitudes.
"""
from typing import Dict, Any, Tuple
import numpy as np

# SPHEREx pixel scale: ~6.2 arcseconds per pixel
PIXEL_SCALE_ARCSEC = 6.2
PIXEL_SCALE_RAD = PIXEL_SCALE_ARCSEC * (np.pi / (180.0 * 3600.0))
PIXEL_SOLID_ANGLE_SR = PIXEL_SCALE_RAD ** 2

def measure_aperture_photometry(
    image_data: np.ndarray,
    center_xy: Tuple[float, float] = None,
    r_aper: float = 3.0,
    r_in: float = 5.0,
    r_out: float = 8.0
) -> Dict[str, Any]:
    """
    Performs circular aperture photometry with background annulus estimation.
    """
    arr = np.nan_to_num(image_data, nan=0.0).astype(np.float64)
    h, w = arr.shape
    
    if center_xy is None:
        center_x = w / 2.0
        center_y = h / 2.0
    else:
        center_x, center_y = center_xy
        
    y, x = np.ogrid[:h, :w]
    dist_from_center = np.sqrt((x - center_x) ** 2 + (y - center_y) ** 2)
    
    # 1. Background Annulus
    annulus_mask = (dist_from_center >= r_in) & (dist_from_center <= r_out)
    if np.any(annulus_mask):
        bg_pixels = arr[annulus_mask]
        bg_level = float(np.median(bg_pixels))
        bg_std = float(np.std(bg_pixels))
    else:
        bg_level = float(np.median(arr))
        bg_std = float(np.std(arr))
        
    # 2. Source Aperture
    aper_mask = dist_from_center <= r_aper
    n_aper_pixels = int(np.count_nonzero(aper_mask))
    
    if n_aper_pixels > 0:
        raw_flux_sum = float(np.sum(arr[aper_mask]))
        bg_subtracted_sum = raw_flux_sum - (bg_level * n_aper_pixels)
        peak_pixel = float(np.max(arr[aper_mask]))
    else:
        raw_flux_sum = 0.0
        bg_subtracted_sum = 0.0
        peak_pixel = 0.0
        
    # 3. Physical Units Conversion
    # Net flux in Jy: MJy/sr * 1e6 * solid_angle
    # Net flux in uJy: Jy * 1e6 = MJy/sr * 1e12 * solid_angle
    flux_density_jy = bg_subtracted_sum * 1e6 * PIXEL_SOLID_ANGLE_SR
    flux_density_ujy = max(0.001, flux_density_jy * 1e6)
    
    # AB magnitude: -2.5 * log10(flux_jy / 3631.0)
    if flux_density_jy > 1e-12:
        ab_mag = float(-2.5 * np.log10(flux_density_jy / 3631.0))
    else:
        ab_mag = None
        
    snr = float(bg_subtracted_sum / (bg_std * np.sqrt(n_aper_pixels))) if bg_std > 1e-7 else 1.0
    
    # Centroid refinement (center-of-mass inside aperture)
    if n_aper_pixels > 0 and bg_subtracted_sum > 0:
        weights = np.maximum(0.0, arr[aper_mask] - bg_level)
        x_coords = x.repeat(h, axis=0)[aper_mask]
        y_coords = y.repeat(w, axis=1)[aper_mask]
        total_w = np.sum(weights)
        if total_w > 0:
            refined_cx = float(np.sum(x_coords * weights) / total_w)
            refined_cy = float(np.sum(y_coords * weights) / total_w)
        else:
            refined_cx, refined_cy = center_x, center_y
    else:
        refined_cx, refined_cy = center_x, center_y
        
    return {
        "center_pixel": [refined_cx, refined_cy],
        "aperture_radius_pixels": r_aper,
        "n_pixels": n_aper_pixels,
        "peak_surface_brightness": peak_pixel,
        "bg_surface_brightness": bg_level,
        "bg_std_noise": bg_std,
        "net_flux_mjy_sr": bg_subtracted_sum,
        "flux_density_ujy": round(flux_density_ujy, 2),
        "ab_magnitude": round(ab_mag, 2) if ab_mag is not None else None,
        "signal_to_noise_ratio": round(snr, 1)
    }
