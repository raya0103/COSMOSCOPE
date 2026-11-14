# COSMOSCOPE: Project Overview & Executive Summary
**NASA Space Apps Challenge 2026**  
**Challenge Track:** Explore the Changing Infrared Universe  
**Platform Name:** COSMOSCOPE  

---

## 1. The Challenge

NASA's **SPHEREx** (Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer) space telescope, launched in March 2025, maps the celestial sphere every six months in **102 near-infrared spectral bands** ($0.75\text{--}5.00\,\mu\text{m}$).

However, extracting scientific discoveries from multi-epoch all-sky surveys presents major barriers:
1. **Multi-Epoch Fragmentation:** Datasets are scattered across different NASA and ESA archives (IRSA, 2MASS, WISE, Gaia) with varying coordinate conventions, file formats, and calibration units.
2. **Static Viewer Limitations:** Traditional archive portals present static FITS image downloads that require complex desktop software (DS9, SAOImage) to compare observations across time.
3. **High-Volume Triage:** Separating genuine physical variables (pulsating Mira stars, eruptive YSOs, fast-moving brown dwarfs) from telescope dithers, cosmic rays, and detector artifacts requires specialized automated ranking.

---

## 2. The Solution: COSMOSCOPE

**COSMOSCOPE** transforms raw NASA archive data into an **interactive, scientifically authentic astronomical time machine**. 

It enables researchers, students, and citizen scientists to:
- Connect directly to the official **NASA/IPAC Infrared Science Archive (IRSA)** via IVOA TAP and IBE cutout services.
- Retrieve, calibrate, and inspect real Level 2 Multi-Extension FITS (MEF) cutouts.
- Animate observations chronologically as a time-lapse or compare epochs using a high-speed **Hardware-Accelerated Blinker**.
- Bridge the 27-year historical baseline between **2MASS (1998)**, **WISE (2010)**, **NEOWISE (2014–2024)**, and **SPHEREx (2025)**.
- Extract complete **102-channel spectrophotometry** and identify molecular ice absorption lines ($\text{H}_2\text{O}$ at $3.05\,\mu\text{m}$, $\text{CO}_2$ at $4.27\,\mu\text{m}$, $\text{CO}$ at $4.67\,\mu\text{m}$).
- Perform mathematical **image subtraction ($I_2 - I_1$)** and **inverse-variance image stacking**.
- Export publication-ready, cryptographically verifiable **PDF Evidence Passports**.

---

## 3. Core Scientific Pillars

```
+---------------------------------------------------------------------------------------+
|                                  COSMOSCOPE PLATFORM                                  |
+---------------------------------------------------------------------------------------+
|  1. Cosmic Time Machine    | 2. 102-Band Spectral Lab    | 3. Image Analysis Lab      |
|  - Real FITS frame loading | - 0.75 to 5.0 um SED curves | - WCS reprojection         |
|  - 1-5 FPS Time-lapse      | - Detectors D1 to D6        | - Flux-matched diff (I2-I1)|
|  - 60 FPS Optical Blinker  | - Ice absorption detection  | - Inverse-variance stacking|
|  - Astrometric trajectories| - Physical flux (uJy & MJy) | - SNR gain factor (sqrt N) |
+----------------------------+-----------------------------+----------------------------+
|  4. Multi-Mission History  | 5. Anomaly Intelligence     | 6. Citizen Science Network |
|  - 1998-2025 baseline      | - 5-factor scoring (0-100)  | - Community review queue   |
|  - 2MASS, WISE, SPHEREx    | - Kinematic & flux triage   | - Interactive voting cards |
|  - Secular proper motion   | - Rule-based transparency   | - Consensus scoring        |
+---------------------------------------------------------------------------------------+
```

---

## 4. Validated Research Case Studies

COSMOSCOPE includes verified multi-epoch datasets for all five challenge targets:

1. **Barnard's Star (Runaway Red Dwarf):**  
   - Highest proper motion known: $\mu = 10.36''/\text{yr}$.
   - Over a 27.26-year baseline (2MASS 1998 $\rightarrow$ SPHEREx 2025), COSMOSCOPE tracks a net displacement of **$280.95''$** across the sky.
2. **WISE 0855-0714 (Cold Sub-Zero Brown Dwarf):**  
   - Fourth closest system to the Sun ($2.2\,\text{pc}$) with atmospheric water-ice clouds.
   - High proper motion: $\mu = 8.13''/\text{yr}$ ($121.50''$ total displacement over 14.94 years).
3. **RW Aurigae (Eruptive T Tauri Star):**  
   - Actively accreting young stellar object.
   - Demonstrates a **$45.0\%$ ($0.65\,\text{mag}$) photometric dimming event** within $30.25\,\text{hours}$ between SPHEREx Visit 1 and Visit 2 caused by circumstellar disk dust occultation.
4. **Epsilon Indi B (Substellar Binary):**  
   - Nearby brown dwarf binary system ($3.6\,\text{pc}$) with proper motion $\mu = 4.72''/\text{yr}$ ($121.24''$ displacement).
5. **R Draconis (Northern CVZ Mira Variable):**  
   - Pulsating red giant in the Continuous Viewing Zone with period $P \approx 245.6\,\text{days}$.
   - Shows $+6.4\%$ ascending pulsation flux change across a $19.54\,\text{hour}$ baseline between Visit 1 and Visit 2.

---

## 5. Technology Stack Summary

- **Backend:** Python 3.14, FastAPI, Uvicorn, Astropy, NumPy, SciPy, OpenCV, ReportLab, SQLite/MySQL.
- **Frontend:** React 19, Vite 6, Tailwind CSS, Plotly.js, HTML5 Canvas Blinker, Lucide React.
- **Data Protocols:** IVOA TAP, ADQL, IBE Cutout, FITS MEF, WCS-SIP.
- **Test Coverage:** 16 automated backend integration tests covering health, archive queries, centroiding, difference imaging, and report generation.

---

## 6. Broader Impact

COSMOSCOPE bridges the gap between raw space telescope telemetry and accessible scientific discovery. By providing an open-source, web-based platform with interactive visual analytics and rigorous formal error bars, it equips university classrooms, amateur astronomers, and professional researchers to participate directly in the changing infrared universe.
