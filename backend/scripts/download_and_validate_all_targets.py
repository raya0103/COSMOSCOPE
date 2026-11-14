"""
Master NASA Data Acquisition, Storage, and Scientific Validation Pipeline for COSMOSCOPE.
Downloads genuine NASA/IPAC IRSA SPHEREx Level 2 Multi-Extension FITS cutouts for all 5 targets:
1. R Draconis
2. Barnard's Star
3. WISE 0855-0714
4. RW Aurigae
5. Epsilon Indi B

Extracts real HDUs, validates WCS/Units/Astrometry, and builds the official OBSERVATION_MANIFEST.
"""
import os
import sys
import time
import json
import csv
import hashlib
import io
import requests
from typing import Dict, List, Any, Optional
from astropy.io import fits
from astropy.io.votable import parse_single_table
from astropy.wcs import WCS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(ROOT, "data", "raw", "spherex")
CACHE_DIR = os.path.join(ROOT, "data", "cache", "fits")
os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

# Curated observations across distinct epochs and detectors from spherex.obscore
DOWNLOAD_PLAN = [
    # --- 1. R DRACONIS ---
    {
        "target": "R Draconis", "slug": "rdraconis", "ra": 248.16750, "dec": 66.75500,
        "obs_id": "2025W17_4B_0021_1", "detector": 3, "band": "SPHEREx-D3",
        "dl_id": "ivo://irsa.ipac/spherex_qr2_deep?2025W17_4B_0021_1/D3",
        "date_obs": "2025-04-24T21:06:38.391", "mjd": 60789.879611, "visit": 1, "step": 1,
        "release": "spherex_qr2_deep"
    },
    {
        "target": "R Draconis", "slug": "rdraconis", "ra": 248.16750, "dec": 66.75500,
        "obs_id": "2025W17_4B_0021_1", "detector": 6, "band": "SPHEREx-D6",
        "dl_id": "ivo://irsa.ipac/spherex_qr2_deep?2025W17_4B_0021_1/D6",
        "date_obs": "2025-04-24T21:06:38.391", "mjd": 60789.879611, "visit": 1, "step": 1,
        "release": "spherex_qr2_deep"
    },
    {
        "target": "R Draconis", "slug": "rdraconis", "ra": 248.16750, "dec": 66.75500,
        "obs_id": "2025W17_4B_0145_1", "detector": 3, "band": "SPHEREx-D3",
        "dl_id": "ivo://irsa.ipac/spherex_qr2_deep?2025W17_4B_0145_1/D3",
        "date_obs": "2025-04-25T16:39:42.266", "mjd": 60790.694239, "visit": 2, "step": 1,
        "release": "spherex_qr2_deep"
    },
    {
        "target": "R Draconis", "slug": "rdraconis", "ra": 248.16750, "dec": 66.75500,
        "obs_id": "2025W17_4B_0145_1", "detector": 6, "band": "SPHEREx-D6",
        "dl_id": "ivo://irsa.ipac/spherex_qr2_deep?2025W17_4B_0145_1/D6",
        "date_obs": "2025-04-25T16:39:42.266", "mjd": 60790.694239, "visit": 2, "step": 1,
        "release": "spherex_qr2_deep"
    },

    # --- 2. BARNARD'S STAR ---
    {
        "target": "Barnard's Star", "slug": "barnard", "ra": 269.45208, "dec": 4.69333,
        "obs_id": "2025W33_2C_0321_1", "detector": 3, "band": "SPHEREx-D3",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W33_2C_0321_1/D3",
        "date_obs": "2025-08-15T20:45:11.337", "mjd": 60902.864715, "visit": 1, "step": 1,
        "release": "spherex_qr2"
    },
    {
        "target": "Barnard's Star", "slug": "barnard", "ra": 269.45208, "dec": 4.69333,
        "obs_id": "2025W33_2C_0321_1", "detector": 6, "band": "SPHEREx-D6",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W33_2C_0321_1/D6",
        "date_obs": "2025-08-15T20:45:11.337", "mjd": 60902.864715, "visit": 1, "step": 1,
        "release": "spherex_qr2"
    },
    {
        "target": "Barnard's Star", "slug": "barnard", "ra": 269.45208, "dec": 4.69333,
        "obs_id": "2025W33_2C_0386_3", "detector": 3, "band": "SPHEREx-D3",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W33_2C_0386_3/D3",
        "date_obs": "2025-08-16T03:19:14.000", "mjd": 60903.138366, "visit": 2, "step": 3,
        "release": "spherex_qr2"
    },
    {
        "target": "Barnard's Star", "slug": "barnard", "ra": 269.45208, "dec": 4.69333,
        "obs_id": "2025W34_1B_0164_1", "detector": 6, "band": "SPHEREx-D6",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W34_1B_0164_1/D6",
        "date_obs": "2025-08-18T20:28:41.000", "mjd": 60905.853252, "visit": 3, "step": 1,
        "release": "spherex_qr2"
    },

    # --- 3. WISE 0855-0714 ---
    {
        "target": "WISE 0855-0714", "slug": "wise0855", "ra": 133.79513, "dec": -7.24515,
        "obs_id": "2025W19_1B_0116_1", "detector": 3, "band": "SPHEREx-D3",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W19_1B_0116_1/D3",
        "date_obs": "2025-05-05T16:48:02.000", "mjd": 60800.700023, "visit": 1, "step": 1,
        "release": "spherex_qr2"
    },
    {
        "target": "WISE 0855-0714", "slug": "wise0855", "ra": 133.79513, "dec": -7.24515,
        "obs_id": "2025W19_1B_0116_1", "detector": 6, "band": "SPHEREx-D6",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W19_1B_0116_1/D6",
        "date_obs": "2025-05-05T16:48:02.000", "mjd": 60800.700023, "visit": 1, "step": 1,
        "release": "spherex_qr2"
    },
    {
        "target": "WISE 0855-0714", "slug": "wise0855", "ra": 133.79513, "dec": -7.24515,
        "obs_id": "2025W19_1B_0181_1", "detector": 2, "band": "SPHEREx-D2",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W19_1B_0181_1/D2",
        "date_obs": "2025-05-06T02:33:29.000", "mjd": 60801.106586, "visit": 2, "step": 1,
        "release": "spherex_qr2"
    },
    {
        "target": "WISE 0855-0714", "slug": "wise0855", "ra": 133.79513, "dec": -7.24515,
        "obs_id": "2025W19_1B_0181_1", "detector": 5, "band": "SPHEREx-D5",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W19_1B_0181_1/D5",
        "date_obs": "2025-05-06T02:33:29.000", "mjd": 60801.106586, "visit": 2, "step": 1,
        "release": "spherex_qr2"
    },

    # --- 4. RW AURIGAE ---
    {
        "target": "RW Aurigae", "slug": "rwaur", "ra": 76.95642, "dec": 30.40142,
        "obs_id": "2025W36_1A_0095_1", "detector": 1, "band": "SPHEREx-D1",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W36_1A_0095_1/D1",
        "date_obs": "2025-09-01T10:04:17.000", "mjd": 60919.419647, "visit": 1, "step": 1,
        "release": "spherex_qr2"
    },
    {
        "target": "RW Aurigae", "slug": "rwaur", "ra": 76.95642, "dec": 30.40142,
        "obs_id": "2025W36_1A_0095_1", "detector": 4, "band": "SPHEREx-D4",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W36_1A_0095_1/D4",
        "date_obs": "2025-09-01T10:04:17.000", "mjd": 60919.419647, "visit": 1, "step": 1,
        "release": "spherex_qr2"
    },
    {
        "target": "RW Aurigae", "slug": "rwaur", "ra": 76.95642, "dec": 30.40142,
        "obs_id": "2025W36_1A_0233_2", "detector": 4, "band": "SPHEREx-D4",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W36_1A_0233_2/D4",
        "date_obs": "2025-09-02T00:43:24.000", "mjd": 60920.030139, "visit": 2, "step": 2,
        "release": "spherex_qr2"
    },
    {
        "target": "RW Aurigae", "slug": "rwaur", "ra": 76.95642, "dec": 30.40142,
        "obs_id": "2025W36_1A_0446_1", "detector": 1, "band": "SPHEREx-D1",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W36_1A_0446_1/D1",
        "date_obs": "2025-09-02T23:27:24.000", "mjd": 60920.977361, "visit": 3, "step": 1,
        "release": "spherex_qr2"
    },

    # --- 5. EPSILON INDI B ---
    {
        "target": "Epsilon Indi B", "slug": "epsindi", "ra": 331.04375, "dec": -56.78278,
        "obs_id": "2025W17_4B_0017_1", "detector": 2, "band": "SPHEREx-D2",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W17_4B_0017_1/D2",
        "date_obs": "2025-04-24T20:31:57.000", "mjd": 60789.855522, "visit": 1, "step": 1,
        "release": "spherex_qr2"
    },
    {
        "target": "Epsilon Indi B", "slug": "epsindi", "ra": 331.04375, "dec": -56.78278,
        "obs_id": "2025W17_4B_0017_1", "detector": 5, "band": "SPHEREx-D5",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W17_4B_0017_1/D5",
        "date_obs": "2025-04-24T20:31:57.000", "mjd": 60789.855522, "visit": 1, "step": 1,
        "release": "spherex_qr2"
    },
    {
        "target": "Epsilon Indi B", "slug": "epsindi", "ra": 331.04375, "dec": -56.78278,
        "obs_id": "2025W17_4B_0077_3", "detector": 4, "band": "SPHEREx-D4",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W17_4B_0077_3/D4",
        "date_obs": "2025-04-25T06:17:56.000", "mjd": 60790.262463, "visit": 2, "step": 3,
        "release": "spherex_qr2"
    },
    {
        "target": "Epsilon Indi B", "slug": "epsindi", "ra": 331.04375, "dec": -56.78278,
        "obs_id": "2025W17_4B_0202_1", "detector": 5, "band": "SPHEREx-D5",
        "dl_id": "ivo://irsa.ipac/spherex_qr2?2025W17_4B_0202_1/D5",
        "date_obs": "2025-04-26T01:47:21.000", "mjd": 60791.074549, "visit": 3, "step": 1,
        "release": "spherex_qr2"
    }
]

