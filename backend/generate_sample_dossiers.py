"""Generate sample Scientific Evidence Dossier PDFs for testing and inspection."""
import os
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.reports.evidence_passport import generate_passport_pdf

def main():
    out_dir = os.path.join(os.path.dirname(backend_dir), "reports_sample")
    os.makedirs(out_dir, exist_ok=True)

    # 1. Barnard's Star
    dossier_barnard = {
        "candidate_id": "SPX-CAND-269452+004693",
        "target_name": "Barnard's Star (High Proper Motion)",
        "ra": 269.45208,
        "dec": 4.69333,
        "classification": "High Proper Motion Star",
        "confidence": 0.985,
        "anomaly_score": 92.4,
        "validation_status": "VERIFIED_ASTRONOMICAL_TRANSIENT",
        "spectral_bands": [
            "Band 1 (0.75-1.12 um)", "Band 2 (1.12-1.50 um)",
            "Band 3 (1.50-2.42 um)", "Band 4 (2.42-3.82 um)",
            "Band 5 (3.82-4.42 um)", "Band 6 (4.42-5.00 um)"
        ],
        "evidence_summary": "Demonstrates prominent linear proper motion across multiple epochs with high astrometric confidence. Confirmed by cross-correlation with 2MASS and Gaia DR3 positional anchors.",
        "proper_motion": {
            "pm_ra_mas_yr": -798.5,
            "pm_dec_mas_yr": 10328.2,
            "total_pm_mas_yr": 10359.1,
            "chi2_linear_fit": 1.14
        },
        "variability": {
            "fractional_amplitude": 0.042,
            "variability_flag": False,
            "chi2_constant": 0.88
        },
        "ice_features": {
            "h2o_3p0_detected": False,
            "co2_4p27_detected": False,
            "co_4p67_detected": False
        },
        "observations": [
            {
                "epoch_id": "SPX-EP-2025-08-14-001",
                "utc_datetime": "2025-08-14T03:12:45Z",
                "mjd": 60898.13385,
                "detector": "Band 3 (1.50-2.42 um)",
                "fits_filename": "level2_2025W33_2C_0321_1_D3_spx_l2b.fits",
                "wcs_match_status": "MATCHED (sigma=0.012 arcsec)"
            },
            {
                "epoch_id": "SPX-EP-2025-11-20-004",
                "utc_datetime": "2025-11-20T14:48:10Z",
                "mjd": 60996.61678,
                "detector": "Band 3 (1.50-2.42 um)",
                "fits_filename": "level2_2025W47_1A_0114_2_D3_spx_l2b.fits",
                "wcs_match_status": "MATCHED (sigma=0.014 arcsec)"
            },
            {
                "epoch_id": "SPX-EP-2026-02-05-007",
                "utc_datetime": "2026-02-05T09:22:31Z",
                "mjd": 61073.39064,
                "detector": "Band 3 (1.50-2.42 um)",
                "fits_filename": "level2_2026W06_3D_0402_1_D3_spx_l2b.fits",
                "wcs_match_status": "MATCHED (sigma=0.011 arcsec)"
            }
        ]
    }

    pdf1 = generate_passport_pdf(dossier_barnard)
    path1 = os.path.join(out_dir, "SPHEREx_Scientific_Evidence_Dossier_Barnards_Star.pdf")
    with open(path1, "wb") as f:
        f.write(pdf1)
    print(f"Generated {path1} ({len(pdf1)} bytes)")

    # 2. Multi-epoch scenario (12 epochs)
    dossier_multi = dict(dossier_barnard)
    dossier_multi["candidate_id"] = "SPX-CAND-133795-007245"
    dossier_multi["target_name"] = "High Proper Motion Candidate"
    dossier_multi["observations"] = [
        {
            "epoch_id": f"SPX-EP-2025-{i:02d}-15-00{i}",
            "utc_datetime": f"2025-{i:02d}-15T12:00:00Z",
            "mjd": 60800.0 + i * 30.0,
            "detector": f"Band {(i % 6) + 1}",
            "fits_filename": f"level2_2025W{i*4:02d}_2C_{i:04d}_1_D{(i%6)+1}_spx_l2b.fits",
            "wcs_match_status": "MATCHED (sigma=0.015 arcsec)"
        }
        for i in range(1, 13)
    ]
    pdf2 = generate_passport_pdf(dossier_multi)
    path2 = os.path.join(out_dir, "SPHEREx_Scientific_Evidence_Dossier_MultiEpoch_Candidate.pdf")
    with open(path2, "wb") as f:
        f.write(pdf2)
    print(f"Generated {path2} ({len(pdf2)} bytes)")

if __name__ == "__main__":
    main()
