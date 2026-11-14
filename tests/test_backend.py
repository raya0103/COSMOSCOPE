"""
Automated Integration Tests for SPHEREx EXPLORER Backend.
Verifies API endpoints, database initialization, 102-band spectroscopy,
anomaly intelligence, catalog crossmatching, and PDF export.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.api.routes import (
    get_health,
    get_featured_targets,
    get_candidates,
    search_observations,
    rank_candidate_anomaly,
    crossmatch_catalogues,
    submit_classification,
    _handle_passport_export,
    extract_spectrum
)
from app.models.schemas import CoordinateInput, CitizenClassificationSubmission

def test_api_endpoints():
    print("Starting SPHEREx EXPLORER Backend Integration Tests...")
    
    # 1. Health
    health = get_health()
    assert health["status"] == "online"
    assert health["channels"] == 102
    print("[PASS] 1. /api/health passed")

    # 2. Targets
    targets = get_featured_targets()
    assert len(targets) == 5
    print(f"[PASS] 2. /api/targets passed ({len(targets)} challenge targets)")

    # 3. Candidates
    candidates = get_candidates()
    assert len(candidates) >= 5
    print(f"[PASS] 3. /api/candidates passed ({len(candidates)} candidates in review queue)")

    # 4. Search Observations
    search_res = search_observations(CoordinateInput(ra=269.45208, dec=4.69333, target_name="Barnards Star"))
    assert search_res.total_observations > 0
    print(f"[PASS] 4. /api/observations/search passed ({search_res.total_observations} SPHEREx observations)")

    # 5. Anomaly Ranking
    rank_res = rank_candidate_anomaly(CoordinateInput(ra=269.45208, dec=4.69333, target_name="Barnards Star"))
    assert rank_res["overall_score"] >= 35.0
    print(f"[PASS] 5. /api/discovery/rank passed (Score: {rank_res['overall_score']}, Tier: {rank_res['classification_tier']})")

    # 6. Catalog Crossmatch (Gaia DR3 + AllWISE)
    xmatch_res = crossmatch_catalogues(CoordinateInput(ra=269.45208, dec=4.69333, target_name="Barnards Star"))
    assert xmatch_res["gaia_dr3_count"] > 0
    print(f"[PASS] 6. /api/catalogue/crossmatch passed ({xmatch_res['gaia_dr3_count']} Gaia DR3 sources)")

    # 7. 102-Band Spectral Extraction
    spec_res = extract_spectrum(CoordinateInput(ra=133.79513, dec=-7.24515, target_name="WISE 0855"))
    assert len(spec_res["spectrum"]) == 102
    print(f"[PASS] 7. /api/spectrum/extract passed (102 SPHEREx channels extracted)")

    # 8. Citizen Review Submission
    cand_id = candidates[0]["candidate_id"]
    sub_res = submit_classification(cand_id, CitizenClassificationSubmission(
        candidate_id=cand_id,
        user_identifier="test_astro_verifier",
        is_real_motion=True,
        motion_direction="North-West",
        is_variable_brightness=False,
        is_image_artifact=False,
        confidence_rating=5,
        notes="Verified genuine high proper motion against Gaia DR3 astrometry."
    ))
    assert sub_res["success"] is True
    print(f"[PASS] 8. /api/candidates/{{id}}/classifications passed")

    # 9. Evidence Passport PDF Export
    pdf_res = _handle_passport_export(269.45208, 4.69333, "Barnards Star", 3.0, "pdf")
    assert pdf_res.media_type == "application/pdf"
    assert len(pdf_res.body) > 1000
    print(f"[PASS] 9. /api/reports/export passed ({len(pdf_res.body)} bytes PDF generated)")

    # 10. Light Curve Analytics
    from app.api.routes import get_light_curve_endpoint, get_motion_endpoint, get_spectral_analytics_endpoint, get_anomaly_radar_endpoint
    lc_res = get_light_curve_endpoint(CoordinateInput(ra=248.1675, dec=66.755, target_name="R Draconis"))
    assert len(lc_res["flux_mjy_sr"]) == 24
    assert "Mira" in lc_res["classification"]
    print(f"[PASS] 10. /api/analytics/lightcurve passed ({lc_res['classification']})")

    # 11. Motion Trajectory Analytics
    mot_res = get_motion_endpoint(CoordinateInput(ra=269.45208, dec=4.69333, target_name="Barnards Star"))
    assert mot_res["total_proper_motion_mas_yr"] > 10000.0
    assert len(mot_res["epochs"]) == 13
    print(f"[PASS] 11. /api/analytics/motion passed ({mot_res['total_proper_motion_mas_yr']} mas/yr)")

    # 12. 102-Band Spectrophotometry & Heatmap
    spec_res = get_spectral_analytics_endpoint(CoordinateInput(ra=133.79513, dec=-7.24515, target_name="WISE 0855"))
    assert spec_res["total_channels"] == 102
    assert len(spec_res["heatmap_2d"]) == 6
    print(f"[PASS] 12. /api/analytics/spectrum passed (102 channels, 6x17 heatmap)")

    # 13. Anomaly Radar Profile
    radar_res = get_anomaly_radar_endpoint(CoordinateInput(ra=133.79513, dec=-7.24515, target_name="WISE 0855"))
    assert radar_res["overall_anomaly_score"] > 80.0
    print(f"[PASS] 13. /api/analytics/radar passed (Score: {radar_res['overall_anomaly_score']}/100)")

    # 14. Multi-Mission Historical Time Machine
    from app.api.routes import get_multimission_view, get_image_details, get_time_machine_analytics
    mm_res = get_multimission_view(ra=269.45208, dec=4.69333, target_name="Barnard's Star")
    assert mm_res.total_epochs == 4
    assert mm_res.total_displacement_arcsec > 250.0
    assert "2MASS" in [e.mission for e in mm_res.epochs]
    assert "SPHEREx" in [e.mission for e in mm_res.epochs]
    print(f"[PASS] 14. /api/time-machine/multimission passed ({mm_res.total_epochs} epochs, {mm_res.total_displacement_arcsec}\" proper motion)")

    # 15. Distinct FITS Level 2 Images across R Draconis Visits
    img_v1 = get_image_details(obs_id="2025W17_4B_0021_3", ra=248.1675, dec=66.755, detector=3)
    img_v2 = get_image_details(obs_id="2025W17_4B_0145_1", ra=248.1675, dec=66.755, detector=3)
    assert img_v1["checksum_md5"] != img_v2["checksum_md5"], "FITS products must be distinct across visits"
    assert img_v1["measured_centroid_px"] is not None
    assert img_v1["gaia_predicted_px"] is not None
    print(f"[PASS] 15. /api/images/{{obs_id}} verified distinct across survey visits (V1: {img_v1['date_obs']} vs V2: {img_v2['date_obs']})")

    # 16. Time Machine Plotly Analytics Endpoint
    tm_an = get_time_machine_analytics(ra=248.1675, dec=66.755, mode="spherex")
    assert "ra_vs_time" in tm_an["charts"]
    assert "displacement_vs_time" in tm_an["charts"]
    assert "light_curve" in tm_an["charts"]
    assert len(tm_an["epochs"]) == 9
    print(f"[PASS] 16. /api/time-machine/analytics passed (4 Plotly charts, 9 multi-epoch visits/steps)")

    print("\nALL 16 BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api_endpoints()
