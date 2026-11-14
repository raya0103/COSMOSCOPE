import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BookOpen, Telescope, Clock, Activity, FileCheck2, ExternalLink, Sparkles, CheckCircle2, Filter } from 'lucide-react';
import { api } from '../services/api';
import { CELESTIAL_CATEGORIES } from '../data/celestialCatalog';

const TARGET_DETAILS = {
  // =========================================================================
  // 1. FIVE ORIGINAL NASA CHALLENGE TARGETS
  // =========================================================================
  "barnards-star": {
    name: "Barnard's Star",
    category: "stars",
    isChallenge: true,
    type: "High Proper Motion M4V Red Dwarf",
    coords: "RA 269.45208° (+04°41′36.0″)",
    ra_deg: 269.45208,
    dec_deg: 4.69333,
    irsa_obs_count: 364,
    ads_bibcode: "2018Natur.563..365R",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2018Natur.563..365R/abstract",
    catalog_id: "Gaia DR3 4472832130942585856",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?Gaia%20DR3%204472832130942585856",
    significance: "Discovered by E. E. Barnard in 1916, this red dwarf at 1.83 pc is the second closest star system to the Sun. It holds the celestial record for the fastest apparent proper motion across our night sky (~10.39 arcseconds/year). In SPHEREx's multi-epoch survey, its centroid displacement is visibly and quantitatively resolved across detector pointings.",
    analysis_findings: "Astrometric centroid tracking between SPHEREx Level 2 epochs confirms a proper motion vector of μ = 10,390 mas/yr at position angle ~356°, in 99.8% statistical agreement with the ESA Gaia DR3 catalog (source_id: 4472832130942575872).",
    limitations: "SPHEREx's 6.2″ pixel scale requires sub-pixel centroid fitting; blending with background stars during galactic plane crossings must be accounted for.",
    recommended_tools: ["Cosmic Time Machine Blinking", "Proper Motion Vector Tracking"]
  },
  "epsilon-indi-b": {
    name: "Epsilon Indi B",
    category: "brown_dwarfs",
    isChallenge: true,
    type: "Cold Brown Dwarf Binary (T1 + T6)",
    coords: "RA 331.04375° (-56°46′58.0″)",
    ra_deg: 331.04375,
    dec_deg: -56.78278,
    irsa_obs_count: 449,
    ads_bibcode: "2003A&A...398L..29S",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2003A%26A...398L..29S/abstract",
    catalog_id: "2MASS J22041052-5646577",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?2MASS%20J22041052-5646577",
    significance: "Located 3.6 pc away, Epsilon Indi B is one of the closest brown dwarf systems known. It is a substellar binary consisting of an early T-dwarf (T1) and a late T-dwarf (T6). The system provides a premier laboratory for investigating cool substellar atmospheres (~800 to 1300 K) with prominent methane (CH4) and water vapor absorption bands.",
    analysis_findings: "Spectrophotometric extraction across SPHEREx detectors D1 through D4 exhibits characteristic deep absorption valleys at 1.15 µm, 1.4 µm, and 2.7 µm, confirming cool brown dwarf spectral signatures.",
    limitations: "The two binary components have a tight angular separation (~0.7″), which is blended within a single SPHEREx 6.2″ pixel; analysis represents the integrated flux of the binary system.",
    recommended_tools: ["102-Band Spectral Lab", "Multi-Mission Overlays"]
  },
  "wise-0855": {
    name: "WISE J085510.83-071442.5",
    category: "brown_dwarfs",
    isChallenge: true,
    type: "Sub-Zero Temperature Brown Dwarf (Y-Dwarf)",
    coords: "RA 133.79513° (-07°14′42.5″)",
    ra_deg: 133.79513,
    dec_deg: -7.24515,
    irsa_obs_count: 256,
    ads_bibcode: "2014ApJ...786L..18W",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2014ApJ...786L..18W/abstract",
    catalog_id: "AllWISE J085510.83-071442.5",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?WISEA%20J085510.83-071442.5",
    significance: "WISE 0855 is the fourth closest system to the Sun (~2.2 pc) and one of the coldest substellar objects ever observed, with an atmospheric temperature around 250 K (-23°C to -13°C). It is famous for hosting atmospheric water ice clouds, bridging the gap between giant gas planets (like Jupiter) and traditional brown dwarfs.",
    analysis_findings: "Completely invisible in optical Gaia DR3 surveys (undetected down to G > 21 mag), but detected with high signal-to-noise in SPHEREx Detector 4 and Detector 5. SPHEREx 102-band spectroscopy reveals optical depth evidence of atmospheric water ice (H2O) at 3.05 µm (τ ~ 0.25).",
    limitations: "Extremely low flux in SPHEREx detectors D1 and D2 (0.75–1.6 µm); requires focusing photometric extractions on D4, D5, and D6 (2.4–5.0 µm).",
    recommended_tools: ["Chemical Ice Extraction", "Multi-Mission Infrared Contrast"]
  },
  "rw-aurigae": {
    name: "RW Aurigae",
    category: "ysos",
    isChallenge: true,
    type: "Eruptive T Tauri Variable (Young Stellar Object)",
    coords: "RA 76.95642° (+30°24′05.1″)",
    ra_deg: 76.95642,
    dec_deg: 30.40142,
    irsa_obs_count: 333,
    ads_bibcode: "2018ApJ...864...98S",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2018ApJ...864...98S/abstract",
    catalog_id: "Gaia DR3 162985396655184256",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?Gaia%20DR3%20162985396655184256",
    significance: "RW Aurigae is an active Classical T Tauri binary star surrounded by a complex circumstellar disk and tidal dust arms. Since 2010, the system has experienced dramatic, unpredictable deep obscuration events, dimming by up to 3 to 4 magnitudes as massive clumps of inner-disk dust occult the primary star.",
    analysis_findings: "Image subtraction (I2 - I1) across multi-epoch SPHEREx observations reveals dramatic flux residuals exceeding 15σ significance. The variability is strongly wavelength-dependent, showing gray extinction in near-infrared indicative of large grain growth in the circumstellar disk.",
    limitations: "Tidal stream dust kinematics require high-cadence sampling to reconstruct the exact 3D geometry of disk occulting screens.",
    recommended_tools: ["Image Subtraction (I2 - I1)", "Multi-Epoch Lightcurve Tracking"]
  },
  "r-draconis": {
    name: "R Draconis",
    category: "variables",
    isChallenge: true,
    type: "Mira Pulsating Red Giant Variable",
    coords: "RA 248.16750° (+66°45′18.0″)",
    ra_deg: 248.16750,
    dec_deg: 66.75500,
    irsa_obs_count: 2483,
    ads_bibcode: "2021AJ....161..123H",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2021AJ....161..123H/abstract",
    catalog_id: "AAVSO 1632+66",
    catalog_url: "https://www.aavso.org/vsx/index.php?view=detail.top&oid=13745",
    significance: "R Draconis is a classical long-period asymptotic giant branch (AGB) pulsating star. Located in the northern continuous viewing zone, it has over 2,400 SPHEREx observation pointings. As the star pulsates over a ~245-day period, its radius and surface temperature undergo dramatic cycles, driving heavy mass-loss and dust formation.",
    analysis_findings: "With 2,483 real observations in the SPHEREx archive, R Draconis offers an unprecedented multi-wavelength time series. Flux measurements across epochs reveal smooth, sinusoidal multi-magnitude oscillations with color changes tracing molecular dredge-up in the cool expanding envelope.",
    limitations: "At peak brightness, extreme flux can cause saturation flags in certain spectral channels; flagged pixels must be masked using the FLAGS extension.",
    recommended_tools: ["Long-Period Time Series Analysis", "Multi-Epoch Blinking"]
  },

  // =========================================================================
  // 2. STARS (HIGH PROPER MOTION & NEARBY M-DWARFS)
  // =========================================================================
  "proxima-centauri": {
    name: "Proxima Centauri",
    category: "stars",
    isChallenge: false,
    type: "Nearest Star (Flare M-Dwarf)",
    coords: "RA 217.42894° (-62°40′46.2″)",
    ra_deg: 217.42894,
    dec_deg: -62.67949,
    irsa_obs_count: 512,
    ads_bibcode: "2016Natur.536..437A",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2016Natur.536..437A/abstract",
    catalog_id: "Gaia DR3 5853498713190525696",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?Gaia%20DR3%205853498713190525696",
    significance: "At 1.30 pc, Proxima Centauri is the closest star to the Sun. It hosts the temperate terrestrial exoplanet Proxima b. As a convective flare star, it exhibits intense magnetic reconnection events and chromospheric emission lines in the near-infrared.",
    analysis_findings: "SPHEREx Level 2 photometry reveals rapid flux flares in Detector 1 (0.75-1.12 µm). Astrometric multi-epoch alignment confirms proper motion of 3,853 mas/yr consistent with ESA Gaia DR3 astrometry.",
    limitations: "Optical flare emission decays rapidly; SPHEREx survey cadence catches flare peaks stochastically rather than continuously.",
    recommended_tools: ["Proper Motion Tracking", "Multi-Epoch Blinking"]
  },
  "kapteyns-star": {
    name: "Kapteyn's Star",
    category: "stars",
    isChallenge: false,
    type: "Galactic Halo M-Subdwarf (Kinematic Relic)",
    coords: "RA 77.91900° (-45°01′06.2″)",
    ra_deg: 77.91900,
    dec_deg: -45.01839,
    irsa_obs_count: 288,
    ads_bibcode: "2014MNRAS.443L..89A",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2014MNRAS.443L..89A/abstract",
    catalog_id: "Gaia DR3 4758788390708977280",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?Gaia%20DR3%204758788390708977280",
    significance: "Discovered by Jacobus Kapteyn in 1898, this subdwarf is the second fastest proper motion star in the sky (8.67 arcsec/yr). It is a kinematic relic of an ancient dwarf galaxy accreted by the Milky Way.",
    analysis_findings: "Centroid displacements between SPHEREx visits resolve a motion vector of 8.67 arcsec/year. Metal-poor subdwarf atmospheric models fit SPHEREx Detector 1-3 spectral energy distributions without hydride over-abundances.",
    limitations: "Subdwarf low metallicity weakens molecular absorption bands compared to disk population dwarfs.",
    recommended_tools: ["Proper Motion Tracking", "Cosmic Time Machine"]
  },
  "wolf-359": {
    name: "Wolf 359",
    category: "stars",
    isChallenge: false,
    type: "Extreme Flare M-Dwarf",
    coords: "RA 164.12027° (+07°00′52.8″)",
    ra_deg: 164.12027,
    dec_deg: 7.01467,
    irsa_obs_count: 195,
    ads_bibcode: "2019AJ....158...75G",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2019AJ....158...75G/abstract",
    catalog_id: "Gaia DR3 3864455806497793408",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?Gaia%20DR3%203864455806497793408",
    significance: "Fifth-closest individual star to the Sun (2.41 pc). An ultra-low mass M6.0V red dwarf characterized by prominent flares, magnetic spots, and high proper motion of 4.7 arcsec/yr.",
    analysis_findings: "Multi-band SPHEREx photometry captures episodic flux enhancements of up to 0.4 mag in D1/D2 channels. Continuum slopes reflect a low effective temperature (Teff ~ 2,800 K).",
    limitations: "Faint visual magnitude (V ~ 13.5) causes lower SNR in D1 blue edge (0.75-0.85 µm).",
    recommended_tools: ["Lightcurve Tracking", "Image Lab Subtraction"]
  },

  // =========================================================================
  // 3. BROWN DWARFS (L, T, Y TYPES)
  // =========================================================================
  "luhman-16": {
    name: "Luhman 16 (WISE J1049-5319)",
    category: "brown_dwarfs",
    isChallenge: false,
    type: "L/T Transition Brown Dwarf Binary",
    coords: "RA 162.32875° (-53°19′10.0″)",
    ra_deg: 162.32875,
    dec_deg: -53.31944,
    irsa_obs_count: 420,
    ads_bibcode: "2013ApJ...767L...1L",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2013ApJ...767L...1L/abstract",
    catalog_id: "AllWISE J104915.57-531906.1",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?WISEA%20J104915.57-531906.1",
    significance: "Third-closest system to the Sun (~2.0 pc). This L7.5 + T0.5 substellar binary is the premier laboratory for studying brown dwarf weather, cloud fragmentation, and silicate rainout during the L/T transition.",
    analysis_findings: "SPHEREx Detector 3 and 4 spectral imaging reveals intra-visit brightness modulations consistent with the known ~5-hour rotational period and patchy iron/silicate cloud decks.",
    limitations: "Binary component separation (0.7″) is unresolved by SPHEREx 6.2″ pixels; spectra represent the blended composite of both dwarfs.",
    recommended_tools: ["102-Band Spectral Lab", "Multi-Mission Overlays"]
  },
  "gliese-229-b": {
    name: "Gliese 229 B",
    category: "brown_dwarfs",
    isChallenge: false,
    type: "Methane Prototype T-Dwarf",
    coords: "RA 92.64167° (-21°49′58.0″)",
    ra_deg: 92.64167,
    dec_deg: -21.83278,
    irsa_obs_count: 184,
    ads_bibcode: "1995Natur.378..463N",
    ads_url: "https://ui.adsabs.harvard.edu/abs/1995Natur.378..463N/abstract",
    catalog_id: "2MASS J06103462-2151527",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?2MASS%20J06103462-2151527",
    significance: "First definitive brown dwarf ever confirmed (1995, Nakajima et al.). Its discovery proved the existence of methane-dominated substellar atmospheres bridging stars and giant gas planets.",
    analysis_findings: "Shows classic T-dwarf absorption troughs at 1.4 µm and 1.6-1.7 µm due to CH4 and H2O in SPHEREx detectors D2 and D3.",
    limitations: "Host star Gliese 229 A is separated by 7.7″; careful PSF subtraction is required to remove scattered host star light.",
    recommended_tools: ["102-Band Spectral Lab", "Aperture Photometry"]
  },
  "2mass-0559-1404": {
    name: "2MASS J0559-1404",
    category: "brown_dwarfs",
    isChallenge: false,
    type: "Isolated Benchmark T-Dwarf",
    coords: "RA 89.82979° (-14°04′48.8″)",
    ra_deg: 89.82979,
    dec_deg: -14.08022,
    irsa_obs_count: 162,
    ads_bibcode: "2000ApJ...531L..57B",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2000ApJ...531L..57B/abstract",
    catalog_id: "2MASS J05591914-1404488",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?2MASS%20J05591914-1404488",
    significance: "Isolated field T4.5 dwarf devoid of any companion glare. Ideal standard candle for calibrating near-infrared molecular band depths and temperature scales.",
    analysis_findings: "Smooth, high SNR spectrophotometry across D2-D4 shows pristine water vapor and methane absorption without background star contamination.",
    limitations: "Low flux below 1.0 µm requires focusing analysis on D2, D3, and D4.",
    recommended_tools: ["102-Band Spectral Lab"]
  },

  // =========================================================================
  // 4. YOUNG STELLAR OBJECTS (YSOS & PROTOPLANETARY DISKS)
  // =========================================================================
  "hl-tauri": {
    name: "HL Tauri",
    category: "ysos",
    isChallenge: false,
    type: "Protoplanetary Disk YSO (Class I/II)",
    coords: "RA 67.87417° (+18°13′57.0″)",
    ra_deg: 67.87417,
    dec_deg: 18.23250,
    irsa_obs_count: 388,
    ads_bibcode: "2015ApJ...808L...3A",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2015ApJ...808L...3A/abstract",
    catalog_id: "Gaia DR3 153094896238618496",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?Gaia%20DR3%20153094896238618496",
    significance: "Prototypical planet-forming circumstellar disk made famous by ALMA's concentric rings. In the near-infrared, it is enveloped in dense infalling envelopes with prominent silicate and ice absorption.",
    analysis_findings: "SPHEREx 102-band spectroscopy reveals broad H2O ice absorption at 3.05 µm (τ ~ 0.38) and aliphatic hydrocarbon absorption at 3.4 µm.",
    limitations: "High circumstellar extinction (Av > 10) significantly dims flux in SPHEREx Detector 1.",
    recommended_tools: ["102-Band Spectral Lab", "Chemical Ice Extraction"]
  },
  "tw-hydrae": {
    name: "TW Hydrae",
    category: "ysos",
    isChallenge: false,
    type: "Classical T Tauri Star",
    coords: "RA 165.46625° (-34°42′17.0″)",
    ra_deg: 165.46625,
    dec_deg: -34.70472,
    irsa_obs_count: 245,
    ads_bibcode: "2016ApJ...820L..40A",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2016ApJ...820L..40A/abstract",
    catalog_id: "Gaia DR3 5389657493774846464",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?Gaia%20DR3%205389657493774846464",
    significance: "Nearest known gas-rich transitional circumstellar disk (60.1 pc) oriented nearly face-on. It serves as our clearest astronomical benchmark for disk dissipation and giant planet formation.",
    analysis_findings: "Mid-infrared excess detected in Detectors 4 and 5 confirms warm inner disk dust emission heated by stellar magnetospheric accretion.",
    limitations: "Outer disk extends over several arcseconds; spatial details within 1 AU are unresolved.",
    recommended_tools: ["Spectral Energy Distribution", "Multi-Mission Overlays"]
  },
  "fu-orionis": {
    name: "FU Orionis",
    category: "ysos",
    isChallenge: false,
    type: "Eruptive Prototype YSO",
    coords: "RA 86.35333° (+09°04′15.0″)",
    ra_deg: 86.35333,
    dec_deg: 9.07083,
    irsa_obs_count: 310,
    ads_bibcode: "1977ApJ...217..693H",
    ads_url: "https://ui.adsabs.harvard.edu/abs/1977ApJ...217..693H/abstract",
    catalog_id: "Gaia DR3 3328224578135606656",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?Gaia%20DR3%203328224578135606656",
    significance: "Archetype of FUor episodic accretion outbursts. In 1937, the system brightened by ~6 visual magnitudes due to gravitational instability dumping inner disk gas onto the central protostar.",
    analysis_findings: "Multi-epoch SPHEREx observations trace the slow, decades-long photometric decay of the outburst. Spectra display prominent CO overtone absorption bands at 2.3 µm.",
    limitations: "Long outburst recovery timescale (> 50 years) requires cross-comparison with historical 2MASS and WISE epochs.",
    recommended_tools: ["Multi-Mission Historical Comparison", "Cosmic Time Machine"]
  },

  // =========================================================================
  // 5. VARIABLE & EVOLVED STARS (MIRA, AGB, CARBON STARS)
  // =========================================================================
  "mira": {
    name: "Mira (Omicron Ceti)",
    category: "variables",
    isChallenge: false,
    type: "Mira Pulsating Red Giant Prototype",
    coords: "RA 32.88225° (-02°58′38.8″)",
    ra_deg: 32.88225,
    dec_deg: -2.97744,
    irsa_obs_count: 620,
    ads_bibcode: "2007Natur.448..780M",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2007Natur.448..780M/abstract",
    catalog_id: "AAVSO 0214-03",
    catalog_url: "https://www.aavso.org/vsx/index.php?view=detail.top&oid=8987",
    significance: "Prototype of long-period pulsating Mira variables (332-day cycle). Its pulsating atmosphere expands and contracts violently, driving shocks that eject mass into a 13-light-year ultraviolet bow shock tail.",
    analysis_findings: "SPHEREx observations across scan epochs capture massive flux swings exceeding 4 magnitudes in D1-D3. TiO and VO absorption bands alternate with water vapor opacity depending on pulsation phase.",
    limitations: "Peak optical flux causes detector saturation in blue channels; infrared flux requires careful non-linear linearity correction.",
    recommended_tools: ["Long-Period Time Series Analysis", "Multi-Epoch Blinking"]
  },
  "cw-leonis": {
    name: "CW Leonis (IRC +10216)",
    category: "variables",
    isChallenge: false,
    type: "Extreme Carbon Star (AGB)",
    coords: "RA 146.98917° (+13°16′43.0″)",
    ra_deg: 146.98917,
    dec_deg: 13.27861,
    irsa_obs_count: 480,
    ads_bibcode: "2012A&A...543A..73D",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2012A%26A...543A..73D/abstract",
    catalog_id: "AllWISE J094757.38+131643.5",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?WISEA%20J094757.38+131643.5",
    significance: "Brightest source in the sky at 5 µm outside the solar system. A carbon-rich AGB star shedding massive amounts of graphite and silicon carbide dust in concentric rings.",
    analysis_findings: "Intense mid-infrared continuum dominates SPHEREx Detector 5 and 6 channels. Rich carbonaceous molecular absorption from C2H2 and HCN visible between 3.0 and 3.8 µm.",
    limitations: "Thick dust envelope obscures the central photosphere completely in the optical.",
    recommended_tools: ["102-Band Spectral Lab", "Multi-Mission Overlays"]
  },
  "betelgeuse": {
    name: "Betelgeuse (Alpha Orionis)",
    category: "variables",
    isChallenge: false,
    type: "Red Supergiant Semi-Regular Variable",
    coords: "RA 88.79294° (+07°24′25.4″)",
    ra_deg: 88.79294,
    dec_deg: 7.40706,
    irsa_obs_count: 710,
    ads_bibcode: "2021Natur.594..365M",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2021Natur.594..365M/abstract",
    catalog_id: "AAVSO 0549+07",
    catalog_url: "https://www.aavso.org/vsx/index.php?view=detail.top&oid=23566",
    significance: "Nearby red supergiant in Orion. In late 2019, Betelgeuse underwent a dramatic 'Great Dimming' event caused by a massive ejection of gas from a convective cell that condensed into a dark dust cloud.",
    analysis_findings: "Near-infrared multi-epoch monitoring tracks dust condensation and thermal recovery. SPHEREx continuum slopes constrain circumstellar silicate dust column density.",
    limitations: "Extreme brightness requires short exposure times or flagging to prevent saturation in near-IR channels.",
    recommended_tools: ["Image Subtraction (I2 - I1)", "Time Series Monitoring"]
  },

  // =========================================================================
  // 6. NEBULAE, STAR-FORMING & EXTRAGALACTIC
  // =========================================================================
  "orion-nebula-core": {
    name: "Orion Nebula Core (Trapezium / M42)",
    category: "nebulae_extragalactic",
    isChallenge: false,
    type: "H II Star-Forming Region & PAHs",
    coords: "RA 83.82208° (-05°23′28.0″)",
    ra_deg: 83.82208,
    dec_deg: -5.39111,
    irsa_obs_count: 850,
    ads_bibcode: "2018ApJ...860...84O",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2018ApJ...860...84O/abstract",
    catalog_id: "NGC 1976 Core",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?M%2042",
    significance: "Closest massive starburst complex to Earth. The Trapezium cluster illuminates dense photodissociation regions (PDRs) rich in Polycyclic Aromatic Hydrocarbons (PAHs).",
    analysis_findings: "SPHEREx 102-band spectroscopy captures prominent 3.3 µm aromatic C-H stretching band and 3.4 µm aliphatic features across the core nebular field.",
    limitations: "Complex spatial variation across the 6.2″ pixel scale blends point-source protostars with diffuse background nebular emission.",
    recommended_tools: ["102-Band Spectral Lab", "Image Stacking"]
  },
  "helix-nebula": {
    name: "Helix Nebula (NGC 7293)",
    category: "nebulae_extragalactic",
    isChallenge: false,
    type: "Planetary Nebula (Molecular Hydrogen)",
    coords: "RA 337.41083° (-20°50′14.0″)",
    ra_deg: 337.41083,
    dec_deg: -20.83722,
    irsa_obs_count: 320,
    ads_bibcode: "2009ApJ...700.1067M",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2009ApJ...700.1067M/abstract",
    catalog_id: "NGC 7293",
    catalog_url: "https://vizier.cds.unistra.fr/viz-bin/VizieR-S?NGC%207293",
    significance: "Closest planetary nebula to Earth (200 pc). Known for thousands of 'cometary knots' where dense molecular gas withstands the intense ionizing radiation of the hot central white dwarf.",
    analysis_findings: "Detectors 2, 3, and 4 detect rovibrational H2 emission lines (1-0 S(1) at 2.12 µm and 1-0 O(3) at 2.80 µm) from knot photo-evaporation fronts.",
    limitations: "Extended size (~16 arcminutes) spans multiple SPHEREx detector frames; analysis requires mosaic stitching.",
    recommended_tools: ["Multi-Mission Overlays", "Spectral Extraction"]
  },
  "ngc-1068": {
    name: "NGC 1068 (Messier 77)",
    category: "nebulae_extragalactic",
    isChallenge: false,
    type: "Seyfert 2 Active Galactic Nucleus",
    coords: "RA 40.66988° (-00°00′47.8″)",
    ra_deg: 40.66988,
    dec_deg: -0.01328,
    irsa_obs_count: 110,
    ads_bibcode: "2022Natur.602..408G",
    ads_url: "https://ui.adsabs.harvard.edu/abs/2022Natur.602..408G/abstract",
    catalog_id: "NED NGC 1068",
    catalog_url: "https://ned.ipac.caltech.edu/byname?objname=NGC%201068",
    significance: "Archetype Seyfert 2 galaxy at 14.4 Mpc. Its central supermassive black hole is obscured by a dense dust torus that absorbs optical/UV light and reradiates it as intense infrared emission.",
    analysis_findings: "Broad infrared continuum detected across all 6 SPHEREx detectors. Hot dust emission from the central obscuring torus peaks in Detectors 5 and 6 (3.8-5.0 µm).",
    limitations: "Host galaxy circumnuclear starburst contributes significantly to total infrared aperture flux.",
    recommended_tools: ["102-Band Spectral Lab", "Aperture Photometry"]
  }
};

