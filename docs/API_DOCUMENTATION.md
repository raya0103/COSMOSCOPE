# COSMOSCOPE — REST API Documentation
**Platform:** COSMOSCOPE — Explore the Changing Infrared Universe  
**NASA Space Apps Challenge 2026** • *SPHEREx All-Sky Spectral Survey*  
**Base URL:** `http://localhost:8000/api`  
**Interactive Docs:** `http://localhost:8000/docs` (OpenAPI Swagger UI)  

---

## 1. System Health & Targets

### `GET /api/health`
Returns system status, active version, channels, and IRSA archive connection health.
- **Response:**
  ```json
  {
    "status": "online",
    "service": "COSMOSCOPE API",
    "version": "2.0.0",
    "data_archive": "NASA/IPAC Infrared Science Archive (IRSA)",
    "channels": 102,
    "detectors": 6
  }
  ```

### `GET /api/targets`
Returns the 5 NASA Space Apps challenge objects with verified celestial coordinates and observation metadata.

---

## 2. Archive Retrieval & Cutouts

### `POST /api/observations/search`
Queries NASA/IPAC IRSA TAP (`spherex.obscore`, `spherex.plane`, `spherex.artifact`) for observations covering the given coordinates or target name.
- **Request Body (`CoordinateInput`):**
  ```json
  {
    "ra": 269.45208,
    "dec": 4.69333,
    "target_name": "Barnard's Star",
    "fov_arcmin": 3.0
  }
  ```
- **Response (`ObservationSearchResponse`):**
  Returns `target`, `total_observations`, `epochs_count`, `bands_available`, `detectors_available`, `time_span_days`, `can_compare` (boolean), `comparison_note`, and `observations` list.

### `GET /api/images/{obs_id}`
Retrieves the authentic Level 2 FITS cutout, parses MEF extensions, performs aperture photometry and astrometric centroid calculations, and returns an astronomical base64 thumbnail with flux statistics.
- **Query Parameters:**
  - `ra` (float, required): Right Ascension in decimal degrees.
  - `dec` (float, required): Declination in decimal degrees.
  - `fov_arcmin` (float, default: 3.0): Field of View in arcminutes.
  - `stretch` (str, default: `'asinh'`): Image scaling (`'asinh'`, `'log'`, `'sqrt'`, `'linear'`).
  - `colormap` (str, default: `'inferno'`): Visualization palette (`'inferno'`, `'viridis'`, `'magma'`, `'greyscale'`).
  - `detector` (int, default: 1): Detector focal plane array (1 to 6).
- **Key Response Fields:**
  - `obs_id`, `detector`, `date_obs`, `bunit` (`"MJy / sr"`)
  - `shape` (`[29, 29]`), `min_flux`, `max_flux`, `median_flux`
  - `checksum_md5`: Hexadecimal MD5 hash of the served FITS file.
  - `measured_centroid_px`: `{"x": float, "y": float}` (aperture centroid).
  - `centroid_uncertainty_arcsec`: Formal Landman/King error (e.g. $0.0062''$).
  - `peak_snr`: Signal-to-noise ratio at peak pixel.
  - `raw_grid`: 2D float array for client-side cursor flux inspection.

---

## 3. Cosmic Time Machine & Multi-Mission

### `GET /api/time-machine/multimission`
Returns authentic multi-mission historical observations spanning 1998 to 2025 across 2MASS, WISE, NEOWISE, and SPHEREx with strict instrument provenance.
- **Query Parameters:**
  - `ra` (float, required)
  - `dec` (float, required)
  - `target_name` (str, optional)
- **Response (`MultiMissionResponse`):**
  - `total_epochs`, `time_span_years`, `total_displacement_arcsec`, `annual_proper_motion_arcsec_yr`
  - `epochs`: Array of historical observation records with `mission`, `survey_facility`, `obs_date_iso`, `measured_ra_deg`, `measured_dec_deg`, `measured_flux_mjy`.

### `GET /api/time-machine/analytics`
Computes synchronized, publication-ready Plotly chart specifications for Right Ascension vs Time, Declination vs Time, Angular Displacement, and Light Curves.
- **Query Parameters:**
  - `ra` (float, required)
  - `dec` (float, required)
  - `target_name` (str, optional)
  - `mode` (str, default: `'spherex'`): `'spherex'` or `'multimission'`

---

## 4. Scientific Image Processing

### `POST /api/images/subtract`
Performs flux-matched difference imaging between two observation epochs ($I_2 - I_1$) on a common WCS tangent plane.
- **Request Body:**
  ```json
  {
    "obs_id_1": "2025W33_2C_0321_1",
    "obs_id_2": "2025W33_2C_0450_1",
    "ra": 269.45208,
    "dec": 4.69333,
    "fov_arcmin": 3.0,
    "normalize": true
  }
  ```
- **Response:**
  Returns residual statistics, significant flux variability flags ($>3\sigma$), positive/negative dipole counts, and a base64 difference image thumbnail.

### `POST /api/images/stack`
Performs inverse-variance or median co-addition across multi-epoch frames to enhance SNR.
- **Request Body:**
  ```json
  {
    "obs_ids": ["2025W33_2C_0321_1", "2025W33_2C_0321_2", "2025W33_2C_0321_3"],
    "ra": 269.45208,
    "dec": 4.69333,
    "method": "inverse_variance"
  }
  ```
- **Response:**
  Returns co-added base64 image, combined variance matrix, and empirical SNR gain factor ($\sqrt{N}$).

---

## 5. 102-Band Spectrophotometry

### `POST /api/spectrum/extract`
Extracts a full 102-band calibrated Spectral Energy Distribution (SED) across detectors D1–D6 ($0.75\text{--}5.00\,\mu\text{m}$) using WCS-WAVE calibration lookup tables.
- **Request Body:**
  ```json
  {
    "ra": 269.45208,
    "dec": 4.69333,
    "aperture_radius_arcsec": 6.2,
    "background_subtraction": true
  }
  ```
- **Response:**
  Returns 102 wavelength channels with flux densities in both $\text{MJy/sr}$ and $\mu\text{Jy}$, formal flux uncertainties, detected absorption features ($\text{H}_2\text{O}$ ice at $3.05\,\mu\text{m}$, $\text{CO}_2$ ice at $4.27\,\mu\text{m}$, $\text{CO}$ ice at $4.67\,\mu\text{m}$), and spectral classification.

---

## 6. Discovery Engine & Anomaly Intelligence

### `POST /api/discovery/rank`
Evaluates an astronomical candidate against the 5-factor Cosmic Anomaly Intelligence rule set (proper motion, flux variability, color excess, spectral lines, catalog crossmatch).
- **Response:**
  Returns composite anomaly score ($0\text{--}100$), classification tier (`KNOWN_VARIABLE_OR_MOTION`, `CANDIDATE_ANOMALY`, etc.), radar metric breakdown, and astrophysical explanation.

### `GET /api/candidates`
Returns the community review queue containing flagged targets with consensus vote tallies.

### `POST /api/candidates/{id}/classifications`
Submits a user classification review (e.g. "Genuine Proper Motion", "Detector Artifact", "Variable Star") to the SQLite review database.

---

## 7. Evidence Passport Export

### `POST /api/reports/export`
Generates a publication-ready PDF research dossier using ReportLab, containing observation telemetry, WCS cutouts, difference maps, light curves, and cryptographic verification hashes.
- **Response:**
  Binary PDF stream (`application/pdf`) with `Content-Disposition: attachment; filename="COSMOSCOPE_Evidence_Passport.pdf"`.
