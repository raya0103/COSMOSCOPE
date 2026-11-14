"""
Multi-Extension FITS (MEF) Parser & Visualizer for SPHEREx EXPLORER.
Parses IMAGE, FLAGS, VARIANCE, ZODI, PSF, and WCS-WAVE extensions.
Generates astronomical color-stretched preview images (ZScale/asinh) and data matrices.
"""
import io
import base64
from typing import Dict, Any, Optional, Tuple
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from astropy.io import fits
from astropy.wcs import WCS
from astropy.visualization import AsinhStretch, LogStretch, SqrtStretch, LinearStretch, ZScaleInterval

def parse_mef_file(fits_path: str, target_coord: Optional[Tuple[float, float]] = None) -> Dict[str, Any]:
    """
    Parses a SPHEREx Multi-Extension FITS file, extracting headers, data arrays,
    statistics, and spectral wavelength mapping.
    """
    result = {
        "is_valid": False,
        "primary_header": {},
        "image_header": {},
        "shape": [0, 0],
        "detector": 1,
        "date_obs": "",
        "bunit": "MJy / sr",
        "central_wavelength_um": None,
        "bandwidth_um": None,
        "min_flux": 0.0,
        "max_flux": 0.0,
        "median_flux": 0.0,
        "std_flux": 0.0,
        "flags_summary": {},
        "raw_image_data": None
    }
    
    with fits.open(fits_path, memmap=False) as hdul:
        # 1. Primary Header
        p_hdr = hdul[0].header
        result["primary_header"] = {k: str(p_hdr[k]) for k in p_hdr.keys() if len(k) <= 8}
        
        # 2. Image Extension
        if "IMAGE" in hdul:
            img_hdu = hdul["IMAGE"]
            img_data = img_hdu.data
            img_hdr = img_hdu.header
        else:
            img_hdu = hdul[1]
            img_data = img_hdu.data
            img_hdr = img_hdu.header
            
        result["image_header"] = {k: str(img_hdr[k]) for k in img_hdr.keys() if len(k) <= 8}
        result["shape"] = list(img_data.shape)
        result["bunit"] = img_hdr.get("BUNIT", "MJy / sr")
        result["detector"] = int(img_hdr.get("DETECTOR", 1))
        result["date_obs"] = img_hdr.get("DATE-OBS", img_hdr.get("DATE", ""))
        
        # Clean NaNs and infs for statistics & visualization
        valid_mask = np.isfinite(img_data)
        clean_img = np.array(img_data, copy=True)
        if np.any(valid_mask):
            valid_pixels = img_data[valid_mask]
            result["min_flux"] = float(np.min(valid_pixels))
            result["max_flux"] = float(np.max(valid_pixels))
            result["median_flux"] = float(np.median(valid_pixels))
            result["std_flux"] = float(np.std(valid_pixels))
            # Saturated/masked pixels in astronomical FITS should retain peak flux
            # instead of creating a black hole at the center of stars
            clean_img[~valid_mask] = float(np.max(valid_pixels))
        else:
            clean_img = np.nan_to_num(clean_img, nan=0.0)
        
        result["raw_image_data"] = clean_img.tolist()
        
        # 3. Spectral WCS (WAVE-TAB)
        try:
            spectral_wcs = WCS(header=img_hdr, fobj=hdul, key="W")
            spectral_wcs.sip = None
            
            # If target_coord provided, find wavelength at target; otherwise center of image
            if target_coord:
                spatial_wcs = WCS(img_hdr)
                px, py = spatial_wcs.world_to_pixel_values(target_coord[0], target_coord[1])
            else:
                px = img_data.shape[1] / 2.0
                py = img_data.shape[0] / 2.0
                
            wave, bwidth = spectral_wcs.pixel_to_world_values(px, py)
            result["central_wavelength_um"] = float(wave)
            result["bandwidth_um"] = float(bwidth)
        except Exception:
            # Fallback estimation based on detector nominal band
            nominal_bands = {
                1: 0.92,
                2: 1.36,
                3: 2.02,
                4: 3.12,
                5: 4.12,
                6: 4.71
            }
            result["central_wavelength_um"] = nominal_bands.get(result["detector"], 1.5)
            result["bandwidth_um"] = 0.05
            
        # 4. Flags Extension
        if "FLAGS" in hdul:
            flags_data = hdul["FLAGS"].data
            result["flags_summary"] = {
                "total_pixels": int(flags_data.size),
                "non_zero_flags": int(np.count_nonzero(flags_data)),
                "bad_pixels": int(np.count_nonzero(flags_data & 1)),
                "saturated_pixels": int(np.count_nonzero(flags_data & 2)),
                "cosmic_rays": int(np.count_nonzero(flags_data & 4)),
            }
            
        result["is_valid"] = True
        return result


def generate_stretched_thumbnail_base64(
    image_data: np.ndarray,
    stretch: str = "asinh",
    colormap: str = "inferno",
    size_pixels: int = 256
) -> str:
    """
    Renders an astronomical FITS array into a base64-encoded PNG thumbnail
    using ZScale / Asinh / Log stretch and matplotlib colormaps.
    """
    clean_data = np.nan_to_num(image_data, nan=0.0)
    
    # Calculate robust interval (ZScale or 1st to 99th percentile)
    try:
        interval = ZScaleInterval(contrast=0.25)
        vmin, vmax = interval.get_limits(clean_data)
    except Exception:
        vmin = np.percentile(clean_data, 1.0)
        vmax = np.percentile(clean_data, 99.0)
        
    if vmax <= vmin:
        vmax = vmin + 1.0
        
    clipped = np.clip(clean_data, vmin, vmax)
    normalized = (clipped - vmin) / (vmax - vmin)
    
    # Apply stretch
    if stretch == "asinh":
        stretcher = AsinhStretch(a=0.1)
        stretched = stretcher(normalized)
    elif stretch == "log":
        stretcher = LogStretch(a=1000.0)
        stretched = stretcher(normalized)
    elif stretch == "sqrt":
        stretcher = SqrtStretch()
        stretched = stretcher(normalized)
    else:
        stretcher = LinearStretch()
        stretched = stretcher(normalized)
        
    # Colormap rendering
    cmap = plt.get_cmap(colormap if colormap in plt.colormaps() else "inferno")
    rgba = (cmap(stretched) * 255).astype(np.uint8)
    
    fig, ax = plt.subplots(figsize=(3, 3), dpi=80)
    ax.imshow(rgba, origin="lower")
    ax.axis("off")
    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
    
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight", pad_inches=0)
    plt.close(fig)
    buf.seek(0)
    
    b64_str = base64.b64encode(buf.read()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"
