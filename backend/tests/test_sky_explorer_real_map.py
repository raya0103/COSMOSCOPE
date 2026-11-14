"""
Automated Test Suite for Sky Explorer Real Sky Map & Object Identification.
Verifies all 12 test scenarios:
1. Challenge Targets: Barnard's Star, Epsilon Indi B, WISE 0855, RW Aurigae, R Draconis.
2. Manual coordinate matching within 0.08 deg angular tolerance.
3. Distinguishing arbitrary field coordinates from challenge targets.
4. Known catalogue reference objects (Vega, M31, M101, etc.).
5. Unidentified sky positions (honest zero-fabrication fallback).
6. Coordinate identify API endpoint (/api/coordinates/identify).
7. Observation search coordinate-to-target resolution.
"""
import os
import sys
sys.path.insert(0, os.path.abspath("backend"))
sys.path.insert(0, os.path.abspath("."))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.fits_processing.coordinates import (
    identify_object_by_coordinates,
    match_challenge_target,
    angular_separation_arcsec,
    CHALLENGE_TARGETS_CATALOG
)

client = TestClient(app)

def test_five_challenge_targets_exact_coords():
    """Scenario 1-5: Exact coordinates for all 5 challenge targets must resolve correctly."""
    targets = [
        ("barnards-star", "Barnard's Star", 269.45208, 4.69333),
        ("epsilon-indi-b", "Epsilon Indi B", 331.04375, -56.78278),
        ("wise-0855", "WISE 0855", 133.79513, -7.24515),
        ("rw-aurigae", "RW Aurigae", 76.95642, 30.40142),
        ("r-draconis", "R Draconis", 248.16750, 66.75500),
    ]
    for tid, name, ra, dec in targets:
        match = match_challenge_target(ra, dec, tolerance_deg=0.08)
        assert match is not None, f"Failed to match challenge target {name}"
        assert match["id"] == tid
        assert match["name"] == name
        assert match["separation_arcsec"] < 1.0

        # Test through identify_object_by_coordinates
        ident = identify_object_by_coordinates(ra, dec)
        assert ident["matched"] is True
        assert ident["is_challenge_target"] is True
        assert ident["target_id"] == tid
        assert ident["designation"] == name

def test_manual_coordinate_matching_with_rounding():
    """Scenario 6: Slightly rounded manual coordinates must match the challenge target."""
    # Barnard's Star rounded to 2 decimal places: (269.45, 4.69)
    # True coords: (269.45208, 4.69333) -> offset ~14 arcsec << 288 arcsec tolerance
    ident = identify_object_by_coordinates(269.45, 4.69)
    assert ident["matched"] is True
    assert ident["is_challenge_target"] is True
    assert ident["target_id"] == "barnards-star"
    assert ident["separation_arcsec"] < 20.0

    # R Draconis rounded to 2 decimal places: (248.17, 66.76)
    ident_r = identify_object_by_coordinates(248.17, 66.76)
    assert ident_r["matched"] is True
    assert ident_r["is_challenge_target"] is True
    assert ident_r["target_id"] == "r-draconis"

def test_manual_coordinate_outside_tolerance():
    """Coordinates outside the 0.08 deg tolerance must NOT snap to a challenge target."""
    # 0.5 degrees away from Barnard's Star
    ident = identify_object_by_coordinates(269.45208 + 0.5, 4.69333)
    assert ident["is_challenge_target"] is False
    assert ident["target_id"] != "barnards-star"

def test_recognised_catalogue_object():
    """Scenario 7: Recognized non-challenge objects (e.g. Vega, Andromeda Galaxy M31)."""
    # Vega: RA 279.23473, Dec 38.78369
    ident_vega = identify_object_by_coordinates(279.23473, 38.78369, matching_radius_arcsec=60.0)
    assert ident_vega["matched"] is True
    assert ident_vega["is_challenge_target"] is False
    assert "Vega" in ident_vega["designation"]
    assert "SIMBAD" in ident_vega["identification_source"]

    # M31 Andromeda: RA 10.68471, Dec 41.26875
    ident_m31 = identify_object_by_coordinates(10.68471, 41.26875, matching_radius_arcsec=60.0)
    assert ident_m31["matched"] is True
    assert "M31" in ident_m31["designation"]

def test_unidentified_field_position():
    """Scenario 8: Coordinates without recognized catalogue matches must report Unidentified position."""
    # Deep empty sky field: RA 15.0, Dec 15.0
    ident = identify_object_by_coordinates(15.0, 15.0, matching_radius_arcsec=60.0)
    assert ident["matched"] is False
    assert ident["is_challenge_target"] is False
    assert ident["designation"] == "Unidentified celestial position"
    assert "No recognized catalogue object" in ident["identification_source"]

def test_identify_api_endpoint():
    """Scenario 9: HTTP API GET /api/coordinates/identify."""
    # Challenge target endpoint test
    res = client.get("/api/coordinates/identify?ra=269.45208&dec=4.69333")
    assert res.status_code == 200
    data = res.json()
    assert data["matched"] is True
    assert data["is_challenge_target"] is True
    assert data["designation"] == "Barnard's Star"

    # Out of bounds check
    res_err = client.get("/api/coordinates/identify?ra=400&dec=0")
    assert res_err.status_code == 400

def test_search_observations_automatic_target_resolution():
    """Search SPHEREx observations with coordinates only must automatically identify the target."""
    payload = {"ra": "269.452", "dec": "4.693", "fov_arcmin": 3.0}
    res = client.post("/api/observations/search", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["target"]["is_challenge_target"] is True
    assert data["target"]["target_name"] == "Barnard's Star"
    assert data["total_observations"] > 0
