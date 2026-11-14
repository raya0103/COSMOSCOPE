# COSMOSCOPE
### *Explore the Changing Infrared Universe*
**NASA Space Apps Challenge 2026** • *SPHEREx All-Sky Spectral Survey*  
[![Status](https://img.shields.io/badge/Status-Complete-success.svg)](#) [![Tests](https://img.shields.io/badge/Tests-16%2F16%20Passing-brightgreen.svg)](#) [![SPHEREx](https://img.shields.io/badge/SPHEREx-102%20Bands-blue.svg)](#) [![NASA%20IRSA](https://img.shields.io/badge/Archive-NASA%2FIPAC%20IRSA-orange.svg)](#)

---

## 🌌 Overview

**COSMOSCOPE** is a scientifically rigorous astronomical time machine and multi-epoch exploration platform built for NASA's **SPHEREx** (Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer) mission.

Launched in March 2025, SPHEREx surveys the entire sky in **102 near-infrared spectral bands ($0.75\text{--}5.00\,\mu\text{m}$)** across six $2048 \times 2048$ detector arrays. COSMOSCOPE connects directly to the official **NASA/IPAC Infrared Science Archive (IRSA)**, cross-matching SPHEREx observations with **2MASS (1998)**, **WISE (2010)**, **NEOWISE (2014–2024)**, and **Gaia DR3** to reveal how the infrared cosmos shifts, dims, flares, and moves across time.

---

## 🌟 Key Capabilities

### 1. Interactive Cosmic Time Machine
- **Authentic Multi-Epoch Loading:** Seamlessly load and switch between real SPHEREx survey visits and sequential dither steps.
- **Video-Like Chronological Playback:** Scrub through observation dates or play time-lapse animations at variable speeds (1, 2, 5 FPS).
- **Interactive Blink Comparator:** Toggle rapidly between two observation epochs on an HTML5 Canvas to immediately identify proper-motion displacements and photometric flares.
- **Synchronized Vector Astrometry & Light Curves:** Real-time Plotly charts tracking Right Ascension, Declination, Angular Displacement, and surface brightness across epochs.

### 2. Multi-Mission Historical View (1998–2025)
- Bridges the 27-year baseline between **2MASS (1998)**, **WISE (2010)**, **NEOWISE (2015)**, and **SPHEREx (2025)**.
- Tracks macroscopic proper motion ($\mu > 10''/\text{yr}$ for Barnard's Star, $\mu > 8''/\text{yr}$ for WISE 0855) across 4 independent observatories with strict instrument provenance and genuine FITS cutouts.

### 3. 102-Band Near-Infrared Spectrophotometry
- Full spectral energy distribution (SED) extraction across all 6 focal plane arrays (Detectors D1 through D6).
- Automated spectroscopic identification of characteristic interstellar ice absorption features:
  - $\text{H}_2\text{O}$ ice absorption at **$3.05\,\mu\text{m}$** (Detector D3)
  - $\text{CO}_2$ ice absorption at **$4.27\,\mu\text{m}$** (Detector D5)
  - $\text{CO}$ ice absorption at **$4.67\,\mu\text{m}$** (Detector D6)

### 4. Scientific Image Processing Lab
- **Astrometric Centroid Engine:** Sub-pixel circular aperture centroid with local sky annulus background subtraction and formal Landman & King centroid uncertainties ($\sigma \approx 6.2\,\text{mas}$).
- **Flux-Matched Difference Imaging ($I_2 - I_1$):** WCS tangent plane reprojection, sky pedestal matching, and $>3\sigma$ transient residual detection.
- **Inverse-Variance Image Stacking:** Optimal weighted co-addition delivering empirical $\sqrt{N}$ signal-to-noise ratio gains.

---

## 🚀 Three Signature Innovations

1. **Cosmic Anomaly Intelligence (Score: 0–100):** A transparent, rule-based ranking engine scoring astronomical candidates across 5 physical dimensions: proper motion velocity, photometric variability, color excess, spectral line anomalies, and catalog crossmatches.
2. **Discovery Evidence Passport:** A publication-ready vector PDF research dossier generated on the fly via ReportLab, packaging observation telemetry, WCS cutouts, difference maps, light curves, and cryptographic verification hashes for peer review.
3. **Citizen Discovery Network:** A community-driven science portal with interactive classification cards, artifact flagging, and consensus voting to crowd-source candidate validation.

---

## 🔬 Five NASA Challenge Targets

COSMOSCOPE includes verified multi-epoch datasets for all 5 NASA Space Apps challenge objects:
1. **Barnard's Star:** High proper motion runaway M-dwarf ($\mu = 10.36''/\text{yr}$, $280.95''$ total displacement over 27.26 years).
2. **WISE 0855-0714:** Sub-zero temperature cold brown dwarf with atmospheric water-ice clouds ($\mu = 8.13''/\text{yr}$).
3. **RW Aurigae:** Eruptive Young Stellar Object (YSO) demonstrating a $45\%$ ($0.65\,\text{mag}$) episodic circumstellar dust occultation event.
4. **Epsilon Indi B:** Cold substellar binary brown dwarf with high proper motion ($\mu = 4.72''/\text{yr}$).
5. **R Draconis:** Northern Continuous Viewing Zone (CVZ) Mira red giant pulsating with period $P \approx 245.6\,\text{days}$ ($+6.4\%$ flux rise in 19.54h).

---

## 🛠️ Quickstart Guide (Windows)

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ and npm
- Standard modern web browser

### Option A: One-Click Launch (Recommended)
Simply double-click:
```cmd
start.bat
```
This automatically boots the FastAPI backend on port 8000 and the Vite frontend on port 5173.

### Option B: Manual Setup

1. **Start the Backend:**
   ```cmd
   cd backend
   python -m pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --port 8000
   ```
   API interactive documentation will be live at `http://localhost:8000/docs`.

2. **Start the Frontend:**
   ```cmd
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing

Run the full backend integration test suite:
```cmd
python -u tests/test_backend.py
```
*Result:* **16 / 16 PASSED (100%)**

Validate all 5 challenge targets across multi-epoch SPHEREx visits and historical multi-mission FITS:
```cmd
python -u backend/tests/test_multiepoch_targets.py
```

Build frontend for production:
```cmd
npm --prefix frontend run build
```

---

## 📚 Technical Documentation Index

- [`SCIENTIFIC_VALIDATION_REPORT.md`](SCIENTIFIC_VALIDATION_REPORT.md) — Comprehensive mathematical audit of astrometry, photometry, and WCS formulas.
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — Full system architecture, component diagrams, and data flows.
- [`DATA_SOURCES.md`](DATA_SOURCES.md) — NASA/IPAC IRSA, Gaia DR3, AllWISE, and 2MASS archive specifications.
- [`DEVELOPMENT_STATUS.md`](DEVELOPMENT_STATUS.md) — Feature-by-feature implementation and deliverables matrix.
- [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) — Full REST API specifications and schemas.
- [`JUDGE_DEMO_SCRIPT.md`](JUDGE_DEMO_SCRIPT.md) — Step-by-step 3-minute hackathon judge walkthrough.
- [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) — Concise project summary for presentations.
- [`TECHNICAL_INNOVATIONS.md`](TECHNICAL_INNOVATIONS.md) — Deep dive into the 3 signature innovations.
- [`CHALLENGE_REQUIREMENTS_MAPPING.md`](CHALLENGE_REQUIREMENTS_MAPPING.md) — Complete mapping of NASA challenge guidelines to code.
