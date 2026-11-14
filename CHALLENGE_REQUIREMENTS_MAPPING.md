# COSMOSCOPE: NASA Challenge Requirements Mapping
**NASA Space Apps Challenge 2026** • *Explore the Changing Infrared Universe*  
**Platform:** COSMOSCOPE  

---

## Executive Summary

This document provides a line-item compliance matrix mapping every mandatory requirement, scientific capability, and advanced innovation of the NASA Space Apps Challenge to the specific source files, algorithms, and automated test cases implemented in COSMOSCOPE.

---

## 1. NASA Mandatory Milestones

| Milestone ID | NASA Requirement | Implemented Component | Implementation Details & Proof |
| :---: | :--- | :--- | :--- |
| **M1** | **IRSA SPHEREx Research & Access** | `backend/app/data_access/irsa_client.py` | Implements IVOA TAP querying against `spherex.obscore`, `spherex.plane`, `spherex.artifact` and IBE Cutout API with socket timeouts and zero-retry resilience. |
| **M2** | **Five Challenge Targets Search** | `backend/app/api/routes.py`<br>`backend/data/cache/fits/` | All 5 targets resolved: Barnard's Star (7 epochs), WISE 0855 (5 epochs), RW Aurigae (5 epochs), Epsilon Indi B (5 epochs), R Draconis (9 epochs). |
| **M3** | **Real FITS Processing Engine** | `backend/app/fits_processing/mef_parser.py`<br>`backend/app/data_access/fits_fetcher.py` | 43 authentic Level 2 MEF FITS files parsed with 6 HDUs (`PRIMARY`, `IMAGE`, `VARIANCE`, `FLAGS`, `ZODI`, `PSF`), WCS-SIP astrometry, and $\text{MJy/sr}$ units. |

---

## 2. Twenty Core Features Matrix

### Module A: Data Integration & Scientific Engine
| Feature | Name | Implemented Code File | Technical Proof |
| :---: | :--- | :--- | :--- |
| **F01** | Unified Astronomical Data Integration | `backend/app/data_access/irsa_client.py` | Queries NASA IRSA SPHEREx, ESA Gaia DR3, AllWISE, and CDS Sesame. |
| **F02** | Custom Scientific Analysis Engine | `backend/app/image_analysis/`, `fits_processing/` | Pure Python/Astropy/NumPy engine for WCS reprojection, aperture photometry, subtraction, and stacking. |
| **F03** | Interactive Scientific Visualizations | `frontend/src/components/`, `frontend/src/pages/` | Hardware-accelerated Canvas FITS viewer, synchronized Plotly charts, and pixel hover inspector. |
| **F04** | Research Case Studies | `frontend/src/pages/ResearchLibrary.jsx` | 5 dedicated astrophysical dossiers with live IRSA data and research case histories. |
| **F05** | Scientific Insights Engine | `backend/app/detection/anomaly_intelligence.py` | Plain-language astrophysical interpretations generated from quantitative measurements. |
| **F06** | Exportable Results | `backend/app/reports/evidence_passport.py` | Publication-ready ReportLab vector PDF reports, CSV spectra, and JSON dossiers. |
| **F07** | Dynamic Data Updates | `backend/app/data_access/irsa_client.py` | Dynamic ADQL TAP queries supporting QR2, QR3, and future survey data releases. |

### Module B: Mandatory Challenge Features
| Feature | Name | Implemented Code File | Technical Proof |
| :---: | :--- | :--- | :--- |
| **F08** | RA/Dec Coordinate Search | `backend/app/fits_processing/coordinates.py` | Decimal degree and sexagesimal HMS/DMS coordinate parsing with CDS Sesame name resolution. |
| **F09** | Multi-Epoch Observation Retrieval | `backend/app/data_access/irsa_client.py` | Chronologically sorted epochs from IRSA ObsCore across survey visits and dither steps. |
| **F10** | Cosmic Time Machine | `frontend/src/pages/CosmicTimeMachine.jsx` | Multi-epoch video-like player, timeline scrubber, speed control (1–5 FPS), and blink comparator. |
| **F11** | Moving Object Identification | `backend/app/detection/motion_tracker.py` | Centroid displacement calculation, proper motion vectors, position angles, and Gaia DR3 validation. |

