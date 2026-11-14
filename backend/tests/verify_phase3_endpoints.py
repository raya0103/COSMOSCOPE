import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

TARGETS = [
    {"name": "Barnard's Star", "ra": 269.45208, "dec": 4.69333},
    {"name": "Epsilon Indi B", "ra": 331.04375, "dec": -56.78278},
    {"name": "WISE 0855", "ra": 133.79513, "dec": -7.24515},
    {"name": "RW Aurigae", "ra": 76.95642, "dec": 30.40142},
    {"name": "R Draconis", "ra": 248.16750, "dec": 66.75500},
]

def test_endpoints():
    print("Testing Backend Endpoints for all 5 targets...")
    for t in TARGETS:
        print(f"\n--- Target: {t['name']} (RA: {t['ra']}, Dec: {t['dec']}) ---")
        
        # 1. Search Observations
        resp = requests.post(f"{BASE_URL}/observations/search", json={"ra": t["ra"], "dec": t["dec"], "fov_arcmin": 3.0, "target_name": t["name"]})
        assert resp.status_code == 200, f"Failed search: {resp.text}"
        data = resp.json()
        n_obs = len(data.get("observations", []))
        print(f"  [1] /observations/search -> {n_obs} observations found (can_compare={data.get('can_compare')})")
        assert n_obs >= 4, f"Expected at least 4 observations for {t['name']}, found {n_obs}"
        
        # Test first observation image cutout
        first_obs = data["observations"][0]
        obs_id = first_obs["obs_id"]
        det = first_obs["detector"]
        img_resp = requests.get(f"{BASE_URL}/images/{obs_id}", params={"ra": t["ra"], "dec": t["dec"], "fov_arcmin": 3.0, "detector": det})
        assert img_resp.status_code == 200, f"Failed image fetch for {obs_id}: {img_resp.text}"
        img_data = img_resp.json()
        print(f"  [2] /images/{obs_id} (D{det}) -> shape: {img_data.get('shape')}, BUNIT: {img_data.get('bunit')}, thumbnail_base64: {bool(img_data.get('thumbnail_base64'))}")
        assert img_data.get("is_valid") is True, f"Image {obs_id} is not marked valid"
        
        # 2. Test Time Machine Analytics
        tm_resp = requests.get(f"{BASE_URL}/time-machine/analytics", params={"ra": t["ra"], "dec": t["dec"], "target_name": t["name"], "mode": "spherex"})
        assert tm_resp.status_code == 200, f"Failed tm analytics: {tm_resp.text}"
        tm_data = tm_resp.json()
        print(f"  [3] /time-machine/analytics -> {len(tm_data.get('time_series', []))} time series points, proper_motion: {tm_data.get('proper_motion_arcsec_yr')}\"/yr")
        
        # 3. Test Multi-Mission View
        mm_resp = requests.get(f"{BASE_URL}/time-machine/multimission", params={"ra": t["ra"], "dec": t["dec"], "target_name": t["name"]})
        assert mm_resp.status_code == 200, f"Failed multimission: {mm_resp.text}"
        mm_data = mm_resp.json()
        print(f"  [4] /timemachine/multimission -> {len(mm_data.get('epochs', []))} multi-mission epochs")
        
        # 4. Test Spectrum Extraction
        spec_resp = requests.post(f"{BASE_URL}/spectra/extract", json={"ra": t["ra"], "dec": t["dec"], "fov_arcmin": 3.0, "target_name": t["name"]})
        assert spec_resp.status_code == 200, f"Failed spectra extract: {spec_resp.text}"
        spec_data = spec_resp.json()
        n_meas = sum(1 for ch in spec_data.get("spectrum", []) if ch.get("is_direct_observation"))
        print(f"  [5] /spectra/extract -> {len(spec_data.get('spectrum', []))} channels ({n_meas} measured detector bands)")
        
    # 5. Test Image Subtraction
    print("\n--- Testing Image Subtraction Engine ---")
    sub_payload = {
        "ra": 248.16750,
        "dec": 66.75500,
        "fov_arcmin": 3.0,
        "obs_id_1": "SPHEREX_QR2_20250424_023329_D1",
        "obs_id_2": "SPHEREX_QR2_20250506_023329_D1",
        "stretch": "asinh",
        "color_map": "inferno",
        "normalize": True
    }
    sub_resp = requests.post(f"{BASE_URL}/images/subtract", json=sub_payload)
    assert sub_resp.status_code == 200, f"Failed subtraction: {sub_resp.text}"
    sub_data = sub_resp.json()
    print(f"  Subtraction successful: scale_factor={sub_data.get('scale_factor_applied')}, sigma={sub_data.get('sigma_noise')}, pos_peaks={sub_data.get('pos_residual_pixels')}, status={sub_data.get('compatibility_status')}")

    # 6. Test Image Stacking
    print("\n--- Testing Image Coaddition / Stacking Engine ---")
    stack_payload = {
        "obs_id_1": "SPHEREX_QR2_20250424_023329_D1",
        "ra": 248.16750,
        "dec": 66.75500,
        "fov_arcmin": 3.0,
        "obs_ids": ["SPHEREX_QR2_20250424_023329_D1", "SPHEREX_QR2_20250506_023329_D1"],
        "stretch": "asinh",
        "color_map": "inferno"
    }
    stack_resp = requests.post(f"{BASE_URL}/images/stack", json=stack_payload)
    assert stack_resp.status_code == 200, f"Failed stacking: {stack_resp.text}"
    stack_data = stack_resp.json()
    print(f"  Stacking successful: n_frames={stack_data.get('n_frames_combined')}, snr_gain={stack_data.get('snr_gain_factor')}x, status={stack_data.get('compatibility_status')}")

    print("\nALL 5 TARGETS AND SCIENTIFIC ENGINES VALIDATED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
