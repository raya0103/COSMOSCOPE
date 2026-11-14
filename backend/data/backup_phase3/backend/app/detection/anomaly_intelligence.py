"""
Innovation 1: Cosmic Anomaly Intelligence Engine for SPHEREx EXPLORER.
Transparent, interpretable multi-factor ranking engine that scores astronomical candidates
on physical proper motion, flux variance, spectral ice signatures, and cross-catalog novelty.
"""
from typing import Dict, Any, List

def compute_anomaly_index(
    motion_metrics: Dict[str, Any],
    variability_metrics: Dict[str, Any],
    spectral_metrics: Dict[str, Any],
    catalog_metrics: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Computes an interpretable composite Anomaly Index (0 to 100).
    Returns total score, category, factor breakdown, and human-readable explanations.
    """
    reasons = []
    
    # 1. Motion Score (0 - 30 points)
    pm_mas_yr = motion_metrics.get("proper_motion_mas_yr", 0.0)
    disp_arcsec = motion_metrics.get("displacement_arcsec", 0.0)
    
    if pm_mas_yr > 5000.0:
        score_motion = 30.0
        reasons.append(f"Extreme proper motion detected ({pm_mas_yr:.1f} mas/yr > 5 arcsec/yr), characteristic of solar neighborhood stars (like Barnard's Star) or solar system objects.")
    elif pm_mas_yr > 1000.0:
        score_motion = 24.0
        reasons.append(f"High proper motion detected ({pm_mas_yr:.1f} mas/yr > 1 arcsec/yr), indicating high-velocity nearby object.")
    elif pm_mas_yr > 250.0:
        score_motion = 15.0
        reasons.append(f"Noticeable apparent proper motion ({pm_mas_yr:.1f} mas/yr).")
    elif disp_arcsec > 3.0:
        score_motion = 8.0
        reasons.append(f"Modest displacement ({disp_arcsec:.2f}″) exceeding instrumental point spread function.")
    else:
        score_motion = 2.0
        
    # 2. Variability Score (0 - 30 points)
    frac_variation = variability_metrics.get("fractional_variation", 0.0)
    mag_amplitude = variability_metrics.get("magnitude_amplitude", 0.0)
    
    if mag_amplitude > 2.0 or frac_variation > 1.5:
        score_var = 30.0
        reasons.append(f"High-amplitude photometric variability ({mag_amplitude:.2f} mag change), typical of eruptive variables (RW Aurigae) or Mira pulsations (R Draconis).")
    elif mag_amplitude > 0.8 or frac_variation > 0.5:
        score_var = 20.0
        reasons.append(f"Significant photometric variability ({mag_amplitude:.2f} mag change) between SPHEREx observation epochs.")
    elif mag_amplitude > 0.25:
        score_var = 10.0
        reasons.append(f"Mild brightness fluctuation ({mag_amplitude:.2f} mag).")
    else:
        score_var = 2.0
        
    # 3. Spectral Anomaly Score (0 - 20 points)
    ice_features = spectral_metrics.get("ice_features", {})
    h2o_tau = ice_features.get("h2o_ice", {}).get("tau", 0.0)
    co2_tau = ice_features.get("co2_ice", {}).get("tau", 0.0)
    
    score_spec = 0.0
    if h2o_tau > 0.2:
        score_spec += 12.0
        reasons.append(f"Prominent water ice (H2O) absorption band identified at 3.05 µm (optical depth τ = {h2o_tau:.2f}).")
    if co2_tau > 0.1:
        score_spec += 8.0
        reasons.append(f"Carbon dioxide (CO2) ice absorption detected at 4.27 µm (optical depth τ = {co2_tau:.2f}).")
        
    if score_spec == 0.0:
        score_spec = 3.0
    score_spec = min(20.0, score_spec)
    
    # 4. Catalog Novelty Score (0 - 20 points)
    has_gaia = catalog_metrics.get("has_gaia_counterpart", True)
    has_wise = catalog_metrics.get("has_wise_counterpart", True)
    
    if not has_gaia and has_wise:
        score_cat = 20.0
        reasons.append("Infrared-only source: undetected in optical Gaia DR3 but present in AllWISE / SPHEREx (consistent with cold sub-stellar brown dwarf or deeply embedded protostar).")
    elif not has_gaia and not has_wise:
        score_cat = 18.0
        reasons.append("Uncatalogued source: absent from prior Gaia and AllWISE releases, potential new transient or Solar System object.")
    else:
        score_cat = 5.0

    total_score = round(min(100.0, score_motion + score_var + score_spec + score_cat), 1)
    
    if total_score >= 70.0:
        tier = "HIGH_PRIORITY_CANDIDATE"
        badge = "Tier 1: Exceptional Anomaly"
    elif total_score >= 45.0:
        tier = "INTERESTING_CANDIDATE"
        badge = "Tier 2: High Interest"
    elif total_score >= 25.0:
        tier = "KNOWN_VARIABLE_OR_MOTION"
        badge = "Tier 3: Moderate Activity"
    else:
        tier = "STANDARD_ASTRONOMICAL_SOURCE"
        badge = "Tier 4: Baseline Source"
        
    quality_confidence = round(float(catalog_metrics.get("quality_confidence", 0.92)), 2)

    return {
        "overall_score": total_score,
        "classification_tier": tier,
        "badge": badge,
        "factor_breakdown": {
            "motion_score": round(score_motion, 1),
            "variability_score": round(score_var, 1),
            "spectral_score": round(score_spec, 1),
            "catalog_novelty_score": round(score_cat, 1)
        },
        "interpretable_reasons": reasons,
        "quality_confidence": quality_confidence,
        "recommended_action": (
            "Review in Citizen Science Network and generate Discovery Evidence Passport." 
            if total_score >= 45.0 else "Cataloged for baseline celestial monitoring."
        )
    }