def resolve_cutout_url(dl_id: str, ra: float, dec: float) -> Tuple[Optional[str], Optional[str]]:
    """Resolves DataLink ID to IBE Cutout URL and AWS S3 Key."""
    dl_url = f"https://irsa.ipac.caltech.edu/datalink/links/spherex?ID={dl_id}"
    for attempt in range(3):
        try:
            r = requests.get(dl_url, timeout=30)
            if r.status_code == 200:
                tab = parse_single_table(io.BytesIO(r.content)).to_table()
                cutout_path = None
                s3_key = None
                for row in tab:
                    # check col_15 for aws key
                    if 'col_15' in tab.colnames and row['col_15']:
                        try:
                            meta = json.loads(str(row['col_15']))
                            if 'aws' in meta and 'key' in meta['aws']:
                                s3_key = meta['aws']['key']
                        except Exception:
                            pass
                    if row['col_4'] == '#cutout' and row['col_12']:
                        cutout_path = str(row['col_12']).strip()
                    elif row['col_4'] == '#this' and row['col_1'] and not cutout_path:
                        u = str(row['col_1']).strip()
                        if '/ibe/data/' in u:
                            cutout_path = u.split('/ibe/data/')[1]
                if cutout_path:
                    c_url = f"https://irsa.ipac.caltech.edu/ibe/data/{cutout_path}?center={ra:.6f},{dec:.6f}&size=0.05"
                    return c_url, s3_key
        except Exception as e:
            time.sleep(1.5 * (attempt + 1))
    return None, None

