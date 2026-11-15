import os
import sys
import numpy as np
import pytest

# Ensure backend directory is in python path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.image_analysis.wcs_aligner import create_wcs_from_metadata, reproject_frame_to_reference
from app.image_analysis.subtraction import subtract_images
from app.image_analysis.stacking import stack_images
from app.analysis.scientific_analytics import get_target_light_curve, get_target_spectral_analytics
from app.reports.evidence_passport import generate_evidence_dossier_data, generate_passport_pdf


def test_wcs_aligner_creation():
    """Verify Astropy WCS creation from header metadata."""
    meta = {
        "crval1": 269.45208,
        "crval2": 4.69333,
        "crpix1": 32.5,
        "crpix2": 32.5,
        "cdelt1": -0.00172,
        "cdelt2": 0.00172,
        "ctype1": "RA---TAN",
        "ctype2": "DEC--TAN"
    }
    wcs_obj = create_wcs_from_metadata(meta, shape=(64, 64))
    assert wcs_obj is not None
    # Check pixel (32.5, 32.5) transforms to (269.45208, 4.69333)
    ra, dec = wcs_obj.all_pix2world(31.5, 31.5, 0)
    assert np.isclose(ra, 269.45208, atol=1e-3)
    assert np.isclose(dec, 4.69333, atol=1e-3)


def test_wcs_reprojection_same_grid():
    """Verify reprojection with identical grids produces negligible residual."""
    shape = (64, 64)
    y, x = np.mgrid[:64, :64]
    ref_data = 10.0 * np.exp(-((x - 32)**2 + (y - 32)**2) / (2 * 4**2))
    target_data = ref_data.copy()
    meta = {
        "crval1": 76.9564,
        "crval2": 30.4014,
        "crpix1": 32.5,
        "crpix2": 32.5,
        "cdelt1": -0.00172,
        "cdelt2": 0.00172,
        "ctype1": "RA---TAN",
        "ctype2": "DEC--TAN"
    }
    info = reproject_frame_to_reference(ref_data, target_data, ref_meta=meta, target_meta=meta)
    reprojected = info["aligned_image"]
    assert info["is_wcs_aligned"] is True
    assert "WCS" in info["alignment_status"]
    assert info["astrometric_offset_arcsec"] < 0.1
    # Check peak is preserved
    assert np.isclose(np.max(reprojected), 10.0, atol=0.2)


def test_wcs_reprojection_shifted_grid():
    """Verify reprojection of a frame with a coordinate shift."""
    shape = (64, 64)
    y, x = np.mgrid[:64, :64]
    ref_data = np.zeros(shape, dtype=float)
    # Source centered at pixel 32 in target frame
    target_data = 20.0 * np.exp(-((x - 32)**2 + (y - 32)**2) / (2 * 4**2))
    
    # Reference frame centered at RA=76.9564, Dec=30.4014
    ref_meta = {
        "crval1": 76.9564,
        "crval2": 30.4014,
        "crpix1": 32.5,
        "crpix2": 32.5,
        "cdelt1": -0.00172,
        "cdelt2": 0.00172,
    }
    # Target frame shifted slightly in RA by 10 arcsec (~0.00277 deg)
    tgt_meta = {
        "crval1": 76.9564 + 0.00277,
        "crval2": 30.4014,
        "crpix1": 32.5,
        "crpix2": 32.5,
        "cdelt1": -0.00172,
        "cdelt2": 0.00172,
    }
    info = reproject_frame_to_reference(ref_data, target_data, ref_meta=ref_meta, target_meta=tgt_meta)
    assert info["is_wcs_aligned"] is True
    assert info["astrometric_offset_arcsec"] > 5.0