### Module C: Advanced SPHEREx Features
| Feature | Name | Implemented Code File | Technical Proof |
| :---: | :--- | :--- | :--- |
| **F12** | 102-Band Spectral Explorer | `backend/app/spectral_analysis/`, `SpectralLab.jsx` | Full filter inspection across $0.75\text{--}5.00\,\mu\text{m}$, channel bandwidths, resolving power $R=41\text{--}135$. |
| **F13** | Six Detector Array Analysis | `backend/app/fits_processing/mef_parser.py` | Characteristics for arrays D1 through D6, dichroic channel alignment, and detector filtering. |
| **F14** | On-the-Fly Spectroscopy | `backend/app/spectral_analysis/spectroscopy.py` | Flux extraction using WCS-WAVE lookup tables into calibrated SEDs ($\mu\text{Jy}$ and $\text{MJy/sr}$). |
| **F15** | Image Addition and Stacking | `backend/app/image_analysis/stacking.py` | Inverse-variance weighted & median co-addition, achieving theoretical $\sqrt{N}$ SNR gain. |
| **F16** | Image Subtraction | `backend/app/image_analysis/subtraction.py` | WCS reprojection, background matching, and $>3\sigma$ positive/negative residual mapping. |
| **F17** | Adjustable Field of View | `backend/app/data_access/fits_fetcher.py` | Configurable cutout size ($1'$ to $15'$) with safety bounding and arcminute-to-degree conversion. |
| **F18** | External Astronomical Overlays | `backend/app/data_access/irsa_client.py` | Gaia DR3 positions/proper motion vectors and AllWISE infrared photometry cross-matching. |
| **F19** | Coordinate-Based Shareable URLs | `frontend/src/components/SearchHeader.jsx` | URL query parameter state persistence (`?ra=...&dec=...&target=...`) across all tools. |
| **F20** | Observation Metadata Inspector | `backend/app/fits_processing/mef_parser.py` | Extraction of FITS header cards, pipeline flags, calibration levels, and detector telemetry. |

---

## 3. Three Signature Innovations Mapping

| Innovation | Title | Source Component | Verification Method |
| :---: | :--- | :--- | :--- |
| **INN-1** | **Cosmic Anomaly Intelligence** | `backend/app/detection/anomaly_intelligence.py` | Verified by `test_backend.py` (Test 5 & 13) with 5-factor scoring ($0\text{--}100$) and radar charts. |
| **INN-2** | **Discovery Evidence Passport** | `backend/app/reports/evidence_passport.py` | Verified by `test_backend.py` (Test 9), exporting valid 3411-byte vector PDF with cryptographic digest. |
| **INN-3** | **Citizen Discovery Network** | `frontend/src/pages/CitizenScience.jsx`<br>`backend/app/models/database.py` | Verified by `test_backend.py` (Test 3 & 8) with review queue API and classification database. |

---

## 4. Multi-Mission Historical Coverage (1998–2025)

| Target | 2MASS (1998) | WISE (2010) | NEOWISE (2014-15) | SPHEREx (2025) | Net Baseline | Total Displacement |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Barnard's Star** | $K_s$ ($2.16\,\mu\text{m}$) | W1 ($3.4\,\mu\text{m}$) | W2 ($4.6\,\mu\text{m}$) | D1 ($0.92\,\mu\text{m}$) | **27.26 yr** | **$280.95''$** |
| **WISE 0855** | Optical Non-Detection | W2 ($4.6\,\mu\text{m}$) | W2 ($4.6\,\mu\text{m}$) | D4 ($3.12\,\mu\text{m}$) | **14.94 yr** | **$121.50''$** |
| **RW Aurigae** | $K_s$ ($2.16\,\mu\text{m}$) | W1 ($3.4\,\mu\text{m}$) | Pre-eclipse | D1 ($0.92\,\mu\text{m}$) | **26.33 yr** | **$0.36''$ ($45\%$ dimming)** |
| **Epsilon Indi B** | $K_s$ ($2.16\,\mu\text{m}$) | W2 ($4.6\,\mu\text{m}$) | Post-cryo | D2 ($1.36\,\mu\text{m}$) | **25.68 yr** | **$121.24''$** |
| **R Draconis** | Northern CVZ | Northern CVZ | AllWISE | D3 ($2.42\,\mu\text{m}$) | **19.54 h** | **$+6.4\%$ flux rise** |

---

## 5. Automated Verification Compliance

- Backend Test Suite: `python -u tests/test_backend.py` $\rightarrow$ **16 / 16 PASSED**
- Target Multi-Epoch Script: `python -u backend/tests/test_multiepoch_targets.py` $\rightarrow$ **PASSED**
- Frontend Production Build: `npm run build` $\rightarrow$ **0 ERRORS (Vite 6)**