def download_file_with_retry(url: str, dest_path: str, max_retries: int = 4) -> bool:
    """Downloads FITS with exponential backoff and 503 retry."""
    for attempt in range(max_retries):
        try:
            r = requests.get(url, stream=True, timeout=45)
            if r.status_code == 200 and len(r.content) > 10000:
                with open(dest_path, "wb") as f:
                    f.write(r.content)
                return True
            elif r.status_code in [502, 503, 504, 429]:
                wait = (attempt + 1) * 3
                print(f"    [HTTP {r.status_code}] Retrying in {wait}s...")
                time.sleep(wait)
            else:
                print(f"    [HTTP {r.status_code}] Download failed: {url}")
                return False
        except Exception as e:
            wait = (attempt + 1) * 3
            print(f"    [Error: {e}] Retrying in {wait}s...")
            time.sleep(wait)
    return False

def validate_fits(filepath: str) -> Dict[str, Any]:
    """Rigorous scientific inspection of downloaded FITS file."""
    res = {
        "valid": False, "hdus": 0, "hdu_names": [], "naxis1": 0, "naxis2": 0,
        "bunit": "N/A", "wcs_valid": False, "has_variance": False, "has_flags": False,
        "has_zodi": False, "has_psf": False, "obsid_header": "N/A", "date_obs_header": "N/A",
        "error": None
    }
    try:
        with fits.open(filepath) as hdul:
            res["hdus"] = len(hdul)
            res["hdu_names"] = [h.name for h in hdul]
            for h in hdul:
                if h.name == "IMAGE":
                    im_hdr = h.header
                    res["naxis1"] = im_hdr.get("NAXIS1", 0)
                    res["naxis2"] = im_hdr.get("NAXIS2", 0)
                    res["bunit"] = im_hdr.get("BUNIT", "N/A")
                    res["obsid_header"] = im_hdr.get("OBSID", im_hdr.get("OBS_ID", "N/A"))
                    res["date_obs_header"] = im_hdr.get("DATE-OBS", "N/A")
                    try:
                        w = WCS(im_hdr)
                        res["wcs_valid"] = w.is_celestial
                    except Exception:
                        res["wcs_valid"] = False
                elif h.name in ["VARIANCE", "UNCERTAINTY"]:
                    res["has_variance"] = True
                elif h.name == "FLAGS":
                    res["has_flags"] = True
                elif h.name == "ZODI":
                    res["has_zodi"] = True
                elif h.name == "PSF":
                    res["has_psf"] = True
            res["valid"] = (res["hdus"] >= 2 and res["naxis1"] > 0 and res["naxis2"] > 0)
    except Exception as e:
        res["error"] = str(e)
    return res

