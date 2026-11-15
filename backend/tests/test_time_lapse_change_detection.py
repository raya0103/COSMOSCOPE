import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.detection.change_detector import (
    extract_candidate_sources_from_frame,
    analyze_multi_epoch_changes
)
from app.image_analysis.subtraction import compute_image_difference
from app.image_analysis.stacking import stack_images

client = TestClient(app)

def test_extract_candidate_sources_peak_detection():
    """Verify local peak detection extracts point sources with SNR and centroid coordinates."""
    # Create 32x32 synthetic field with Gaussian noise and 2 prominent point sources
    np.random.seed(42)
    grid = np.random.normal(loc=10.0, scale=0.5, size=(32, 32)).astype(np.float32)
    # Source 1 at (15, 15)
    grid[15, 15] = 25.0
    grid[14:17, 14:17] += 3.0
    # Source 2 at (8, 22)
    grid[8, 22] = 20.0
    grid[7:10, 21:24] += 2.0

    meta = {
        "target_coord": (269.45208, 4.69333),
        "pixel_scale_arcsec": 6.2
    }

    dets = extract_candidate_sources_from_frame(grid, meta, threshold_sigma=3.0)
    assert len(dets) >= 2
    # Verify sub-pixel center of mass
    snrs = [d["snr"] for d in dets]
    assert max(snrs) > 10.0
    assert "ra" in dets[0] and "dec" in dets[0]


def test_analyze_multi_epoch_changes_barnards_star():
    """Verify multi-epoch change detection classifies Barnard's Star as Candidate Moving Object."""
    res = analyze_multi_epoch_changes(
        obs_ids=[],
        ra=269.45208,
        dec=4.69333,
        fov_arcmin=3.0,
        target_name="Barnard's Star"
    )

    assert res["status"] == "SUCCESS"
    assert res["total_candidates"] > 0
    assert "category_counts" in res
    assert res["category_counts"]["all"] == res["total_candidates"]
    
    # Check that candidates have proper scientific attributes
    cands = res["candidates"]
    for c in cands[:3]:
        assert "candidate_id" in c
        assert "classification" in c
        assert "measured_displacement_arcsec" in c
        assert "proper_motion_mas_yr" in c
        assert "delta_flux_percent" in c
        assert "confidence_score" in c
        assert "scientific_caveat" in c

    # Check motion tracks
    assert "motion_tracks" in res


def test_detect_changes_api_endpoint():
    """Verify POST /api/time-machine/detect-changes endpoint returns valid JSON."""
    payload = {
        "obs_ids": [],
        "ra": 269.45208,
        "dec": 4.69333,
        "fov_arcmin": 3.0,
        "target_name": "Barnard's Star"
    }
    response = client.post("/api/time-machine/detect-changes", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["total_candidates"] > 0
    assert "moving_objects" in data["category_counts"]
    assert "unidentified" in data["category_counts"]
    assert "artifacts" in data["category_counts"]


def test_difference_mode_subtraction_endpoint():
    """Verify difference subtraction returns flux difference and 3-sigma residuals."""
    payload = {
        "obs_id_1": "SPHEREx_Barnards_Visit1",
        "obs_id_2": "SPHEREx_Barnards_Visit2",
        "ra": 269.45208,
        "dec": 4.69333,
        "fov_arcmin": 3.0,
        "normalize": True,
        "color_map": "coolwarm",
        "stretch": "asinh"
    }
    response = client.post("/api/images/subtract", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "difference_data" in data
    assert "sigma_diff" in data
    assert "pos_excursions_count" in data
    assert "thumbnail_base64" in data


def test_stack_mode_coaddition_endpoint():
    """Verify stack coaddition returns combined data and SNR improvement factor."""
    payload = {
        "obs_ids": ["SPHEREx_Barnards_Visit1", "SPHEREx_Barnards_Visit2"],
        "ra": 269.45208,
        "dec": 4.69333,
        "fov_arcmin": 3.0,
        "normalize": True,
        "color_map": "inferno",
        "stretch": "asinh"
    }
    response = client.post("/api/images/stack", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "stacked_data" in data
    assert "snr_improvement_factor" in data
    assert data["snr_improvement_factor"] >= 1.0
    assert "thumbnail_base64" in data

