# COSMOSCOPE: Technical Innovations Deep Dive
**Platform:** COSMOSCOPE — Explore the Changing Infrared Universe  
**NASA Space Apps Challenge 2026** • *Signature Innovations Architecture*  

---

## Executive Summary

While standard astronomical tools provide basic image viewing or catalog lookup, COSMOSCOPE introduces **three signature architectural innovations** that elevate the platform from a simple visualizer into an end-to-end scientific discovery ecosystem:

1. **Cosmic Anomaly Intelligence (Scoring & Triage)**
2. **Discovery Evidence Passport (Cryptographic PDF Dossier)**
3. **Citizen Discovery Network (Human-in-the-Loop Consensus)**

---

## 🌟 Innovation 1: Cosmic Anomaly Intelligence

### 1.1 Physical Motivation & Design Goal
With hundreds of thousands of individual point sources observed in every SPHEREx sky tile, astronomers cannot manually inspect every candidate. Deep-learning black boxes often fail to provide interpretable physical justification for why an object is flagged. 

**Cosmic Anomaly Intelligence** is an explainable, physics-grounded multi-factor ranking engine that scores candidates on a scale from $0.0$ to $100.0$ based on five distinct observational criteria.

### 1.2 Mathematical Formulation & Factor Weights

$$\text{Anomaly Score} = \sum_{k=1}^5 w_k \cdot S_k, \quad \sum_{k=1}^5 w_k = 1.00$$

| Factor Index | Metric Name | Weight ($w_k$) | Measurement Formulation | Physical Meaning |
| :---: | :--- | :---: | :--- | :--- |
| **$S_1$** | **Proper Motion Kinematics** | $0.30$ | $S_1 = \min\left(100, \frac{\mu_{\text{total}}}{100\,\text{mas/yr}} \times 20\right)$ | Flags fast-moving nearby stars, high-velocity brown dwarfs, and solar system asteroids ($\mu > 500\,\text{mas/yr}$). |
| **$S_2$** | **Photometric Variability** | $0.25$ | $S_2 = \min\left(100, \frac{|F_{\text{max}} - F_{\text{min}}|}{\bar{F}} \times 100\right)$ | Detects variable stars, stellar flares, supernovae, and circumstellar occultations ($>20\%$ flux shift). |
| **$S_3$** | **Infrared Color Excess** | $0.20$ | $S_3 = \min\left(100, \frac{(W1 - W2) - 0.2}{0.8} \times 100\right)$ | Identifies circumstellar protoplanetary dust disks, YSOs, and ultra-cool sub-stellar atmospheres. |
| **$S_4$** | **Spectral Absorption Anomalies** | $0.15$ | $S_4 = \min\left(100, \frac{\text{Depth}_{\text{ice}}}{0.30} \times 100\right)$ | Measures absorption depth at $3.05\,\mu\text{m}$ ($\text{H}_2\text{O}$ ice), $4.27\,\mu\text{m}$ ($\text{CO}_2$ ice), and $4.67\,\mu\text{m}$ ($\text{CO}$ ice). |
| **$S_5$** | **Optical Catalog Crossmatch** | $0.10$ | $S_5 = 100$ if Gaia DR3 undetected; $20$ if cataloged star | Highlights optically dark infrared discoveries (e.g. cold Y-dwarfs like WISE 0855). |

### 1.3 Classification Tiers & Automated Explanations
Candidates are automatically categorized into operational tiers:
- **`CONFIRMED_ANOMALY` ($Score \ge 80.0$):** High-priority discovery requiring immediate targeted follow-up.
- **`KNOWN_VARIABLE_OR_MOTION` ($50.0 \le Score < 80.0$):** Confirmed high-motion star or long-period variable (e.g. Barnard's Star, R Draconis).
- **`CANDIDATE_ANOMALY` ($35.0 \le Score < 50.0$):** Moderate statistical deviation needing community inspection.
- **`STANDARD_STELLAR_SOURCE` ($Score < 35.0$):** Unremarkable stellar photosphere.

---

## 📜 Innovation 2: Discovery Evidence Passport

### 2.1 The Problem with Ephemeral Discoveries
When an astronomer or citizen scientist spots a candidate anomaly on the web, sharing the result typically involves low-resolution screenshots that lack essential telemetry, WCS coordinates, calibration versions, and uncertainty bounds required for scientific replication.

### 2.2 Vector PDF Dossier Architecture
The **Evidence Passport** engine (`backend/app/reports/evidence_passport.py`) dynamically synthesizes a publication-quality, archival PDF research dossier using Python's `reportlab` library:

1. **Header & Metadata Passport:**
   - Astronomical Target Name & Resolved ICRS Coordinates $(\alpha, \delta)$.
   - Unique Research Dossier ID and timestamp.
   - SHA256 Cryptographic Digest of the underlying FITS files ensuring tamper-evident provenance.
2. **Calibrated Astronomical Imagery:**
   - Visual cutouts in physical units ($\text{MJy/sr}$) with orientation compass ($\text{North}\uparrow, \text{East}\leftarrow$) and $30''$ scale bar.
   - Contrast stretching (`asinh`, `log`) preserving dynamic range.
3. **Flux-Matched Difference Map:**
   - Visual $I_2 - I_1$ residual image highlighting dipole signatures of proper motion or central monopoles of stellar variability.
4. **Photometric & Astrometric Analytics:**
   - Formal aperture flux measurements with Landman & King centroid uncertainties.
   - Comparison between measured coordinates and Gaia DR3 propagated predictions.
5. **Full Citation & Pipeline Telemetry:**
   - Exact IRSA product IDs, ObsCore planes, pipeline version (QR2/QR3), and official NASA acknowledgments.

---

## 👥 Innovation 3: Citizen Discovery Network

### 3.1 Human-in-the-Loop Science
Automated algorithms excel at rapid mathematical filtering, but automated pipelines can still be fooled by detector artifacts:
- Latent image persistence (ghosts from previous bright pointings)
- Cosmic ray hits surviving median filtering
- Bad pixel columns and diffraction spikes

The **Citizen Discovery Network** (`frontend/src/pages/CitizenScience.jsx`) implements a community validation workflow connecting AI triage to human verification:

```
[NASA IRSA Archive] 
       │
       ▼
[Cosmic Anomaly Intelligence] (Scores >= 35.0)
       │
       ▼
[Review Queue Database (SQLite)]
       │
       ▼
[Citizen Review Cards] ───> Human Inspection ───> Consensus Scoring (70% threshold)
                                                      │
                                                      ├──> Confirmed Candidate
                                                      └──> Flagged Detector Artifact
```

### 3.2 Review Card Workflow
1. **Interactive Blink Inspection:** Citizens can blink the reference and target epochs directly within the review card.
2. **Multi-Category Classification:** Citizens tag candidates with specific labels:
   - *Genuine Proper Motion*
   - *Photometric Variable / Flare*
   - *Cosmic Ray / Artifact*
   - *Optical Persistent Ghost*
3. **Consensus Algorithm:** When a candidate receives $\ge 5$ independent classifications with $\ge 70\%$ agreement, its status automatically updates in the database, graduating it to confirmed discovery status or filtering it as an instrument artifact.