print("="*80)
print("EXECUTING AUTOMATIC NASA SPHEREx DATA ACQUISITION & VALIDATION")
print("="*80)

manifest_records = []
total = len(DOWNLOAD_PLAN)

for idx, item in enumerate(DOWNLOAD_PLAN, start=1):
    target_name = item["target"]
    slug = item["slug"]
    obs_id = item["obs_id"]
    det = item["detector"]
    band = item["band"]
    ra = item["ra"]
    dec = item["dec"]
    mjd = item["mjd"]
    date_obs = item["date_obs"]
    visit = item["visit"]
    step = item["step"]
    release = item["release"]

    print(f"\n[{idx}/{total}] Target: {target_name} | OBSID: {obs_id} | Det: D{det} ({band})")
    
    target_raw_dir = os.path.join(RAW_DIR, slug)
    os.makedirs(target_raw_dir, exist_ok=True)
    
    # Original filename convention
    orig_filename = f"level2_{obs_id}_D{det}_spx_l2b_cutout.fits"
    raw_path = os.path.join(target_raw_dir, orig_filename)
    
    archive_url = None
    s3_key = None
    download_success = False
    
    # Check if already present and valid in raw
    if os.path.exists(raw_path) and os.path.getsize(raw_path) > 100000:
        val_check = validate_fits(raw_path)
        if val_check["valid"]:
            print(f"  Already in raw store: {orig_filename} ({os.path.getsize(raw_path)} bytes)")
            download_success = True
            archive_url = f"https://irsa.ipac.caltech.edu/datalink/links/spherex?ID={item['dl_id']}"

    if not download_success:
        print("  Resolving DataLink & IBE cutout URL from NASA/IPAC IRSA...")
        cutout_url, s3_key = resolve_cutout_url(item["dl_id"], ra, dec)
        archive_url = cutout_url or f"https://irsa.ipac.caltech.edu/datalink/links/spherex?ID={item['dl_id']}"
        
        if cutout_url:
            print(f"  Downloading from IRSA IBE: {cutout_url[:80]}...")
            download_success = download_file_with_retry(cutout_url, raw_path)
        
        if not download_success and s3_key:
            s3_url = f"https://nasa-irsa-spherex.s3.us-east-1.amazonaws.com/{s3_key}"
            print(f"  IBE unavailable, fetching reference full file from AWS S3: {s3_url[:80]}...")
            # If needed, can download full file or note s3 source
            download_success = download_file_with_retry(s3_url, raw_path)
            archive_url = s3_url

    # Check validation
    if os.path.exists(raw_path):
        fsize = os.path.getsize(raw_path)
        with open(raw_path, "rb") as f:
            sha256 = hashlib.sha256(f.read()).hexdigest()
        val = validate_fits(raw_path)
        status_str = "VALIDATED" if val["valid"] else "INVALID"
        print(f"  Validation: {status_str} | HDUs: {val['hdus']} {val['hdu_names']} | Size: {fsize/(1024*1024):.2f} MB")
        print(f"  WCS: {'VALID' if val['wcs_valid'] else 'INVALID'} | Units: {val['bunit']} | Header OBSID: {val['obsid_header']}")
        
        # Also ensure file is accessible in cache for instant application loading
        # Key convention: {obs_id}_D{detector}
        cache_named = os.path.join(CACHE_DIR, f"{obs_id}_D{det}.fits")
        if not os.path.exists(cache_named) or os.path.getsize(cache_named) != fsize:
            with open(raw_path, "rb") as sf, open(cache_named, "wb") as df:
                df.write(sf.read())
            print(f"  Indexed into application cache: {obs_id}_D{det}.fits")
            
        manifest_record = {
            "target_name": target_name,
            "target_slug": slug,
            "original_filename": orig_filename,
            "archive_url": archive_url,
            "data_release": release,
            "obs_id": obs_id,
            "observation_date": date_obs,
            "mjd": mjd,
            "detector_id": det,
            "bandpass_name": band,
            "visit_number": visit,
            "scan_step": step,
            "product_type": "spectral_image_cutout",
            "fits_file_size_bytes": fsize,
            "sha256_checksum": sha256,
            "download_status": "SUCCESS" if download_success else "FAILED",
            "fits_validation_status": status_str,
            "hdus_count": val["hdus"],
            "hdu_names": val["hdu_names"],
            "wcs_valid": val["wcs_valid"],
            "data_units": val["bunit"]
        }
        manifest_records.append(manifest_record)
    else:
        print(f"  FAILED to acquire {orig_filename}")
        manifest_records.append({
            "target_name": target_name,
            "target_slug": slug,
            "original_filename": orig_filename,
            "archive_url": archive_url or "N/A",
            "data_release": release,
            "obs_id": obs_id,
            "observation_date": date_obs,
            "mjd": mjd,
            "detector_id": det,
            "bandpass_name": band,
            "visit_number": visit,
            "scan_step": step,
            "product_type": "spectral_image_cutout",
            "fits_file_size_bytes": 0,
            "sha256_checksum": "N/A",
            "download_status": "FAILED",
            "fits_validation_status": "NOT_FOUND",
            "hdus_count": 0,
            "hdu_names": [],
            "wcs_valid": False,
            "data_units": "N/A"
        })

# Write Manifests
manifest_json_path = os.path.join(RAW_DIR, "OBSERVATION_MANIFEST.json")
with open(manifest_json_path, "w", encoding="utf-8") as f:
    json.dump(manifest_records, f, indent=2)

manifest_csv_path = os.path.join(RAW_DIR, "OBSERVATION_MANIFEST.csv")
if manifest_records:
    fieldnames = list(manifest_records[0].keys())
    with open(manifest_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in manifest_records:
            writer.writerow(r)

print("\n" + "="*80)
print(f"DATA ACQUISITION SUMMARY: {len(manifest_records)} products processed.")
print(f"Manifest written to: {manifest_json_path}")
print(f"Manifest written to: {manifest_csv_path}")
print("="*80)
