"""
Inspect distinct observation epochs for all 5 challenge targets from spherex.obscore:
1. R Draconis
2. Barnard's Star
3. WISE 0855-0714
4. RW Aurigae
5. Epsilon Indi B
"""
import requests
import json

targets = [
    {"name": "R Draconis", "slug": "rdraconis", "ra": 248.16750, "dec": 66.75500},
    {"name": "Barnard's Star", "slug": "barnard", "ra": 269.45208, "dec": 4.69333},
    {"name": "WISE 0855-0714", "slug": "wise0855", "ra": 133.79513, "dec": -7.24515},
    {"name": "RW Aurigae", "slug": "rwaur", "ra": 76.95642, "dec": 30.40142},
    {"name": "Epsilon Indi B", "slug": "epsindi", "ra": 331.04375, "dec": -56.78278}
]

url = "https://irsa.ipac.caltech.edu/TAP/sync"

print("="*80)
print("ANALYZING OBSERVATION TIMESTAMPS & DETECTORS ACROSS ALL 5 TARGETS")
print("="*80)

for t in targets:
    q = f"""
    SELECT obs_id, energy_bandpassname, t_min, t_max, t_exptime, access_url, obs_collection
    FROM spherex.obscore
    WHERE 1=CONTAINS(POINT('ICRS', {t['ra']}, {t['dec']}), s_region)
    ORDER BY t_min ASC
    """
    resp = requests.post(url, data={"QUERY": q, "FORMAT": "csv"}, timeout=60)
    lines = resp.text.strip().split("\n")
    rows = lines[1:] if len(lines) > 1 else []
    print(f"\nTarget: {t['name']} -> {len(rows)} matching observations")
    
    # Parse rows and group by obs_id base (visit)
    unique_obsids = {}
    for r in rows:
        parts = r.split(",")
        if len(parts) >= 6:
            oid = parts[0]
            band = parts[1]
            tmin = float(parts[2])
            acc_url = parts[5]
            if oid not in unique_obsids:
                unique_obsids[oid] = {"bands": [], "t_min": tmin, "url": acc_url}
            unique_obsids[oid]["bands"].append(band)
            
    print(f"  Unique OBSIDs: {len(unique_obsids)}")
    sorted_obs = sorted(unique_obsids.items(), key=lambda x: x[1]["t_min"])
    # Show first 5 and last 5 epochs
    print("  Distinct observation epochs:")
    for oid, info in sorted_obs[:8]:
        from astropy.time import Time
        t_iso = Time(info["t_min"], format="mjd").isot
        print(f"    OBSID: {oid:<20} | MJD: {info['t_min']:.4f} ({t_iso[:19]}) | Bands: {', '.join(info['bands'])}")
        print(f"       Access URL: {info['url']}")
    if len(sorted_obs) > 8:
        print(f"    ... and {len(sorted_obs)-8} more distinct epochs.")
