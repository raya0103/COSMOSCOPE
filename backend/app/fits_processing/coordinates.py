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


def resolve_target_name(name: str) -> Optional[Tuple[float, float, str, str, str]]:
    """
    Resolves astronomical target names to ICRS coordinates via CDS Sesame service or offline catalog.
    """
    clean_name = name.strip()
    
    # Offline dictionary for the 5 NASA challenge targets + famous reference objects
    known_targets = {
        "barnard's star": (269.45208, 4.69333),
        "barnards star": (269.45208, 4.69333),
        "epsilon indi b": (331.04375, -56.78278),
        "wise 0855": (133.79513, -7.24515),
        "wise j085510.83-071442.5": (133.79513, -7.24515),
        "rw aurigae": (76.95642, 30.40142),
        "rw aur": (76.95642, 30.40142),
        "r draconis": (248.16750, 66.75500),
        "r dra": (248.16750, 66.75500),
        "crab nebula": (83.63308, 22.01450),
        "m101": (210.80227, 54.34895),
        "pinwheel galaxy": (210.80227, 54.34895),
        "vega": (279.23473, 38.78369),
        "betelgeuse": (88.79294, 7.40706),
    }
    
    lower_name = clean_name.lower()
    if lower_name in known_targets:
        ra_deg, dec_deg = known_targets[lower_name]
        coord = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")
        ra_hms = coord.ra.to_string(unit=u.hour, sep=":", precision=2, pad=True)
        dec_dms = coord.dec.to_string(unit=u.deg, sep=":", precision=2, alwayssign=True, pad=True)
        return ra_deg, dec_deg, ra_hms, dec_dms, "curated_catalogue"

    # Online resolution via CDS Sesame
    try:
        url = f"https://cds.unistra.fr/cgi-bin/nph-sesame/-oxp/SNV?{clean_name}"
        resp = requests.get(url, timeout=5)
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
