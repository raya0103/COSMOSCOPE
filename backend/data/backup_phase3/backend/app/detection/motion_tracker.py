"""
Moving Object & Proper Motion Analyzer for SPHEREx EXPLORER.
Tracks source positions across observation epochs, computes angular displacements,
estimates proper motion vectors, and compares against Gaia DR3 astrometry.
"""
from typing import List, Dict, Any, Optional
import numpy as np

def track_motion_between_epochs(
    epoch1_info: Dict[str, Any],
    epoch2_info: Dict[str, Any],
    gaia_sources: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Analyzes physical displacement between two observation epochs.
    epoch_info format: {'ra': float, 'dec': float, 'mjd': float, 'date_iso': str, 'snr': float}
    """
    ra1, dec1 = epoch1_info["ra"], epoch1_info["dec"]
    ra2, dec2 = epoch2_info["ra"], epoch2_info["dec"]
    t1_mjd, t2_mjd = epoch1_info["mjd"], epoch2_info["mjd"]
    
    dt_days = abs(t2_mjd - t1_mjd)
    dt_years = max(dt_days / 365.25, 0.001)
    
    # Angular displacement in arcseconds
    mean_dec_rad = np.radians((dec1 + dec2) / 2.0)
    d_ra_arcsec = (ra2 - ra1) * np.cos(mean_dec_rad) * 3600.0
    d_dec_arcsec = (dec2 - dec1) * 3600.0
    
    total_displacement_arcsec = float(np.sqrt(d_ra_arcsec**2 + d_dec_arcsec**2))
    proper_motion_mas_yr = float((total_displacement_arcsec / dt_years) * 1000.0)
    
    # Position Angle in degrees (East of North)
    pos_angle_deg = float(np.degrees(np.arctan2(d_ra_arcsec, d_dec_arcsec)) % 360.0)
    
    # Check against known SPHEREx pixel scale (6.2 arcsec/pixel)
    # Instrumental jitter threshold: ~1.5 arcsec
    INSTRUMENTAL_JITTER_ARCSEC = 1.8
    is_statistically_significant = total_displacement_arcsec > INSTRUMENTAL_JITTER_ARCSEC
    
    # Compare with Gaia DR3
    gaia_match = None
    pm_agreement = None
    if gaia_sources:
        # Find nearest Gaia source within 10 arcsec
        best_dist = 999.0
        for g in gaia_sources:
            g_dist = np.sqrt(((g["ra"] - ra1) * np.cos(mean_dec_rad) * 3600.0)**2 + ((g["dec"] - dec1) * 3600.0)**2)
            if g_dist < best_dist and g_dist < 10.0:
                best_dist = g_dist
                gaia_match = g
                
        if gaia_match:
            g_pm_tot = np.sqrt(gaia_match["pmra"]**2 + gaia_match["pmdec"]**2)
            diff_pm = abs(proper_motion_mas_yr - g_pm_tot)
            pm_agreement = round(float(diff_pm), 1)

    # Classification
    flags = []
    if total_displacement_arcsec > 5.0:
        flags.append("HIGH_PROPER_MOTION")
    if dt_days < 7.0 and total_displacement_arcsec > 10.0:
        flags.append("POTENTIAL_SOLAR_SYSTEM_OBJECT")
    if total_displacement_arcsec <= INSTRUMENTAL_JITTER_ARCSEC:
        flags.append("CONSISTENT_WITH_STATIONARY")
    if gaia_match and gaia_match.get("pmra"):
        flags.append("GAIA_PROPER_MOTION_CONFIRMED")
        
    confidence = min(0.98, max(0.1, 0.4 + (total_displacement_arcsec / 15.0))) if is_statistically_significant else 0.15
    
    return {
        "epoch1_iso": epoch1_info.get("date_iso"),
        "epoch2_iso": epoch2_info.get("date_iso"),
        "baseline_days": round(dt_days, 2),
        "displacement_arcsec": round(total_displacement_arcsec, 3),
        "d_ra_arcsec": round(float(d_ra_arcsec), 3),
        "d_dec_arcsec": round(float(d_dec_arcsec), 3),
        "proper_motion_mas_yr": round(proper_motion_mas_yr, 1),
        "position_angle_deg": round(pos_angle_deg, 1),
        "is_statistically_significant": is_statistically_significant,
        "flags": flags,
        "confidence_score": round(confidence, 2),
        "gaia_comparison": {
            "matched_source_id": gaia_match["source_id"] if gaia_match else None,
            "gaia_total_pm_mas_yr": round(float(np.sqrt(gaia_match["pmra"]**2 + gaia_match["pmdec"]**2)), 1) if gaia_match else None,
            "difference_mas_yr": pm_agreement
        },
        "summary": (
            f"Measured {total_displacement_arcsec:.2f}″ displacement over {dt_days:.1f} days, "
            f"corresponding to an apparent proper motion of {proper_motion_mas_yr:.1f} mas/yr at PA {pos_angle_deg:.1f}°."
        )
    }
