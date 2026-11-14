# COSMOSCOPE: 3-Minute Judge Demonstration Script
**Presentation Guide for Hackathon Judges & Evaluators**  
**Role:** Presenter / Developer (BTech IT Student Friendly)  
**Total Duration:** Exactly 3 Minutes (180 Seconds)  
**Live URL:** `http://localhost:5173/time-machine`  

---

## 🎯 High-Level Pitch (0:00 – 0:30)

### What to say:
> "Hello judges! Today, we are proud to present **COSMOSCOPE: Explore the Changing Infrared Universe**.
>
> NASA's SPHEREx space telescope, launched in 2025, maps the entire sky in **102 near-infrared colors**. But astronomy isn't static—stars explode, asteroids move, and brown dwarfs drift across space.
>
> Most tools just show static pictures. We built a genuine **Astronomical Time Machine** that hooks directly into NASA's IRSA archive, loads real calibrated FITS image cutouts across multiple survey visits, and animates cosmic changes over time—with zero synthetic data."

### What to do on screen:
1. Open browser to `http://localhost:5173/`.
2. Briefly point to the Mission Control dashboard showing live backend connection, 102 channels, and 6 detector arrays.

---

## ⏱️ Act 1: The Cosmic Time Machine in Action (0:30 – 1:15)

### What to say:
> "Let’s jump straight to our central feature: the **Cosmic Time Machine**.
>
> Here we have **Barnard's Star**, the fastest-moving star in our night sky. 
> Notice what happens when I scrub the timeline across SPHEREx's scan steps: the actual FITS image canvas updates in real time. We are looking at real surface brightness in Megajanskys per steradian.
>
> If I hit **Play Time-Lapse**, you can watch the sequential observations play like a movie.
>
> Next, I toggle the **Interactive Blinker**. By rapidly alternating between Visit 1 and Visit 2, the human eye instantly spots sub-pixel motion that static charts miss. 
>
> Below the canvas, our engine automatically computes the astronomical centroid with local sky subtraction and plots Right Ascension and Declination versus time with formal uncertainty of just **6 milliarcseconds**."

### What to do on screen:
1. Navigate to `/time-machine` (or click 'Time Machine' in navbar).
2. Show Barnard's Star selected.
3. Drag the observation timeline slider across the 7 epochs.
4. Click **Play (2 FPS)** to show smooth playback.
5. Click **Blink Comparison** to show rapid optical toggling between Visit 1 and Visit 2.
6. Point to the synchronized Plotly graphs below (RA vs Time, Dec vs Time).

---

## 🌍 Act 2: Multi-Mission Historical View (1:15 – 1:50)

### What to say:
> "SPHEREx revisits sky regions every six months. But what if we want to see massive astronomical motion across decades?
>
> With one click, I toggle the **Multi-Mission Historical View**.
>
> COSMOSCOPE pulls together 27 years of NASA data: starting from **2MASS in 1998**, to **WISE in 2010**, **NEOWISE in 2015**, and finally **SPHEREx in 2025**.
>
> Look at the displacement chart: Barnard's Star has traveled **280 arcseconds** across the sky! Our engine calculates an annual proper motion of **10.31 arcseconds per year**, matching Gaia DR3's catalog value within 99.5% accuracy."

### What to do on screen:
1. Click the **Multi-Mission (1998–2025)** toggle button on the Time Machine banner.
2. Scrub from 1998 (2MASS) to 2010 (WISE) to 2025 (SPHEREx).
3. Point to the total displacement readout: **280.95 arcsec** and the historical mission badges.

---

## 🔬 Act 3: 102-Band Spectral Lab & Difference Imaging (1:50 – 2:30)

### What to say:
> "Now let's examine SPHEREx's secret weapon: **102 spectral bands**.
>
> In the **Spectral Lab**, we extract the full Spectral Energy Distribution from 0.75 to 5.0 microns across all 6 detectors. For cold brown dwarf **WISE 0855**, our algorithm automatically detects the molecular signature of **water ice clouds at 3.05 microns**.
>
> In the **Image Analysis Lab**, we perform real mathematical difference imaging ($I_2 - I_1$). For eruptive variable **RW Aurigae**, you can see a massive flux drop where circumstellar dust eclipsed the star by 45% between visits.
>
> And when observing faint objects, our **Inverse-Variance Stacking** co-adds multi-epoch frames to boost the signal-to-noise ratio by the square root of $N$."

### What to do on screen:
1. Click **Spectral Lab** in the navbar: show the 102-channel SED curve with highlighted $\text{H}_2\text{O}$ ice absorption.
2. Click **Image Lab**: show the difference image $(I_2 - I_1)$ with residual dipole mapping.

---

## 🏆 Act 4: Three Signature Innovations & Closing (2:30 – 3:00)

### What to say:
> "Finally, we built three signature innovations into COSMOSCOPE:
>
> 1. **Cosmic Anomaly Intelligence:** A transparent scoring engine that ranks astronomical targets based on motion velocity, photometric variability, and infrared excess.
> 2. **Discovery Evidence Passport:** With one click, we export a publication-ready PDF research dossier complete with WCS cutouts, difference maps, light curves, and cryptographic verification hashes for peer review.
> 3. **Citizen Discovery Network:** A community review queue where citizen scientists can vote on whether candidates are genuine discoveries or detector artifacts.
>
> All 20 NASA challenge requirements are fully implemented, tested with 16 automated backend integration tests, and ready for deployment.
>
> Thank you, and we welcome your questions!"

### What to do on screen:
1. Click **Evidence Passport** in navbar, show the dossier summary, and click **Download PDF Report**.
2. Briefly open the exported PDF to show the clean figures and telemetry.
3. Return to Mission Control and stand by for questions.

---

## 💡 Quick Answers to Likely Judge Questions

1. **Q: Did you fabricate any observation images or timestamps?**  
   *A:* "Absolutely not. Every single observation comes from authentic NASA archives (SPHEREx QR2 Level 2B, 2MASS, WISE, Gaia DR3). For coordinates or dates without archive coverage, our engine displays a clear 'No archive data' notice rather than generating fake sky maps."

2. **Q: How do you calculate the proper motion without assuming the answer?**  
   *A:* "We determine the sub-pixel centroid of the star in each FITS frame using an aperture center-of-light algorithm with local sky background subtraction. We then convert those pixel coordinates to celestial Right Ascension and Declination via Astropy WCS and divide the angular displacement by the elapsed baseline time ($\Delta t$)."

3. **Q: How does this help real scientists or the public?**  
   *A:* "Real astronomers can perform fast multi-mission cross-matching and generate publication-ready PDF evidence passports. At the same time, high school students and citizen scientists can use our interactive blinker and time-lapse player to make their own discoveries without needing complex command-line software."
