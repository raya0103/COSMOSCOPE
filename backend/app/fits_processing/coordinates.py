"""
Astronomical Coordinate Utilities for SPHEREx EXPLORER.
Provides rigorous parsing, validation, and sexagesimal transformations using Astropy.
"""
import re
from typing import Tuple, Optional
import requests
from astropy.coordinates import SkyCoord
import astropy.units as u

def parse_and_validate_coordinates(
    ra_input: str | float,
    dec_input: str | float,
    target_name: Optional[str] = None
) -> Tuple[float, float, str, str, str]:
    """
    Parses Right Ascension and Declination inputs in decimal degrees or sexagesimal formats.
    Returns: (ra_deg, dec_deg, ra_hms, dec_dms, resolved_by)
    """
    # If target name is provided and coordinates are empty/missing, resolve target name
    resolved_by = "direct_input"
    
    is_ra_empty = ra_input is None or str(ra_input).strip() == ""
    is_dec_empty = dec_input is None or str(dec_input).strip() == ""
    if (is_ra_empty or is_dec_empty) and target_name:
        resolved_coords = resolve_target_name(target_name)
        if resolved_coords:
            return resolved_coords
        raise ValueError(f"Could not resolve celestial coordinates for target '{target_name}'.")

    # Format string check
    try:
        # Check if inputs are numbers or numeric strings
        if isinstance(ra_input, (int, float)) and isinstance(dec_input, (int, float)):
            coord = SkyCoord(ra=float(ra_input) * u.deg, dec=float(dec_input) * u.deg, frame="icrs")
        else:
            ra_str = str(ra_input).strip()
            dec_str = str(dec_input).strip()
            
            # Check if decimal degree strings
            if _is_float(ra_str) and _is_float(dec_str):
                coord = SkyCoord(ra=float(ra_str) * u.deg, dec=float(dec_str) * u.deg, frame="icrs")
            else:
                # Treat as sexagesimal (e.g. '17h57m48.5s', '+04d41m36s' or '17:57:48.5', '+04:41:36')
                coord_str = f"{ra_str} {dec_str}"
                coord = SkyCoord(coord_str, frame="icrs")
    except Exception as e:
        raise ValueError(f"Invalid coordinate format for RA '{ra_input}', Dec '{dec_input}': {str(e)}")

    ra_deg = float(coord.ra.deg)
    dec_deg = float(coord.dec.deg)

    if not (0.0 <= ra_deg <= 360.0):
        raise ValueError(f"Right Ascension {ra_deg}° is out of bounds [0, 360].")
    if not (-90.0 <= dec_deg <= 90.0):
        raise ValueError(f"Declination {dec_deg}° is out of bounds [-90, +90].")

    ra_hms = coord.ra.to_string(unit=u.hour, sep=":", precision=2, pad=True)
    dec_dms = coord.dec.to_string(unit=u.deg, sep=":", precision=2, alwayssign=True, pad=True)

    return ra_deg, dec_deg, ra_hms, dec_dms, resolved_by



# Curated Challenge Targets with authentic verified coordinates
CHALLENGE_TARGETS_CATALOG = [
    {
        "id": "barnards-star",
        "name": "Barnard's Star",
        "type": "High Proper Motion M-Dwarf",
        "ra_deg": 269.45208,
        "dec_deg": 4.69333,
        "constellation": "Ophiuchus",
        "spectral_type": "M4.0V",
        "badge": "Proper Motion",
        "description": "Second-closest stellar system to the Sun. Displays extreme proper motion of 10.39 arcsec/yr."
    },
    {
        "id": "epsilon-indi-b",
        "name": "Epsilon Indi B",
        "type": "Substellar Binary Brown Dwarf",
        "ra_deg": 331.04375,
        "dec_deg": -56.78278,
        "constellation": "Indus",
        "spectral_type": "T1+T6",
        "badge": "Brown Dwarf",
        "description": "Substellar companion binary at 3.6 pc with strong methane and water vapor absorption."
    },
    {
        "id": "wise-0855",
        "name": "WISE 0855",
        "type": "Sub-Zero Brown Dwarf (Water Ice)",
        "ra_deg": 133.79513,
        "dec_deg": -7.24515,
        "constellation": "Hydra",
        "spectral_type": "Y2",
        "badge": "Water Ice",
        "description": "Coldest known brown dwarf (~250 K) with atmospheric water ice clouds."
    },
    {
        "id": "rw-aurigae",
        "name": "RW Aurigae",
        "type": "Eruptive T Tauri Variable",
        "ra_deg": 76.95642,
        "dec_deg": 30.40142,
        "constellation": "Auriga",
        "spectral_type": "K1-K4e",
        "badge": "Variable YSO",
        "description": "Active Young Stellar Object (YSO) exhibiting deep circumstellar dust obscuration events."
    },
    {
        "id": "r-draconis",
        "name": "R Draconis",
        "type": "Mira Pulsating Giant Variable",
        "ra_deg": 248.16750,
        "dec_deg": 66.75500,
        "constellation": "Draco",
        "spectral_type": "M5e-M9e",
        "badge": "Mira Giant",
        "description": "Classical long-period pulsating red giant with ~245-day cycle in the northern continuous viewing zone."
    }
]

