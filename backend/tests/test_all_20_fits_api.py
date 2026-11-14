import json
import requests
import base64

BASE_URL = "http://127.0.0.1:8000/api"

def test_all_20_products():
    with open("backend/data/raw/spherex/OBSERVATION_MANIFEST.json", "r") as f:
        manifest = json.load(f)
        
    print(f"=================================================================")
    print(f"TESTING ALL {len(manifest)} GENUINE FITS PRODUCTS VIA APPLICATION API")
    print(f"=================================================================\n")
    
    target_coords = {
        "R Draconis": {"ra": 248.16750, "dec": 66.75500},
        "Barnard's Star": {"ra": 269.45208, "dec": 4.69333},
        "WISE 0855-0714": {"ra": 133.79513, "dec": -7.24515},
        "RW Aurigae": {"ra": 76.95642, "dec": 30.40142},
        "Epsilon Indi B": {"ra": 331.04375, "dec": -56.78278}
    }
    
    results = []
    
    for i, p in enumerate(manifest, 1):
        target = p["target_name"]
        coords = target_coords[target]
        obs_id = p["obs_id"]
        det = p["detector_id"]
        fname = p["original_filename"]
        
        # Test endpoint /api/images/{obs_id}
        url = f"{BASE_URL}/images/{obs_id}"
        params = {
            "ra": coords["ra"],
            "dec": coords["dec"],
            "detector": det,
            "fov_arcmin": 3.0,
            "stretch": "asinh",
            "colormap": "inferno"
        }
        
        resp = requests.get(url, params=params)
        assert resp.status_code == 200, f"Failed for {fname}: {resp.status_code} - {resp.text}"
        data = resp.json()
        
        # Assertions
        assert data.get("is_valid") is True, f"is_valid false for {fname}"
        assert data.get("detector") == det, f"Detector mismatch for {fname}: {data.get('detector')} != {det}"
        assert data.get("bunit") == "MJy / sr", f"BUNIT mismatch: {data.get('bunit')}"
        assert len(data.get("shape", [])) == 2, f"Shape invalid: {data.get('shape')}"
        assert data.get("thumbnail_base64"), f"Missing thumbnail for {fname}"
        
        # Verify base64 image content
        b64_str = data["thumbnail_base64"]
        if "," in b64_str:
            b64_str = b64_str.split(",", 1)[1]
        thumb_bytes = base64.b64decode(b64_str)
        assert len(thumb_bytes) > 500, f"Thumbnail too small for {fname}"
        assert thumb_bytes[:8] == b'\x89PNG\r\n\x1a\n', f"Not a valid PNG for {fname}"
        
        md5 = data.get("checksum_md5", "N/A")
        peak_snr = data.get("peak_snr", 0.0)
        c_px = data.get("measured_centroid_px", {})
        date_obs = data.get("date_obs", "")
        
        results.append({
            "idx": i,
            "target": target,
            "filename": fname,
            "obs_id": obs_id,
            "detector": f"D{det}",
            "date_obs": date_obs,
            "shape": data["shape"],
            "bunit": data["bunit"],
            "md5": md5[:8],
            "peak_snr": peak_snr,
            "centroid": f"({c_px.get('x')}, {c_px.get('y')})",
            "png_bytes": len(thumb_bytes),
            "status": "PASS"
        })
        
        print(f"[{i:2d}/20 PASS] {target:15s} | {fname:45s} | Det: D{det} | Date: {date_obs[:19]} | Shape: {str(data['shape']):8s} | SNR: {peak_snr:6.1f} | Centroid: ({c_px.get('x')}, {c_px.get('y')}) | MD5: {md5[:8]}")

    print(f"\n=================================================================")
    print(f"SUCCESS: ALL 20/20 GENUINE FITS PRODUCTS VALIDATED THROUGH API")
    print(f"=================================================================")
    
    with open("backend/tests/all_20_fits_api_results.json", "w") as out_f:
        json.dump(results, out_f, indent=2)

if __name__ == "__main__":
    test_all_20_products()
