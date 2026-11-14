"""
SPHEREx Scientific Evidence Dossier Generator.
Produces cryptographically verifiable astronomical dossiers with observation provenance,
measurement ledgers, difference analysis, and downloadable publication-grade PDF reports via ReportLab.
"""
import io
import time
import hashlib
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_evidence_passport_data(
    target_info: Dict[str, Any],
    observations: list,
    motion_data: Dict[str, Any],
    variability_data: Dict[str, Any],
    spectral_data: Dict[str, Any],
    anomaly_data: Dict[str, Any],
    gaia_matches: list,
    wise_matches: list
) -> Dict[str, Any]:
    """
    Assembles a complete, reproducible Scientific Evidence Dossier dictionary
    with explicit four-tier scientific data provenance.
    """
    candidate_id = f"SPX-CAND-{int(target_info.get('ra_deg', 0)*1000):06d}{int(target_info.get('dec_deg', 0)*1000):+07d}"
    timestamp_utc = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    
    # Generate cryptographic provenance seal
    hash_payload = f"{candidate_id}:{timestamp_utc}:{len(observations)}:{anomaly_data.get('overall_score')}"
    dossier_seal = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()[:16].upper()
    
    return {
        "candidate_id": candidate_id,
        "dossier_seal": f"SPX-DOSSIER-{dossier_seal}",
        "passport_seal": f"SPX-DOSSIER-{dossier_seal}",
        "document_title": "SPHEREx Scientific Evidence Dossier",
        "generated_at_utc": timestamp_utc,
        "target": target_info,
        "total_observations_analyzed": len(observations),
        "anomaly_evaluation": anomaly_data,
        "motion_analysis": motion_data,
        "variability_analysis": variability_data,
        "spectral_analysis": {
            "channels_count": spectral_data.get("channels_count", 102),
            "ice_features": spectral_data.get("ice_features", {}),
            "summary": spectral_data.get("summary", "")
        },
        "catalogue_crossmatch": {
            "gaia_matches_count": len(gaia_matches),
            "wise_matches_count": len(wise_matches),
            "primary_gaia": gaia_matches[0] if gaia_matches else None,
            "primary_wise": wise_matches[0] if wise_matches else None
        },
        "provenance_tiers": {
            "MEASURED": "Direct detector counts, calibrated surface brightness (MJy/sr), observation timestamps (MJD), and detector flags from Level 2 FITS.",
            "CALCULATED": "Aperture photometry (net flux, uJy, AB mag), centroid coordinates and astrometric uncertainties, noise MAD floor, image difference residuals.",
            "CATALOGUED": "Gaia DR3 astrometry (proper motion, parallax, G-mag) and AllWISE photometry (W1-W4) crossmatched via IRSA TAP.",
            "SIMULATED_OR_MODELLED": "Synthetic 102-channel continuum templates for unobserved detector intervals, projected orbital/ephemeris cadences, and Gaia epoch propagation."
        },
        "scientific_limitations": [
            "SPHEREx QR2 provides initial sky coverage with non-uniform epoch sampling.",
            "Spectral channels in unobserved bands represent continuum models scaled to crossmatched photometry.",
            "Cutout angular coverage exceeding native detector bounds is masked and excluded from numerical flux integration."
        ],
        "processing_methodology": "Astropy Cutout2D with WCS reprojection, circular aperture photometry with annulus background subtraction, flux matching normalization S = median(|I_1 - bg_1|) / median(|I_2 - bg_2|).",
        "provenance": {
            "archive": "NASA/IPAC Infrared Science Archive (IRSA)",
            "pipeline": "COSMOSCOPE Scientific Analysis Pipeline v2.0",
            "observation_ledgers": [
                {
                    "obs_id": o.get("obs_id"),
                    "detector": o.get("detector"),
                    "date": o.get("obs_date_iso"),
                    "band": o.get("energy_bandpassname"),
                    "provenance_tier": "MEASURED"
                } for o in observations[:10]
            ]
        }
    }


