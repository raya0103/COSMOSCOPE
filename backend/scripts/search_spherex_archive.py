"""
Search the official NASA/IPAC IRSA SPHEREx archive for the 5 challenge targets:
1. R Draconis
2. Barnard's Star
3. WISE 0855-0714
4. RW Aurigae
5. Epsilon Indi B
"""
import requests
import json
import urllib.parse
from astropy.coordinates import SkyCoord
from astropy import units as u

targets = [
    {"name": "R Draconis", "ra": 248.16750, "dec": 66.75500},
    {"name": "Barnard's Star", "ra": 269.45208, "dec": 4.69333},
    {"name": "WISE 0855-0714", "ra": 133.79513, "dec": -7.24515},
    {"name": "RW Aurigae", "ra": 76.95642, "dec": 30.40142},
    {"name": "Epsilon Indi B", "ra": 331.04375, "dec": -56.78278}
]

print("="*70)
print("SEARCHING OFFICIAL NASA/IPAC IRSA SPHEREx ARCHIVE VIA TAP (ObsCore)")
print("="*70)

for t in targets:
    name, ra, dec = t["name"], t["ra"], t["dec"]
    # ADQL query using s_region intersection or point containment
    query = f"""
    SELECT obs_id, s_ra, s_dec, energy_bandpassname, em_min, em_max, t_min, t_max, t_exptime, access_url, obs_collection, calib_level
    FROM spherex.obscore
    WHERE 1=CONTAINS(POINT('ICRS', {ra}, {dec}), s_region)
    ORDER BY t_min ASC
    """
    params = {
        "QUERY": query,
        "FORMAT": "csv"
    }
    url = "https://irsa.ipac.caltech.edu/TAP/sync"
    try:
        resp = requests.post(url, data=params, timeout=45)
        if resp.status_code == 200:
            lines = resp.text.strip().split("\n")
            header = lines[0].split(",") if lines else []
            rows = lines[1:] if len(lines) > 1 else []
            print(f"\nTarget: {name} (RA={ra}, Dec={dec}) -> {len(rows)} matching observations in spherex.obscore")
            if rows:
                print(f"Header: {lines[0]}")
                for r in rows[:10]:
                    print(f"  {r}")
                if len(rows) > 10:
                    print(f"  ... and {len(rows)-10} more observations.")
            else:
                # Also try cone search with 1.0 degree radius
                print("  Trying 1.0 deg cone search on s_ra/s_dec...")
                q_cone = f"""
                SELECT obs_id, s_ra, s_dec, energy_bandpassname, t_min, t_max, access_url, obs_collection
                FROM spherex.obscore
                WHERE 1=CONTAINS(POINT('ICRS', s_ra, s_dec), CIRCLE('ICRS', {ra}, {dec}, 1.0))
                """
                resp2 = requests.post(url, data={"QUERY": q_cone, "FORMAT": "csv"}, timeout=30)
                if resp2.status_code == 200:
                    lines2 = resp2.text.strip().split("\n")
                    rows2 = lines2[1:] if len(lines2) > 1 else []
                    print(f"  Cone search result: {len(rows2)} observations found.")
                    for r in rows2[:5]:
                        print(f"    {r}")
        else:
            print(f"\nTarget: {name} -> TAP Error HTTP {resp.status_code}: {resp.text[:300]}")
    except Exception as e:
        print(f"\nTarget: {name} -> Error querying TAP: {e}")

print("\n" + "="*70)
print("ARCHIVE SEARCH COMPLETE")
print("="*70)
