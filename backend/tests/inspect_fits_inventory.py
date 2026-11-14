import os
import json
import glob
from astropy.io import fits

def inspect_inventory():
    manifest_path = "backend/data/raw/spherex/OBSERVATION_MANIFEST.json"
    with open(manifest_path, "r") as f:
        manifest = json.load(f)
        
    print(f"=== OBSERVATION_MANIFEST.json: {len(manifest)} entries ===")
    for i, entry in enumerate(manifest, 1):
        print(f"{i:2d}. Target: {entry['target_name']:15s} | ObsID: {entry['obs_id']:25s} | Det: D{entry['detector_id']} | File: {entry['original_filename']}")
        
    # Check physical files in backend/data/raw/spherex
    raw_files = glob.glob("backend/data/raw/spherex/**/*.fits", recursive=True)
    print(f"\n=== Physical FITS Files on Disk in backend/data/raw/spherex/: {len(raw_files)} files ===")
    for i, rf in enumerate(sorted(raw_files), 1):
        sz = os.path.getsize(rf)
        with fits.open(rf) as h:
            n_hdus = len(h)
            date = h[1].header.get("DATE-OBS", "N/A")
            det = h[1].header.get("DETECTOR", "N/A")
            bunit = h[1].header.get("BUNIT", "N/A")
            shape = h[1].data.shape if h[1].data is not None else None
        print(f"{i:2d}. {os.path.basename(rf)} | Size: {sz} bytes | HDUs: {n_hdus} | Date: {date} | Det: D{det} | Unit: {bunit} | Shape: {shape}")

if __name__ == "__main__":
    inspect_inventory()
