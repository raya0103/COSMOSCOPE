# COSMOSCOPE: Astronomical Data Sources & Provenance Directory
**Platform:** COSMOSCOPE — Explore the Changing Infrared Universe  
**NASA Space Apps Challenge 2026** • *SPHEREx All-Sky Spectral Survey*  
**Document Version:** 2.0.0  

---

## 1. Overview of Integrated Data Archives

COSMOSCOPE synthesizes data across five premier astronomical data facilities to enable multi-epoch, multi-wavelength, and multi-decadal investigation of the infrared universe:

```
+---------------------------------------------------------------------------------------+
|                                    COSMOSCOPE                                         |
+---------------------------------------------------------------------------------------+
        |                    |                    |                   |
        v                    v                    v                   v
+----------------+  +-----------------+  +-----------------+  +-----------------+
|  NASA/IPAC     |  |  ESA Gaia DR3   |  |   NASA WISE /   |  |   NASA/IPAC     |
|  IRSA SPHEREx  |  |  Optical        |  |   NEOWISE IR    |  |   2MASS NIR     |
|  (2025)        |  |  (2016-2022)    |  |   (2010-2024)   |  |   (1998-1999)   |
+----------------+  +-----------------+  +-----------------+  +-----------------+
```

---

## 2. Primary Survey: NASA SPHEREx Mission

### 2.1 Mission Profile
- **Mission Name:** Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer (SPHEREx)
- **Host Institution:** Jet Propulsion Laboratory (JPL) / California Institute of Technology (Caltech) / NASA MIDEX
- **Launch Date:** March 2025
- **Orbit:** Sun-synchronous low Earth orbit (terminator orbit, inclination $\sim 97^\circ$)
- **Survey Cadence:** Complete all-sky survey every $\sim 6\,\text{months}$; Continuous Viewing Zones (CVZ) at ecliptic poles revisited multiple times per day.
- **Instrument:** $20\,\text{cm}$ telescope feeding six $2048 \times 2048$ pixel Mercury-Cadmium-Telluride (HgCdTe) focal plane arrays with Linear Variable Filters (LVFs).

### 2.2 SPHEREx Detectors & Wavelength Channels

| Detector Array | Central Wavelength Range | Spectral Resolving Power ($R = \lambda/\Delta\lambda$) | Number of Bands | Scientific Target |
| :---: | :---: | :---: | :---: | :--- |
| **D1** | $0.75\text{--}1.11\,\mu\text{m}$ | $R \approx 41$ | 17 | Stellar classification, optical-NIR transition |
| **D2** | $1.11\text{--}2.42\,\mu\text{m}$ | $R \approx 41$ | 17 | Galaxy red-sequence, low-mass brown dwarfs |
| **D3** | $2.42\text{--}3.82\,\mu\text{m}$ | $R \approx 41$ | 17 | Interstellar $\text{H}_2\text{O}$ ice absorption ($3.05\,\mu\text{m}$) |
| **D4** | $3.12\text{--}3.82\,\mu\text{m}$ | $R \approx 41$ | 17 | Polycyclic Aromatic Hydrocarbons (PAH $3.3\,\mu\text{m}$) |
| **D5** | $3.82\text{--}4.42\,\mu\text{m}$ | $R \approx 135$ | 17 | Interstellar $\text{CO}_2$ ice absorption ($4.27\,\mu\text{m}$) |
| **D6** | $4.42\text{--}5.00\,\mu\text{m}$ | $R \approx 135$ | 17 | Interstellar $\text{CO}$ ice absorption ($4.67\,\mu\text{m}$) |
| **Total** | **$0.75\text{--}5.00\,\mu\text{m}$** | **$R \approx 41\text{--}135$** | **102 Bands** | **All-Sky Spectral Mapping** |

### 2.3 Archive Endpoints & Data Model
- **Archive Host:** NASA/IPAC Infrared Science Archive (IRSA)
- **TAP Service URL:** `https://irsa.ipac.caltech.edu/TAP/sync`
- **Tables Queried:**
  - `spherex.obscore`: Standard IVOA ObsCore representation (`obs_id`, `s_ra`, `s_dec`, `t_min`, `t_max`, `t_exptime`, `access_url`).
  - `spherex.plane`: Product plane characteristics (`energy_bandpassname`, `detector`, `calib_level`).
  - `spherex.artifact`: Level 2 FITS file storage locations and filenames.