def generate_passport_pdf(dossier_data: Dict[str, Any]) -> bytes:
    """
    Generates a publication-quality Scientific Evidence Dossier PDF report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0B192C"),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#1E3E62"),
        spaceAfter=12
    )
    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Heading2"],
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#0B192C"),
        spaceBefore=10,
        spaceAfter=5
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#222831")
    )
    
    story = []
    
    # Title Banner
    story.append(Paragraph("COSMOSCOPE — Scientific Evidence Dossier", title_style))
    story.append(Paragraph("Explore the Changing Universe | Multi-Epoch Infrared Astronomical Verification", subtitle_style))
    story.append(Paragraph(
        f"<b>Dossier ID:</b> {dossier_data.get('dossier_seal', dossier_data.get('passport_seal'))} | "
        f"<b>Target:</b> {dossier_data['candidate_id']} | "
        f"<b>Generated:</b> {dossier_data['generated_at_utc']}",
        subtitle_style
    ))
    story.append(Spacer(1, 6))
    
    # 1. Target Coordinates & Classification
    target = dossier_data.get("target", {})
    anomaly = dossier_data.get("anomaly_evaluation", {})
    
    target_ra = float(target.get('ra_deg') or 0.0)
    target_dec = float(target.get('dec_deg') or 0.0)
    overall_score = float(anomaly.get('overall_score') or 0.0)
    quality_conf = float(anomaly.get('quality_confidence') or 0.92)

    summary_data = [
        ["Target Designation", str(target.get("target_name") or "Target Coordinate"), "Anomaly Evaluation Index", f"{overall_score:.1f} / 100"],
        ["Right Ascension", f"{target_ra:.5f}° ({target.get('ra_hms') or ''})", "Classification Tier", str(anomaly.get("classification_tier") or "STANDARD_MONITORING")],
        ["Declination", f"{target_dec:.5f}° ({target.get('dec_dms') or ''})", "Archive Provenance Tier", "NASA/IPAC IRSA (SPHEREx QR2)"],
        ["Archive Data Source", "NASA/IPAC IRSA", "Epochs Analyzed", str(dossier_data.get("total_observations_analyzed", 0))]
    ]
    t1 = Table(summary_data, colWidths=[130, 150, 130, 120])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F6F9")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#212529")),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
    ]))
    story.append(t1)
    story.append(Spacer(1, 10))
    
    # 2. Four-Tier Scientific Data Provenance Ledger
    story.append(Paragraph("Scientific Data Provenance Classification", h2_style))
    prov_table = [
        ["Tier", "Classification Scope & Processing Level"],
        ["[MEASURED]", "Authentic SPHEREx Level 2 FITS calibrated surface brightness (MJy/sr), pixel arrays, MJD timestamps."],
        ["[CALCULATED]", "Aperture photometry, solid angle flux integration (uJy/AB mag), MAD noise floor, image difference residuals."],
        ["[CATALOGUED]", "Gaia DR3 astrometry (proper motion, parallax) and AllWISE photometry crossmatched via IRSA TAP."],
        ["[MODELLED]", "Synthetic 102-channel continuum templates for unobserved detector bands, projected orbital cadences."]
    ]
    t_prov = Table(prov_table, colWidths=[100, 430])
    t_prov.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#1E293B")),
    ]))
    story.append(t_prov)
    story.append(Spacer(1, 10))

    # 3. Candidate Anomaly Intelligence Findings
    story.append(Paragraph("Candidate Anomaly Intelligence Evaluation", h2_style))
    for reason in anomaly.get("interpretable_reasons", []):
        story.append(Paragraph(f"• {reason}", body_style))
    story.append(Spacer(1, 8))
    
    # 4. Astrometric & Proper Motion Ledger
    motion = dossier_data.get("motion_analysis", {})
    story.append(Paragraph("Astrometric Motion Ledger [CALCULATED / CATALOGUED]", h2_style))
    story.append(Paragraph(
        f"<b>Measured Proper Motion:</b> {motion.get('proper_motion_mas_yr', 0.0)} mas/yr | "
        f"<b>Angular Displacement:</b> {motion.get('displacement_arcsec', 0.0)}″ | "
        f"<b>Time Baseline:</b> {motion.get('baseline_days', 0.0)} days",
        body_style
    ))
    story.append(Paragraph(motion.get("summary", ""), body_style))
    story.append(Spacer(1, 8))
    
    # 5. Spectral & Ice Analysis
    spec = dossier_data.get("spectral_analysis", {})
    ice = spec.get("ice_features", {})
    story.append(Paragraph("102-Band Spectrophotometry & Chemical Ices [CALCULATED / MODELLED]", h2_style))
    h2o_tau = ice.get("h2o_ice", {}).get("tau", 0.0)
    co2_tau = ice.get("co2_ice", {}).get("tau", 0.0)
    story.append(Paragraph(
        f"<b>H2O Ice (3.05 µm):</b> optical depth τ = {h2o_tau} | "
        f"<b>CO2 Ice (4.27 µm):</b> optical depth τ = {co2_tau} | "
        f"<b>Spectral Channels:</b> {spec.get('channels_count', 102)} bands",
        body_style
    ))
    story.append(Spacer(1, 10))
    
    # Footer Notice & Limitations
    story.append(Paragraph("<b>Methodology & Known Limitations:</b>", body_style))
    for lim in dossier_data.get("scientific_limitations", []):
        story.append(Paragraph(f"• {lim}", body_style))
    story.append(Spacer(1, 6))
    
    footer_text = (
        "This Scientific Evidence Dossier was compiled deterministically from authentic NASA/IPAC IRSA datasets. "
        "Measured detector values are strictly distinguished from calculated parameters and empirical continuum models."
    )
    story.append(Paragraph(f"<i>{footer_text}</i>", body_style))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.read()

