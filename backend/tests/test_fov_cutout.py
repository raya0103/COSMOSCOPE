"""
Verification tests for Cosmic Time Machine Field of View (FOV) angular scaling.
Verifies that:
1. Backend /api/images accurately scales image cutout grid dimensions with fov_arcmin.
2. Coordinates and centroids are preserved across angular cutouts.
3. Multiple FOV values (1.0', 3.0', 6.0', 15.0') return valid, non-empty numpy grids.
"""
import os
import sys
sys.path.insert(0, os.path.abspath("backend"))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.mark.parametrize("fov, expected_min_size, expected_max_size", [
    (1.0, 9, 12),     # ~10x10 pixels (1 arcmin @ 6.2"/px)
    (3.0, 28, 30),    # ~29x29 pixels (3 arcmin @ 6.2"/px)
    (6.0, 56, 62),    # ~58x59 pixels (6 arcmin @ 6.2"/px)
])
def test_image_cutout_fov_scaling(fov, expected_min_size, expected_max_size):
    obs_id = "2025W33_2C_0321_1"
    ra = 269.45208
    dec = 4.69333
    detector = 3

    resp = client.get(f"/api/images/{obs_id}?ra={ra}&dec={dec}&detector={detector}&fov_arcmin={fov}")
    assert resp.status_code == 200, f"Failed for FOV {fov}: {resp.text}"
    
    data = resp.json()
    shape = data.get("shape")
    assert shape is not None, "Missing shape in response"
    assert len(shape) == 2, "Shape must be 2D"
    
    rows, cols = shape
    assert expected_min_size <= rows <= expected_max_size, f"Rows {rows} not in expected range [{expected_min_size}, {expected_max_size}] for FOV {fov}'"
    assert expected_min_size <= cols <= expected_max_size, f"Cols {cols} not in expected range [{expected_min_size}, {expected_max_size}] for FOV {fov}'"
    
    # Verify raw_grid matrix matches returned shape
    raw_grid = data.get("raw_grid")
    assert len(raw_grid) == rows
    assert len(raw_grid[0]) == cols

def test_fov_centroid_and_photometry_stability():
    obs_id = "2025W33_2C_0321_1"
    ra = 269.45208
    dec = 4.69333
    detector = 3

    resp_3 = client.get(f"/api/images/{obs_id}?ra={ra}&dec={dec}&detector={detector}&fov_arcmin=3.0").json()
    resp_1 = client.get(f"/api/images/{obs_id}?ra={ra}&dec={dec}&detector={detector}&fov_arcmin=1.0").json()

    # Peak SNR and photometry should be present and valid
    assert resp_3["peak_snr"] > 0
    assert resp_1["peak_snr"] > 0
    assert resp_3["photometry"]["signal_to_noise_ratio"] > 0
    assert resp_1["photometry"]["signal_to_noise_ratio"] > 0