# Curated reference astronomical catalog with verified ICRS coordinates
REFERENCE_ASTRONOMICAL_CATALOG = [
    {"name": "Sirius (Alpha Canis Majoris)", "designation": "Sirius", "ra": 101.28715, "dec": -16.71612, "type": "Main-Sequence A-Star"},
    {"name": "Canopus (Alpha Carinae)", "designation": "Canopus", "ra": 95.98788, "dec": -52.69566, "type": "F-Type Bright Giant"},
    {"name": "Arcturus (Alpha Boötis)", "designation": "Arcturus", "ra": 213.91530, "dec": 19.18241, "type": "Red Giant K-Star"},
    {"name": "Vega (Alpha Lyrae)", "designation": "Vega", "ra": 279.23473, "dec": 38.78369, "type": "Standard Photometric A0V Star"},
    {"name": "Capella (Alpha Aurigae)", "designation": "Capella", "ra": 79.17233, "dec": 45.99799, "type": "Quadruple Star System"},
    {"name": "Rigel (Beta Orionis)", "designation": "Rigel", "ra": 78.63447, "dec": -8.20164, "type": "Blue Supergiant"},
    {"name": "Procyon (Alpha Canis Minoris)", "designation": "Procyon", "ra": 114.82550, "dec": 5.22499, "type": "Subgiant F-Star"},
    {"name": "Betelgeuse (Alpha Orionis)", "designation": "Betelgeuse", "ra": 88.79294, "dec": 7.40706, "type": "Red Supergiant Variable"},
    {"name": "Altair (Alpha Aquilae)", "designation": "Altair", "ra": 297.69583, "dec": 8.86832, "type": "Rapidly Rotating A-Star"},
    {"name": "Aldebaran (Alpha Tauri)", "designation": "Aldebaran", "ra": 68.98016, "dec": 16.50930, "type": "Red Giant K-Star"},
    {"name": "Spica (Alpha Virginis)", "designation": "Spica", "ra": 201.29825, "dec": -11.16132, "type": "Spectroscopic Binary B-Star"},
    {"name": "Antares (Alpha Scorpii)", "designation": "Antares", "ra": 247.35192, "dec": -26.43200, "type": "Red Supergiant Variable"},
    {"name": "Pollux (Beta Geminorum)", "designation": "Pollux", "ra": 116.32896, "dec": 28.02620, "type": "Giant K-Star"},
    {"name": "Deneb (Alpha Cygni)", "designation": "Deneb", "ra": 310.35798, "dec": 45.28034, "type": "White Supergiant"},
    {"name": "Polaris (Alpha Ursae Minoris)", "designation": "Polaris", "ra": 37.95456, "dec": 89.26411, "type": "Classical Cepheid Variable"},
    {"name": "Proxima Centauri", "designation": "Proxima Cen", "ra": 217.42894, "dec": -62.67949, "type": "Nearest Star (Flare M-Dwarf)"},
    {"name": "Sagittarius A*", "designation": "Sgr A*", "ra": 266.41684, "dec": -29.00781, "type": "Galactic Center Supermassive Black Hole"},
    {"name": "Crab Nebula (M1)", "designation": "M1 / NGC 1952", "ra": 83.63308, "dec": 22.01450, "type": "Supernova Remnant & Pulsar"},
    {"name": "Andromeda Galaxy (M31)", "designation": "M31 / NGC 224", "ra": 10.68471, "dec": 41.26875, "type": "Spiral Galaxy"},
    {"name": "Triangulum Galaxy (M33)", "designation": "M33 / NGC 598", "ra": 23.46208, "dec": 30.66018, "type": "Spiral Galaxy"},
    {"name": "Orion Nebula (M42)", "designation": "M42 / NGC 1976", "ra": 83.82208, "dec": -5.39111, "type": "H II Star-Forming Region"},
    {"name": "Pleiades Cluster (M45)", "designation": "M45", "ra": 56.75000, "dec": 24.11667, "type": "Open Star Cluster"},
    {"name": "Whirlpool Galaxy (M51)", "designation": "M51 / NGC 5194", "ra": 202.46958, "dec": 47.19528, "type": "Interacting Grand-Design Spiral"},
    {"name": "Ring Nebula (M57)", "designation": "M57 / NGC 6720", "ra": 283.39625, "dec": 33.02917, "type": "Planetary Nebula"},
    {"name": "Pinwheel Galaxy (M101)", "designation": "M101 / NGC 5457", "ra": 210.80227, "dec": 54.34895, "type": "Face-On Spiral Galaxy"},
    {"name": "Sombrero Galaxy (M104)", "designation": "M104 / NGC 4594", "ra": 189.99763, "dec": -11.62305, "type": "Unbarred Spiral Galaxy"}
]