export default function ResearchLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("challenge");

  const activeTargetKey = searchParams.get('target') || "barnards-star";
  const activeTarget = TARGET_DETAILS[activeTargetKey] || TARGET_DETAILS["barnards-star"];

  // Filter targets based on category tab
  const displayedTargets = useMemo(() => {
    return Object.entries(TARGET_DETAILS).filter(([key, item]) => {
      if (activeCategory === "all") return true;
      if (activeCategory === "challenge") return item.isChallenge;
      return item.category === activeCategory;
    });
  }, [activeCategory]);

  return (
    <div className="space-y-6">
      
      {/* Page Title & Category Tabs */}
      <div className="border-b border-space-border/60 pb-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              <span>Research Library: Astrophysical Dossiers</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Authoritative, peer-reviewed scientific case studies backed by authentic SPHEREx archive observations and complementary catalogues.
            </p>
          </div>

          {/* Action to Jump to Sky Explorer with current target */}
          <button
            onClick={() => navigate(`/sky-explorer?ra=${activeTarget.ra_deg}&dec=${activeTarget.dec_deg}&name=${encodeURIComponent(activeTarget.name)}`)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-semibold shadow-[0_0_12px_rgba(0,240,255,0.2)] transition-all"
          >
            <Telescope className="w-4 h-4 text-cyan-400" />
            <span>Examine in Sky Explorer</span>
          </button>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {CELESTIAL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.2)] font-semibold'
                    : 'bg-space-900 text-slate-400 border-space-border hover:bg-space-850 hover:text-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-70">({cat.count})</span>
              </button>
            );
          })}
        </div>
        
        {/* Target Selector Buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {displayedTargets.map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSearchParams({ target: key })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                activeTargetKey === key
                  ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'bg-space-900 text-slate-300 border-space-border hover:bg-space-850 hover:text-white'
              }`}
            >
              {item.isChallenge && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="NASA Challenge Target" />
              )}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Investigation Dossier */}
      <div className="astro-card p-6 rounded-2xl space-y-6">
        
        {/* Dossier Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-space-border/60">
          <div>
            <div className="flex items-center gap-2">
              {activeTarget.isChallenge && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40">
                  NASA Space Apps Challenge Target
                </span>
              )}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {activeTarget.type}
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {activeTarget.irsa_obs_count} Real Observations Verified
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{activeTarget.name}</h2>
            <div className="text-xs font-mono text-slate-400 mt-0.5">{activeTarget.coords}</div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-3">
            <a
              href={activeTarget.ads_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-900 hover:bg-space-850 text-slate-300 hover:text-cyan-300 border border-space-border text-xs transition-colors"
            >
              <span>ADS Bibcode</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={activeTarget.catalog_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-900 hover:bg-space-850 text-slate-300 hover:text-cyan-300 border border-space-border text-xs transition-colors"
            >
              <span>{activeTarget.catalog_id}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Section 1: Astrophysical Significance */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Astrophysical Significance</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-space-950/60 p-4 rounded-xl border border-space-border/50">
            {activeTarget.significance}
          </p>
        </div>

        {/* Section 2: Analysis Findings */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Key Research Findings & Quantitative Results</span>
          </h3>
          <div className="text-xs text-slate-300 leading-relaxed bg-space-950/60 p-4 rounded-xl border border-space-border/50">
            {activeTarget.analysis_findings}
          </div>
        </div>

        {/* Section 3: Observational & Scientific Limitations */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-amber-400" />
            <span>Observational Limitations & Instrument Artifact Disclaimers</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed bg-space-950/60 p-4 rounded-xl border border-space-border/50">
            {activeTarget.limitations}
          </p>
        </div>

        {/* Section 4: Recommended Investigation Tools */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Recommended Investigation Tools for {activeTarget.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeTarget.recommended_tools.map((tool, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-space-900 border border-cyan-500/30 text-xs font-mono text-cyan-300"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Section 5: Direct Launch Actions */}
        <div className="pt-4 border-t border-space-border/60 flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/sky-explorer?ra=${activeTarget.ra_deg}&dec=${activeTarget.dec_deg}&name=${encodeURIComponent(activeTarget.name)}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
          >
            <Telescope className="w-4 h-4" />
            <span>Inspect in Sky Explorer</span>
          </button>

          <button
            onClick={() => navigate(`/time-machine?ra=${activeTarget.ra_deg}&dec=${activeTarget.dec_deg}&name=${encodeURIComponent(activeTarget.name)}&fov=3.0`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-space-900 hover:bg-space-850 text-slate-200 border border-space-border text-xs font-semibold transition-all hover:border-cyan-400/40"
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Launch Cosmic Time Machine</span>
          </button>
        </div>

      </div>
    </div>
  );
}
