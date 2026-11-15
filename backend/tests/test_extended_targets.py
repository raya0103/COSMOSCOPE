"""
Unit and integration tests for COSMOSCOPE Extended Astronomical Catalog.
Verifies the preservation of the 5 challenge targets and authentic properties
of the 15 newly discovered celestial objects.
"""
import os
import sys
sys.path.insert(0, os.path.abspath("backend"))
sys.path.insert(0, os.path.abspath("."))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.fits_processing.extended_targets import (
    EXTENDED_ASTRONOMICAL_CATALOG,
    CHALLENGE_TARGETS,
    TARGETS_BY_ID,
    get_targets,
    get_target_by_id
)
from app.fits_processing.coordinates import (
    CHALLENGE_TARGETS_CATALOG,
    identify_object_by_coordinates,
    resolve_target_name
)
from app.data_access.irsa_client import search_spherex_observations

client = TestClient(app)

def test_catalog_structure_and_counts():
    """Verify catalog has exactly 20 targets and 5 challenge targets."""
    assert len(EXTENDED_ASTRONOMICAL_CATALOG) == 20
    assert len(CHALLENGE_TARGETS) == 5
    assert len(CHALLENGE_TARGETS_CATALOG) == 5

    # Check that the 5 challenge targets are first and retain their exact IDs
    expected_challenge_ids = ["barnards-star", "epsilon-indi-b", "wise-0855", "rw-aurigae", "r-draconis"]
    actual_challenge_ids = [t["id"] for t in EXTENDED_ASTRONOMICAL_CATALOG if t["is_challenge_target"]]
    assert actual_challenge_ids == expected_challenge_ids

def test_challenge_targets_astrometric_integrity():
    """Ensure coordinates of the 5 original challenge targets are unchanged."""
    expected_coords = {
        "barnards-star": (269.45208, 4.69333),
        "epsilon-indi-b": (331.04375, -56.78278),
        "wise-0855": (133.79513, -7.24515),
        "rw-aurigae": (76.95642, 30.40142),
        "r-draconis": (248.16750, 66.75500),
    }
    for tid, (exp_ra, exp_dec) in expected_coords.items():
        target = TARGETS_BY_ID[tid]
        assert abs(target["ra_deg"] - exp_ra) < 1e-4
        assert abs(target["dec_deg"] - exp_dec) < 1e-4
        assert target["is_challenge_target"] is True

def test_extended_targets_categories_and_fields():
    """Ensure all 20 targets have valid scientific properties and provenances."""
    valid_categories = {"stars", "brown_dwarfs", "ysos", "variables", "nebulae_extragalactic"}
    valid_statuses = {"VERIFIED MULTI-EPOCH COVERAGE", "VERIFIED SPHEREx COVERAGE", "CATALOGUE MATCH ONLY"}

    for t in EXTENDED_ASTRONOMICAL_CATALOG:
        assert t["category"] in valid_categories
        assert t["status"] in valid_statuses
        assert 0.0 <= t["ra_deg"] <= 360.0
        assert -90.0 <= t["dec_deg"] <= 90.0
        assert len(t["detectors"]) > 0
        assert t["badge"]
        assert t["scientific_significance"]
        assert "provenance" in t
        assert t["provenance"].get("ads_bibcode") or t["provenance"].get("primary_catalog")

def test_coordinate_identification_challenge_targets():
    """Verify identify_object_by_coordinates flags challenge targets correctly."""
    ident = identify_object_by_coordinates(269.45208, 4.69333, matching_radius_arcsec=60.0)
    assert ident["matched"] is True
    assert ident["target_name"] == "Barnard's Star"
    assert ident["is_challenge_target"] is True
    assert ident["target_id"] == "barnards-star"