def angular_separation_arcsec(ra1: float, dec1: float, ra2: float, dec2: float) -> float:
    """Calculates great-circle angular separation in arcseconds between two (RA, Dec) positions in degrees."""
    c1 = SkyCoord(ra=float(ra1) * u.deg, dec=float(dec1) * u.deg, frame="icrs")
    c2 = SkyCoord(ra=float(ra2) * u.deg, dec=float(dec2) * u.deg, frame="icrs")
    return float(c1.separation(c2).arcsec)

def match_challenge_target(ra: float, dec: float, tolerance_deg: float = 0.08) -> Optional[dict]:
    """
    Checks if given coordinates match one of the 5 NASA challenge targets within angular tolerance.
    Default tolerance: 0.08 degrees (~4.8 arcminutes / 288 arcseconds).
    """
    tol_arcsec = tolerance_deg * 3600.0
    best_target = None
    min_dist_arcsec = float("inf")

    for target in CHALLENGE_TARGETS_CATALOG:
        sep_arcsec = angular_separation_arcsec(ra, dec, target["ra_deg"], target["dec_deg"])
        if sep_arcsec <= tol_arcsec and sep_arcsec < min_dist_arcsec:
            min_dist_arcsec = sep_arcsec
            best_target = {
                **target,
                "separation_arcsec": round(sep_arcsec, 2),
                "separation_arcmin": round(sep_arcsec / 60.0, 3),
                "is_challenge_target": True,
                "matched": True
            }

    return best_target

