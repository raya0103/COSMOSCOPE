import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.api.routes import search_observations, get_multimission_view
from app.models.schemas import CoordinateInput
from app.data_access.fits_fetcher import get_cached_fits

targets = [
    ("Barnard's Star", 269.45208, 4.69333),
    ("WISE 0855", 133.79513, -7.24515),
    ("RW Aurigae", 76.95642, 30.40142),
    ("Epsilon Indi B", 331.04375, -56.78278),
    ("R Draconis", 248.16750, 66.75500),
]

print("=== 1. SEARCH OBSERVATIONS (SPHEREx MODE) ===")
for name, ra, dec in targets:
    res = search_observations(CoordinateInput(ra=ra, dec=dec, target_name=name))
    print(f"{name}: total={res.total_observations}, can_compare={res.can_compare}, note={res.comparison_note[:45]}...")
    assert res.total_observations >= 4, f"Expected at least 4 observations for {name}, got {res.total_observations}"
    assert res.can_compare is True, f"Expected can_compare=True for {name}"

print("\n=== 2. MULTI-MISSION HISTORICAL VIEW ===")
for name, ra, dec in targets:
    mm = get_multimission_view(ra=ra, dec=dec, target_name=name)
    print(f"{name}: total_epochs={mm.total_epochs}, timespan={mm.time_span_years} yrs, disp={mm.total_displacement_arcsec}\"")
    assert mm.total_epochs >= 2, f"Expected at least 2 epochs for {name}"

print("\n=== 3. DISTINCT FITS IMAGE RETRIEVAL PER VISIT ===")
for name, ra, dec in targets:
    res = search_observations(CoordinateInput(ra=ra, dec=dec, target_name=name))
    v1 = res.observations[0]
    v2_candidates = [o for o in res.observations if o.is_independent_visit and o.obs_id != v1.obs_id]
    v2 = v2_candidates[0] if v2_candidates else res.observations[-1]
    
    f1, m1 = get_cached_fits(v1.cutout_url, obs_id=v1.obs_id, detector=v1.detector, ra=ra, dec=dec)
    f2, m2 = get_cached_fits(v2.cutout_url, obs_id=v2.obs_id, detector=v2.detector, ra=ra, dec=dec)
    
    print(f"{name}:")
    print(f"  V1 ({v1.obs_id}_D{v1.detector}): {os.path.basename(f1)} (md5={m1[:8]})")
    print(f"  V2 ({v2.obs_id}_D{v2.detector}): {os.path.basename(f2)} (md5={m2[:8]})")
    assert f1 is not None and f2 is not None, f"FITS file missing for {name}"
    assert m1 != m2, f"ERROR: V1 and V2 have identical MD5 for {name}!"

print("\n=== 4. MULTI-MISSION IMAGE DETAILS CHECK ===")
from app.api.routes import get_image_details
for name, ra, dec in targets:
    mm = get_multimission_view(ra=ra, dec=dec, target_name=name)
    print(f"{name} ({len(mm.epochs)} historical epochs):")
    for ep in mm.epochs:
        det = 1 if ep.is_spherex else 0
        img = get_image_details(obs_id=ep.obs_id, ra=ra, dec=dec, fov_arcmin=3.0, detector=det)
        shape = img.get('shape')
        md5_val = img.get('checksum_md5', '')
        c_px = img.get('measured_centroid_px', {})
        print(f"  [{ep.mission}] {ep.obs_id}: shape={shape}, md5={md5_val[:8]}, centroid_px=({c_px.get('x')}, {c_px.get('y')})")

print("\n>>> ALL TARGETS VERIFIED WITH DISTINCT FITS FILES AND MULTI-EPOCH COVERAGE! <<<")