def test_coordinate_identification_extended_targets():
    """Verify identify_object_by_coordinates correctly matches new targets."""
    # Test Proxima Centauri
    ident_prox = identify_object_by_coordinates(217.42894, -62.67949, matching_radius_arcsec=60.0)
    assert ident_prox["matched"] is True
    assert ident_prox["target_name"] == "Proxima Centauri"
    assert ident_prox["is_challenge_target"] is False
    assert ident_prox["target_id"] == "proxima-centauri"

    # Test Luhman 16
    ident_luh = identify_object_by_coordinates(162.32875, -53.31944, matching_radius_arcsec=60.0)
    assert ident_luh["matched"] is True
    assert ident_luh["target_name"] == "Luhman 16"
    assert ident_luh["category"] == "brown_dwarfs"

    # Test Mira
    ident_mira = identify_object_by_coordinates(32.88225, -2.97744, matching_radius_arcsec=60.0)
    assert ident_mira["matched"] is True
    assert ident_mira["target_name"] == "Mira"
    assert ident_mira["category"] == "variables"

def test_resolve_target_name_offline_extended_catalog():
    """Verify target name resolver handles new target names and designations."""
    # Resolve by name
    res = resolve_target_name("Proxima Centauri")
    assert res is not None
    assert abs(res[0] - 217.42894) < 1e-3

    # Resolve by alternate designation
    res_alt = resolve_target_name("WISE J1049-5319")
    assert res_alt is not None
    assert abs(res_alt[0] - 162.32875) < 1e-3

    # Resolve YSO
    res_yso = resolve_target_name("HL Tauri")
    assert res_yso is not None
    assert abs(res_yso[0] - 67.87417) < 1e-3

def test_observation_search_extended_targets():
    """Verify observation retrieval generates authentic records for new targets."""
    # Proxima Centauri
    obs_prox = search_spherex_observations(217.42894, -62.67949)
    assert len(obs_prox) > 0
    assert obs_prox[0]["detector"] in [1, 2, 3]
    assert obs_prox[0]["obs_collection"] == "spherex_qr2"

    # HL Tauri
    obs_hl = search_spherex_observations(67.87417, 18.23250)
    assert len(obs_hl) > 0
    assert obs_hl[0]["detector"] in [1, 2, 3, 4, 5]

    # Mira
    obs_mira = search_spherex_observations(32.88225, -2.97744)
    assert len(obs_mira) > 0
    assert any(o["detector"] == 6 for o in obs_mira)

def test_api_targets_endpoint_all_and_filtering():
    """Verify /api/targets endpoint returns full catalog and respects query parameters."""
    # 1. Default: returns all 20 targets
    resp = client.get("/api/targets")
    assert resp.status_code == 200
    targets = resp.json()
    assert len(targets) == 20

    # 2. Challenge Only filter
    resp_chal = client.get("/api/targets?challenge_only=true")
    assert resp_chal.status_code == 200
    chal_targets = resp_chal.json()
    assert len(chal_targets) == 5
    assert all(t["is_challenge_target"] for t in chal_targets)

    # 3. Category filter
    resp_bd = client.get("/api/targets?category=brown_dwarfs")
    assert resp_bd.status_code == 200
    bd_targets = resp_bd.json()
    assert len(bd_targets) == 5
    assert all(t["category"] == "brown_dwarfs" for t in bd_targets)

    # 4. Target ID query
    resp_single = client.get("/api/targets?target_id=proxima-centauri")
    assert resp_single.status_code == 200
    single = resp_single.json()
    assert single["id"] == "proxima-centauri"
    assert single["name"] == "Proxima Centauri"

def test_api_coordinates_identify_extended():
    """Verify /api/coordinates/identify returns extended target metadata."""
    resp = client.get("/api/coordinates/identify?ra=162.32875&dec=-53.31944&radius_arcsec=60")
    assert resp.status_code == 200
    data = resp.json()
    assert data["matched"] is True
    assert data["target_name"] == "Luhman 16"
    assert data["category"] == "brown_dwarfs"
