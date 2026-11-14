import sys
sys.path.append("backend")
import json
import numpy as np
from astropy.io import fits
from app.image_analysis.photometry import measure_aperture_photometry

def check_all_photometry():
    with open("backend/data/raw/spherex/OBSERVATION_MANIFEST.json") as f:
        manifest = json.load(f)
        
    for entry in manifest:
        path = f"backend/data/raw/spherex/{entry['target_slug']}/{entry['original_filename']}"
        with fits.open(path) as hdul:
            data = np.nan_to_num(hdul[1].data.astype(np.float64), nan=0.0)
            
        phot = measure_aperture_photometry(data)
        peak_y, peak_x = np.unravel_index(np.argmax(data), data.shape)
        phot_centered = measure_aperture_photometry(data, center_xy=(float(peak_x), float(peak_y)))
        
        print(f"Target: {entry['target_name']:15s} | {entry['original_filename'][:35]} | Peak: ({peak_x},{peak_y})={data[peak_y,peak_x]:8.1f} MJy/sr")
        print(f"   Default Center (14.5, 14.5): Net Sum = {phot['net_flux_mjy_sr']:10.1f} MJy/sr | Flux = {phot['flux_density_ujy']:12.1f} uJy ({phot['flux_density_ujy']/1e6:6.2f} Jy) | AB mag = {phot['ab_magnitude']}")
        print(f"   Peak Centered ({peak_x}, {peak_y}):       Net Sum = {phot_centered['net_flux_mjy_sr']:10.1f} MJy/sr | Flux = {phot_centered['flux_density_ujy']:12.1f} uJy ({phot_centered['flux_density_ujy']/1e6:6.2f} Jy) | AB mag = {phot_centered['ab_magnitude']}")

if __name__ == "__main__":
    check_all_photometry()