- **Image Cutout Service (IBE):** `https://irsa.ipac.caltech.edu/ibe/data/spherex/qr2/level2/...`

---

## 3. Secondary Survey: Gaia Data Release 3 (Gaia DR3)

### 3.1 Mission Profile & Use in COSMOSCOPE
- **Operating Agency:** European Space Agency (ESA)
- **Telescope:** Twin $1.45 \times 0.5\,\text{m}$ optical mirrors with $1\,\text{Gpixel}$ focal plane.
- **Reference Epoch:** J2016.0 ($\text{MJD } 57388.0$).
- **Function in COSMOSCOPE:** Independent ground truth for optical astrometry, high-precision proper motion vectors ($\mu_\alpha^*, \mu_\delta$), parallax (distance determination), and optical magnitudes ($G, G_{\text{BP}}, G_{\text{RP}}$).

### 3.2 TAP Service & Query Specification
- **Table Name:** `gaia_dr3_source` (via IRSA TAP mirror)
- **Queried Parameters:**
  - `source_id`: Unique 64-bit identifier.
  - `ra`, `dec`: ICRS celestial coordinates at epoch J2016.0.
  - `pmra`, `pmdec`: Proper motion in mas/yr ($\mu_\alpha^* = \mu_\alpha\cos\delta$).
  - `pmra_error`, `pmdec_error`: Formal astrometric uncertainties.
  - `parallax`, `parallax_error`: Trigonometric parallax in mas.
  - `phot_g_mean_mag`, `phot_bp_mean_mag`, `phot_rp_mean_mag`: Optical magnitudes.

---

## 4. Infrared Archive: NASA WISE / NEOWISE

### 4.1 Mission Profile & Use in COSMOSCOPE
- **Mission Name:** Wide-field Infrared Survey Explorer (WISE) / NEOWISE Reactivation
- **Operating Agency:** NASA / JPL-Caltech / IPAC
- **Filters:**
  - W1: $3.4\,\mu\text{m}$ (sensitive to stellar photospheres)
  - W2: $4.6\,\mu\text{m}$ (sensitive to sub-stellar brown dwarfs, methane absorption)
  - W3: $12\,\mu\text{m}$ (warm dust)
  - W4: $22\,\mu\text{m}$ (cold dust)
- **Function in COSMOSCOPE:** Provides intermediate-epoch ($2010\text{--}2024$) infrared imaging and photometry to bridge the 27-year baseline between 2MASS (1998) and SPHEREx (2025).

---

## 5. Historical Baseline: Two Micron All Sky Survey (2MASS)

### 5.1 Mission Profile & Use in COSMOSCOPE
- **Operating Facility:** University of Massachusetts / IPAC / NASA (1997–2001)
- **Filters:** $J$ ($1.25\,\mu\text{m}$), $H$ ($1.65\,\mu\text{m}$), $K_s$ ($2.16\,\mu\text{m}$)
- **Function in COSMOSCOPE:** Establishes the $t_0$ reference epoch ($1998\text{--}1999$) for macroscopic astronomical motion tracking over a quarter-century.

---

## 6. Astronomical Name Resolution: CDS Sesame & SIMBAD

- **Host Service:** Centre de Données astronomiques de Strasbourg (CDS), France
- **Endpoint:** `https://cds.unistra.fr/cgi-bin/nph-sesame/-oxp/SNV`
- **Function:** Resolves arbitrary astronomical object identifiers (e.g., "Barnard's Star", "Vega", "Trappist-1") into verified ICRS Right Ascension and Declination coordinates.

---

## 7. Data Provenance & Attribution Policy

All data products manipulated by COSMOSCOPE strictly adhere to open NASA and IVOA standards:
1. **No Synthetic Images:** For observation dates where no telescope visited a sky region, COSMOSCOPE displays clear "No archive data" notices rather than fabricating synthetic sky maps.
2. **Transparent Calibration:** Surface brightness is preserved in physical units ($\text{MJy/sr}$) with pixel conversion factors explicitly declared.
3. **Attribution:** Any research dossier or PDF Evidence Passport generated by the platform includes full digital provenance citations acknowledging NASA, IPAC, JPL, Caltech, ESA Gaia, and CDS.