def test_image_subtraction_wcs_output():
    """Verify image subtraction includes WCS alignment status."""
    frame1 = np.ones((48, 48), dtype=float) * 5.0
    frame2 = np.ones((48, 48), dtype=float) * 5.5
    meta1 = {
        "crval1": 248.1675, "crval2": 66.7550,
        "crpix1": 24.5, "crpix2": 24.5,
        "cdelt1": -0.00172, "cdelt2": 0.00172,
        "unit": "MJy/sr"
    }
    meta2 = {
        "crval1": 248.1675, "crval2": 66.7550,
        "crpix1": 24.5, "crpix2": 24.5,
        "cdelt1": -0.00172, "cdelt2": 0.00172,
        "unit": "MJy/sr"
    }
    res = subtract_images(frame1, frame2, meta1=meta1, meta2=meta2, normalize=False)
    assert "alignment_method" in res
    assert "alignment_status" in res
    assert "is_wcs_aligned" in res
    assert res["is_wcs_aligned"] is True
    assert "astrometric_offset_arcsec" in res


def test_light_curve_provenance_separation():
    """Verify strict separation of measured visits from parametric baseline."""
    # Barnard's Star has 3 authentic observations
    lc = get_target_light_curve(269.45208, 4.69333, "Barnard's Star")
    assert "measured_epochs" in lc
    assert "modelled_baseline" in lc
    assert "measured_count" in lc
    assert "temporal_coverage_status" in lc
    assert lc["measured_count"] >= 1
    # Check measured epoch items
    for epoch in lc["measured_epochs"]:
        assert epoch["provenance"] == "MEASURED"
        assert "flux_err_mjy_sr" in epoch
        assert "date_iso" in epoch
    # Check baseline items
    for item in lc["modelled_baseline"]:
        assert item["provenance"] == "SIMULATED"


def test_light_curve_insufficient_coverage_warning():
    """Verify targets with < 3 visits trigger insufficient temporal coverage warning."""
    # Isolated candidate with 0 QR2 observations
    lc = get_target_light_curve(180.0, 45.0, "Isolated Deep Field Candidate")
    assert lc["measured_count"] < 3
    assert lc["temporal_coverage_status"] == "INSUFFICIENT_TEMPORAL_COVERAGE"
    assert "temporal_coverage_warning" in lc
    assert "INSUFFICIENT TEMPORAL COVERAGE" in lc["temporal_coverage_warning"]


def test_spectral_analytics_preliminary_candidate_labels():
    """Verify low-resolution chemical ice lines are labeled PRELIMINARY_CANDIDATE."""
    spec = get_target_spectral_analytics(133.79513, -7.24515, "WISE 0855")
    assert "ice_features" in spec
    assert "channels_count" in spec
    assert spec["channels_count"] == 102
    assert "molecular_lines" in spec
    
    # Check molecular lines are labeled as candidates with caveat
    for line in spec["molecular_lines"]:
        assert "status" in line
        assert "PRELIMINARY_CANDIDATE" in line["status"] or "CONTINUUM" in line["status"]
        assert "R=35-128" in line["caveat"] or "R=35–128" in line["caveat"]


def test_evidence_dossier_6_tier_provenance_and_ledger():
    """Verify dossier includes 6-tier provenance definitions and observation traceability ledger."""
    dossier = generate_evidence_dossier_data(269.45208, 4.69333, "Barnard's Star")
    tiers = dossier.get("provenance_tiers", {})
    assert "MEASURED" in tiers
    assert "CATALOGUED" in tiers
    assert "CALCULATED" in tiers
    assert "INTERPOLATED" in tiers
    assert "SIMULATED" in tiers
    assert "UNAVAILABLE" in tiers
    
    # Check observation ledgers
    ledgers = dossier.get("provenance", {}).get("observation_ledgers", [])
    assert len(ledgers) > 0
    first_obs = ledgers[0]
    assert "obs_id" in first_obs
    assert "detector" in first_obs
    assert "band" in first_obs
    assert "fits_filename" in first_obs
    assert "provenance_tier" in first_obs
    assert first_obs["provenance_tier"] == "MEASURED"
    assert "irsa_url" in first_obs
    
    # Check archive links
    links = dossier.get("archive_links", {})
    assert "irsa_spherex_root" in links
    assert "gaia_archive" in links
    assert "simbad_resolver" in links
    assert "allwise_irsa" in links


def test_evidence_passport_pdf_generation():
    """Verify PDF generator runs without errors and produces valid PDF bytes."""
    dossier = generate_evidence_dossier_data(248.1675, 66.7550, "R Draconis")
    pdf_bytes = generate_passport_pdf(dossier)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")