def identify_object_by_coordinates(ra: float, dec: float, matching_radius_arcsec: float = 60.0) -> dict:
    """
    Feature: Real celestial object identification from sky coordinates.
    Evaluates:
      1. Challenge Target Catalog (within 0.08° / ~288" matching tolerance)
      2. Authoritative Reference Catalog (within matching_radius_arcsec)
      3. Returns 'Unidentified celestial position' if outside radius without fabricating names.
    """
    # 1. Check Challenge Targets first
    challenge_match = match_challenge_target(ra, dec, tolerance_deg=0.08)
    if challenge_match:
        return {
            "matched": True,
            "designation": challenge_match["name"],
            "target_name": challenge_match["name"],
            "object_type": challenge_match["type"],
            "constellation": challenge_match.get("constellation"),
            "is_challenge_target": True,
            "target_id": challenge_match["id"],
            "separation_arcsec": challenge_match["separation_arcsec"],
            "matching_radius_arcsec": matching_radius_arcsec,
            "identification_source": "NASA SPHEREx Challenge Target Catalogue",
            "reference_ra_deg": challenge_match["ra_deg"],
            "reference_dec_deg": challenge_match["dec_deg"]
        }

    # 2. Check Curated Reference Astronomical Catalog
    best_ref = None
    min_ref_sep = float("inf")
    for ref in REFERENCE_ASTRONOMICAL_CATALOG:
        sep = angular_separation_arcsec(ra, dec, ref["ra"], ref["dec"])
        if sep <= matching_radius_arcsec and sep < min_ref_sep:
            min_ref_sep = sep
            best_ref = {**ref, "sep": sep}

    if best_ref:
        return {
            "matched": True,
            "designation": best_ref["designation"],
            "target_name": best_ref["name"],
            "object_type": best_ref["type"],
            "constellation": None,
            "is_challenge_target": False,
            "target_id": None,
            "separation_arcsec": round(best_ref["sep"], 2),
            "matching_radius_arcsec": matching_radius_arcsec,
            "identification_source": "CDS/SIMBAD Verified Reference Catalogue",
            "reference_ra_deg": best_ref["ra"],
            "reference_dec_deg": best_ref["dec"]
        }

    # 3. Fallback: Unidentified Position (strictly honest, zero fabrication)
    return {
        "matched": False,
        "designation": "Unidentified celestial position",
        "target_name": f"Coord (RA {ra:.4f} deg, Dec {dec:.4f} deg)",
        "object_type": "Uncatalogued Field Position",
        "constellation": None,
        "is_challenge_target": False,
        "target_id": None,
        "separation_arcsec": None,
        "matching_radius_arcsec": matching_radius_arcsec,
        "identification_source": f"No recognized catalogue object within {matching_radius_arcsec:.0f} arcsec radius",
        "reference_ra_deg": ra,
        "reference_dec_deg": dec
    }

def resolve_target_name(name: str) -> Optional[Tuple[float, float, str, str, str]]:
    """
    Resolves astronomical target names to ICRS coordinates via CDS Sesame service or offline catalog.
    """
    clean_name = name.strip()
    lower_name = clean_name.lower()

    # Check Challenge Targets
    for t in CHALLENGE_TARGETS_CATALOG:
        if lower_name == t["name"].lower() or lower_name == t["id"].lower() or lower_name.replace("'", "") == t["name"].lower().replace("'", ""):
            ra_deg, dec_deg = t["ra_deg"], t["dec_deg"]
            coord = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")
            ra_hms = coord.ra.to_string(unit=u.hour, sep=":", precision=2, pad=True)
            dec_dms = coord.dec.to_string(unit=u.deg, sep=":", precision=2, alwayssign=True, pad=True)
            return ra_deg, dec_deg, ra_hms, dec_dms, "challenge_target_catalogue"

    # Check Reference Catalog
    for r in REFERENCE_ASTRONOMICAL_CATALOG:
        if lower_name == r["name"].lower() or lower_name == r["designation"].lower() or lower_name in r["name"].lower():
            ra_deg, dec_deg = r["ra"], r["dec"]
            coord = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")
            ra_hms = coord.ra.to_string(unit=u.hour, sep=":", precision=2, pad=True)
            dec_dms = coord.dec.to_string(unit=u.deg, sep=":", precision=2, alwayssign=True, pad=True)
            return ra_deg, dec_deg, ra_hms, dec_dms, "curated_catalogue"

    # Online resolution via CDS Sesame
    try:
        url = f"https://cds.unistra.fr/cgi-bin/nph-sesame/-oxp/SNV?{clean_name}"
        resp = requests.get(url, timeout=3)
        if resp.status_code == 200 and "<jpos>" in resp.text:
            match = re.search(r"<jpos>([\d\.\-]+)\s+([\d\.\-]+)</jpos>", resp.text)
            if match:
                ra_deg = float(match.group(1))
                dec_deg = float(match.group(2))
                coord = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")
                ra_hms = coord.ra.to_string(unit=u.hour, sep=":", precision=2, pad=True)
                dec_dms = coord.dec.to_string(unit=u.deg, sep=":", precision=2, alwayssign=True, pad=True)
                return ra_deg, dec_deg, ra_hms, dec_dms, "cds_sesame"
    except Exception:
        pass

    return None

def _is_float(val: str) -> bool:
    try:
        float(val)
        return True
    except ValueError:
        return False

