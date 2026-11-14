"""
Target Measurability & Detection Audit Script for all 20 downloaded NASA FITS cutouts.
Handles NaN / masked pixels properly using numpy nan-functions.
"""
import os
import json
import numpy as np
from astropy.io import fits
from astropy.wcs import WCS
from astropy.coordinates import SkyCoord
from astropy import units as u

MANIFEST_PATH = r"D:\SPHEREX\backend\data\raw\spherex\OBSERVATION_MANIFEST.json"
RAW_DIR = r"D:\SPHEREX\backend\data\raw\spherex"

with open(MANIFEST_PATH, "r") as f:
    manifest = json.load(f)

# Catalog coordinates (J2000)
TARGET_COORDS = {
    "R Draconis": (248.16750, 66.75500),
    "Barnard's Star": (269.45208, 4.69333),
    "WISE 0855-0714": (133.79513, -7.24515),
    "RW Aurigae": (76.95642, 30.40142),
    "Epsilon Indi B": (331.04375, -56.78278)
}

print("="*95)
print("SCIENTIFIC TARGET DETECTION & MEASURABILITY AUDIT ACROSS ALL 20 NASA FITS CUTOUTS")
print("="*95)

results = []

for item in manifest:
    target = item["target_name"]
    slug = item["target_slug"]
    fname = item["original_filename"]
    obsid = item["obs_id"]
    det = item["detector_id"]
    band = item["bandpass_name"]
    fpath = os.path.join(RAW_DIR, slug, fname)
    
    ra_cat, dec_cat = TARGET_COORDS[target]
    
    with fits.open(fpath) as hdul:
        data = hdul["IMAGE"].data.astype(np.float64)
        im_hdr = hdul["IMAGE"].header
        w = WCS(im_hdr)
        
    # 1. Target pixel location
    px_raw, py_raw = w.all_world2pix(ra_cat, dec_cat, 0)
    px = float(px_raw)
    py = float(py_raw)
    in_bounds = (0 <= px < data.shape[1] and 0 <= py < data.shape[0])
    
    # 2. Local background and noise in annulus (r_in=5, r_out=9)
    y_grid, x_grid = np.ogrid[:data.shape[0], :data.shape[1]]
    dist = np.sqrt((x_grid - px)**2 + (y_grid - py)**2)
    annulus_mask = (dist >= 4.0) & (dist <= 8.0) & np.isfinite(data)
    bg_pixels = data[annulus_mask]
    bg_median = float(np.nanmedian(bg_pixels)) if len(bg_pixels) > 0 else 0.0
    bg_std = float(np.nanstd(bg_pixels)) if len(bg_pixels) > 0 else 1.0
    if bg_std < 1e-4:
        bg_std = 1.0
    
    # 3. Peak signal around target (within 3 px)
    source_mask = (dist <= 3.0) & np.isfinite(data)
    source_pixels = data[source_mask]
    peak_val = float(np.nanmax(source_pixels)) if len(source_pixels) > 0 else bg_median
    snr = max(0.0, (peak_val - bg_median) / bg_std)
    
    # 4. Intensity-weighted centroid
    weights = np.maximum(0.0, source_pixels - bg_median)
    total_w = float(np.sum(weights))
    if total_w > 0:
        ys, xs = np.where(source_mask)
        cx = float(np.sum(xs * weights) / total_w)
        cy = float(np.sum(ys * weights) / total_w)
        c_ra_raw, c_dec_raw = w.all_pix2world(cx, cy, 0)
        c_ra = float(c_ra_raw)
        c_dec = float(c_dec_raw)
        
        # Astrometric offset
        sc_cat = SkyCoord(ra_cat*u.deg, dec_cat*u.deg, frame="icrs")
        sc_meas = SkyCoord(c_ra*u.deg, c_dec*u.deg, frame="icrs")
        sep_arcsec = float(sc_cat.separation(sc_meas).arcsec)
    else:
        cx, cy = px, py
        c_ra, c_dec = ra_cat, dec_cat
        sep_arcsec = 0.0

    detected = (snr >= 3.0) and in_bounds
    status = "DETECTED" if detected else ("WEAK/FAINT" if in_bounds else "OUT_OF_BOUNDS")
    
    print(f"[{status:<10}] {target:<16} | {obsid} D{det} ({band:<10}) | Px: ({px:4.1f},{py:4.1f}) | Peak: {peak_val:8.2f} | Bg: {bg_median:6.2f} | SNR: {snr:5.1f} | Sep: {sep_arcsec:4.2f}\"")
    
    results.append({
        "target": target,
        "obs_id": obsid,
        "detector": det,
        "band": band,
        "px": round(px, 2),
        "py": round(py, 2),
        "peak_flux": round(peak_val, 2),
        "bg_median": round(bg_median, 4),
        "bg_std": round(bg_std, 4),
        "snr": round(snr, 2),
        "centroid_px": (round(cx, 2), round(cy, 2)),
        "astrometric_offset_arcsec": round(sep_arcsec, 2),
        "status": status
    })

print("\n" + "="*95)
with open(os.path.join(RAW_DIR, "DETECTION_AUDIT_RESULTS.json"), "w") as f:
    json.dump(results, f, indent=2)
print("Detection audit results saved to DETECTION_AUDIT_RESULTS.json")
