import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  HelpCircle, 
  Sparkles, 
  Telescope, 
  Layers, 
  Compass, 
  Activity, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  BookOpen, 
  ShieldCheck, 
  BarChart3, 
  Clock, 
  X,
  Filter,
  Eye,
  Sliders,
  ChevronRight
} from 'lucide-react';

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState('q1'); // Open first question by default

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'about', label: 'About COSMOSCOPE', icon: Telescope },
    { id: 'dashboard', label: 'Dashboard Features', icon: Layers },
    { id: 'science', label: 'Science & Data', icon: Compass },
    { id: 'general', label: 'General FAQs', icon: BookOpen }
  ];

  // 27 Rigorous, Beginner-Friendly FAQs in Exact Requested Order
  const faqData = [
    // =========================================================================
    // CATEGORY 1 — ABOUT COSMOSCOPE
    // =========================================================================
    {
      id: 'q1',
      category: 'about',
      categoryLabel: 'About COSMOSCOPE',
      number: '01',
      q: 'What is COSMOSCOPE?',
      summary: 'An interactive astronomical exploration and analysis platform designed for exploring the changing infrared universe.',
      a: (
        <div className="space-y-4">
          <p>
            <strong className="text-[#F5F8FF] font-semibold">COSMOSCOPE</strong> is an interactive astronomical exploration and scientific analysis platform created for the <em>NASA Space Apps Challenge</em>. It gives researchers, students, and astronomy enthusiasts intuitive web-based tools to explore genuine multi-epoch infrared observations, investigate celestial objects, analyze physical changes over time, and evaluate scientific evidence through accessible visualizations.
          </p>
          <p>
            In simple language: just as a traditional telescope allows you to observe distant stars, COSMOSCOPE acts as a digital observatory for <strong>NASA’s SPHEREx space telescope</strong>. It lets you inspect real telescope images, watch celestial time-lapses to spot moving stars or flaring young stars, inspect the chemical composition of interstellar ices, and verify data authenticity with strict scientific provenance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#0B1730]/80 border border-cyan-500/20 text-xs">
              <span className="text-[#36DDF5] font-bold block mb-1">Authentic NASA Data</span>
              Calibrated Level-2 FITS cutouts from NASA/IPAC IRSA.
            </div>
            <div className="p-3 rounded-xl bg-[#0B1730]/80 border border-violet-500/20 text-xs">
              <span className="text-violet-400 font-bold block mb-1">Multi-Epoch Blinking</span>
              Watch stars move and change brightness across observation dates.
            </div>
            <div className="p-3 rounded-xl bg-[#0B1730]/80 border border-emerald-500/20 text-xs">
              <span className="text-emerald-400 font-bold block mb-1">102 Spectral Bands</span>
              Explore chemical signatures from water-ice to organic molecules.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'q2',
      category: 'about',
      categoryLabel: 'About COSMOSCOPE',
      number: '02',
      q: 'What is the SPHEREx mission?',
      summary: 'NASA’s all-sky near-infrared spectral survey mapping the cosmos in 102 distinct wavelengths.',
      a: (
        <div className="space-y-4">
          <p>
            <strong className="text-[#F5F8FF] font-semibold">SPHEREx</strong> stands for the <strong>Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer</strong>. It is a NASA Medium-Class Explorer (MIDEX) space mission designed and operated by NASA’s Jet Propulsion Laboratory (JPL) and Caltech.
          </p>
          <p>
            Unlike traditional telescopes that photograph the sky in broad visual colors, SPHEREx maps the entire celestial sphere every six months across <strong>102 narrow near-infrared spectral bands</strong> ranging from <code className="px-1.5 py-0.5 rounded bg-[#0B1730] border border-cyan-500/30 text-[#36DDF5] font-mono text-xs">0.75 µm to 5.0 µm</code>.
          </p>
          <div className="p-4 rounded-xl bg-[#0B1730]/90 border border-cyan-500/25 space-y-2">
            <div className="text-xs font-bold text-[#36DDF5] uppercase tracking-wider">Three Primary Scientific Pillars:</div>
            <ul className="text-xs space-y-2 list-disc list-inside text-[#C4D0E0]">
              <li><strong>Cosmic Inflation:</strong> Measuring 3D galaxy clustering across millions of galaxies to probe quantum fluctuations in the opening split-second of cosmic history.</li>
              <li><strong>Origin of Galaxies:</strong> Measuring extragalactic background light fluctuations to study how the first stars and infant galaxies illuminated the universe during the Epoch of Reionization.</li>
              <li><strong>Water & Interstellar Ices:</strong> Detecting biogenic ices (such as water <code className="text-[#36DDF5]">H₂O</code>, carbon dioxide <code className="text-[#36DDF5]">CO₂</code>, and carbon monoxide <code className="text-[#36DDF5]">CO</code>) in stellar nurseries to trace how the ingredients for life are incorporated into newly forming planetary systems.</li>
            </ul>
          </div>
        </div>
      )
    },

    // =========================================================================
    // CATEGORY 2 — UNDERSTANDING THE COSMOSCOPE DASHBOARD
    // =========================================================================
    {
      id: 'q3',
      category: 'dashboard',
      categoryLabel: 'Dashboard Features',
      number: '03',
      q: 'What is the COSMOSCOPE Dashboard?',
      summary: 'The unified scientific workspace containing all analysis tools, interactive viewers, and data pipelines.',
      a: (
        <div className="space-y-4">
          <p>
            The <strong className="text-[#F5F8FF] font-semibold">COSMOSCOPE Dashboard</strong> is the central research workbench that integrates nine specialized astronomical modules into one unified web application.
          </p>
          <p>
            Visitors can access the dashboard by clicking <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-[#36DDF5] font-mono text-xs font-bold">"Explore Dashboard"</span> in the top navigation bar, or by jumping directly into individual modules via the "Interactive Exploration" section on the landing page.
          </p>
          <p>
            The dashboard allows seamless navigation across target searching, time-lapse playback, 102-band spectroscopy, pixel-level FITS image processing, automated candidate detection, cross-catalogue queries, and cryptographic evidence dossier generation.
          </p>
        </div>
      )
    },
    {
      id: 'q4',
      category: 'dashboard',
      categoryLabel: 'Dashboard Features',
      number: '04',
      q: 'What is Sky Explorer?',
      summary: 'Interactive sky targeting, coordinate search, all-sky maps, and SPHEREx cutout retrieval.',
      a: (
        <div className="space-y-3">
          <p>
            <strong className="text-[#F5F8FF] font-semibold">Sky Explorer</strong> is the interactive sky navigation and targeting gateway. It allows you to:
          </p>
          <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-[#C4D0E0]">
            <li><strong>Search for Celestial Objects:</strong> Search by common object names (e.g., <em>Barnard's Star</em>, <em>RW Aurigae</em>) or enter exact equatorial coordinates (<span className="text-[#36DDF5] font-mono">RA</span> and <span className="text-[#36DDF5] font-mono">Dec</span> in degrees or sexagesimal notation).</li>
            <li><strong>Explore the All-Sky Galaxy Map:</strong> Pan, zoom, and rotate across the celestial sphere with interactive constellation boundaries and galactic coordinate grids.</li>
            <li><strong>Toggle Multi-Survey Layers:</strong> Switch between optical (<span className="text-sky-300 font-mono">DSS2</span>), near-infrared (<span className="text-sky-300 font-mono">2MASS</span>), and mid-infrared (<span className="text-sky-300 font-mono">AllWISE</span>) survey backdrops.</li>
            <li><strong>Select Targets & Load SPHEREx Cutouts:</strong> Click any featured target or arbitrary coordinate to instantly retrieve authentic SPHEREx Level-2 FITS cutouts from NASA archives.</li>
            <li><strong>Adjust Field of View (FOV):</strong> Adjust the field of view from wide contextual sweeps (<span className="text-[#36DDF5] font-mono">30°</span>) down to narrow pinpoint science apertures (<span className="text-[#36DDF5] font-mono">10'</span>).</li>
            <li><strong>View Observation Details:</strong> Inspect UTC/MJD timestamps, detector array index (<span className="text-[#36DDF5] font-mono">D1–D6</span>), and coordinate validation headers.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q5',
      category: 'dashboard',
      categoryLabel: 'Dashboard Features',
      number: '05',
      q: 'What is the Cosmic Time Machine?',
      summary: 'Multi-epoch temporal viewer, astronomical time-lapse player, and image blinking.',
      a: (
        <div className="space-y-3">
          <p>
            The <strong className="text-[#F5F8FF] font-semibold">Cosmic Time Machine</strong> is a dedicated temporal analysis tool designed to inspect how the universe changes across multiple observation dates.
          </p>
          <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-[#C4D0E0]">
            <li><strong>Explore Multi-Date Observations:</strong> Load observations captured at different survey passes (epochs) to track changes occurring over weeks or months.</li>
            <li><strong>Interactive Time-Lapse Player:</strong> Use the prominent <span className="text-[#36DDF5] font-semibold">Play / Pause</span> control, previous and next epoch buttons, and timeline slider to advance smoothly through historical exposures.</li>
            <li><strong>Adjustable Playback Speed:</strong> Tailor playback rates (<span className="text-[#36DDF5] font-mono">0.5× to 3.0×</span>) to comfortably observe rapid blinks or slow transitions without resetting your sequence.</li>
            <li><strong>Image Blinking:</strong> Toggle alternating image blinking between two epochs to immediately highlight objects that moved (high-velocity stars) or changed brightness (variables and flares).</li>
            <li><strong>Multiple Comparison Modes:</strong> Inspect scenes using Single Frame, Side-by-Side Comparison, Interactive Split Slider, Flux-Matched Image Subtraction, or Stacked Co-addition.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q6',
      category: 'dashboard',
      categoryLabel: 'Dashboard Features',
      number: '06',
      q: 'What is the Spectral Lab?',
      summary: '102-band infrared spectroscopy, wavelength graphs, and interstellar ice indicators.',
      a: (
        <div className="space-y-3">
          <p>
            The <strong className="text-[#F5F8FF] font-semibold">Spectral Lab</strong> unpacks the superpower of SPHEREx: infrared spectrophotometry across 102 continuous channels spanning <span className="text-[#36DDF5] font-mono">0.75 µm to 5.0 µm</span>.
          </p>
          <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-[#C4D0E0]">
            <li><strong>Infrared Spectroscopy:</strong> Disperses incoming light into discrete wavelengths using Linear Variable Filters (LVF) mounted on SPHEREx’s six detector arrays.</li>
            <li><strong>Reading Spectral Graphs:</strong> Plots calibrated flux density (<span className="text-[#36DDF5] font-mono">µJy</span> or <span className="text-[#36DDF5] font-mono">MJy/sr</span>) against wavelength (<span className="text-[#36DDF5] font-mono">µm</span>). Downward dips indicate light absorption by cool gas or dust; upward peaks indicate hot emission.</li>
            <li><strong>Molecular & Chemical Ice Indicators:</strong> Features diagnostic marker overlays for key prebiotic molecules:
              <ul className="mt-1.5 ml-4 list-circle space-y-1 text-slate-300">
                <li><span className="text-cyan-300 font-semibold">Water-Ice (H₂O):</span> Broad 3.05 µm absorption band.</li>
                <li><span className="text-violet-300 font-semibold">Carbon Dioxide (CO₂):</span> Distinct 4.27 µm absorption feature.</li>
                <li><span className="text-amber-300 font-semibold">Carbon Monoxide (CO):</span> 4.67 µm band in cold interstellar clouds.</li>
                <li><span className="text-emerald-300 font-semibold">Methane (CH₄):</span> 1.67 µm and 3.3 µm absorption in cool brown dwarf atmospheres.</li>
              </ul>
            </li>
            <li><strong>Astrophysical Value:</strong> Allows astronomers to estimate stellar temperatures, classify sub-stellar objects, and study how icy grains coalesce in planetary systems.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q7',
      category: 'dashboard',
      categoryLabel: 'Dashboard Features',
      number: '07',
      q: 'What is the Image Analysis Lab?',
      summary: 'FITS image rendering, scientific stretch algorithms, subtraction, and synthetic aperture photometry.',
      a: (
        <div className="space-y-3">
          <p>
            The <strong className="text-[#F5F8FF] font-semibold">Image Analysis Lab</strong> gives users professional-grade astronomical image processing capabilities directly in the web browser.
          </p>
          <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-[#C4D0E0]">
            <li><strong>Direct FITS Processing:</strong> Directly parses authentic Flexible Image Transport System (FITS) multi-extension data arrays with calibrated coordinate systems (WCS).</li>
            <li><strong>Scientific Contrast Stretches:</strong> Enhance faint nebulae and bright stars using Linear, Logarithmic, Asinh, Square Root, and ZScale histogram stretching.</li>
            <li><strong>False-Color Astronomical Palettes:</strong> Choose from scientifically calibrated colormaps including Inferno, Magma, Viridis, Cividis, and Inverted Greyscale.</li>
            <li><strong>Flux-Matched Subtraction (I₂ − αI₁):</strong> Automatically rescales and subtracts a reference image from a science exposure to cancel out stationary stars and leave only moving or changing sources.</li>
            <li><strong>Co-Addition & Stacking:</strong> Stacks multiple aligned exposures (mean or median) to reduce background noise and boost Signal-to-Noise Ratio (SNR) by up to <span className="text-[#36DDF5] font-mono">√N</span>.</li>
            <li><strong>Aperture Photometry:</strong> Place circular apertures on stars with background sky annuli to calculate net instrumental flux and calibrated AB magnitudes.</li>
            <li><strong>Export Tools:</strong> Download publication-ready high-resolution PNGs, FITS cutouts, or structured JSON data matrices.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q8',
      category: 'dashboard',
      categoryLabel: 'Dashboard Features',
      number: '08',
      q: 'What is the Discovery Engine?',
      summary: 'Automated multi-epoch astronomical change detection, candidate screening, and triage.',
      a: (
        <div className="space-y-3">
          <p>
            The <strong className="text-[#F5F8FF] font-semibold">Discovery Engine</strong> is COSMOSCOPE’s automated pipeline for identifying anomalies across multi-epoch SPHEREx observations.
          </p>
          <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-[#C4D0E0]">
            <li><strong>Automated Detection:</strong> Uses Astropy WCS reprojection, background sigma clipping, and peak extraction algorithms to scan image pairs for differences.</li>
            <li><strong>Classification Categories:</strong> Flags candidates into categories including:
              <ul className="mt-1 ml-4 list-circle space-y-1 text-slate-300">
                <li><span className="text-cyan-300 font-semibold">Candidate Moving Objects:</span> Nearby stars with high proper motion or potential solar system objects.</li>
                <li><span className="text-amber-300 font-semibold">Variable Sources:</span> Stars exhibiting significant brightening or dimming (e.g. Young Stellar Objects, pulsating giants).</li>
                <li><span className="text-rose-300 font-semibold">Artifacts & Detector Glitches:</span> Cosmic ray hits, single-pixel hot pixels, or diffraction spikes filtered out by multi-epoch consistency checks.</li>
              </ul>
            </li>
            <li><strong>Candidate Investigation Modal:</strong> Click any detection in the triage queue to open a detailed dossier containing multi-epoch postage stamp cutouts, pixel coordinates, and light curve amplitudes.</li>
            <li><strong>Important Scientific Caution:</strong> All flagged sources are strictly classified as <span className="text-amber-400 font-semibold">Exploratory Candidates</span>. They represent candidate statistical anomalies and should never be presumed to be confirmed discoveries until verified by independent catalogue cross-referencing and follow-up observations.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q9',
      category: 'dashboard',
      categoryLabel: 'Dashboard Features',
      number: '09',
      q: 'What is the Multi-Mission Explorer?',
      summary: 'Cross-correlating SPHEREx infrared data with ESA Gaia DR3, NASA AllWISE, and 2MASS catalogues.',
      a: (
        <div className="space-y-3">
          <p>
            The <strong className="text-[#F5F8FF] font-semibold">Multi-Mission Explorer</strong> enables cross-catalogue astronomical correlation by pairing SPHEREx observations with complementary global space missions.
          </p>
          <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-[#C4D0E0]">
            <li><strong>Catalogue Cross-Matching:</strong> Queries astronomical databases using positional cone searches within a calibrated search radius (typically <span className="text-[#36DDF5] font-mono">1.5″ to 5.0″</span>).</li>
            <li><strong>ESA Gaia DR3 Integration:</strong> Retrieves high-precision optical astrometry, including proper motion vectors (<span className="text-[#36DDF5] font-mono">µ_α, µ_δ</span>), geometric parallaxes (distances), and photometric magnitudes (<span className="text-sky-300 font-mono">G, BP, RP</span>).</li>
            <li><strong>NASA AllWISE Integration:</strong> Retrieves mid-infrared fluxes across <span className="text-[#36DDF5] font-mono">W1 (3.4 µm), W2 (4.6 µm), W3 (12 µm), and W4 (22 µm)</span> to confirm whether sources show circumstellar dust or planetary atmospheres.</li>
            <li><strong>Why Multi-Mission Data Matters:</strong> Combining optical, near-infrared, and mid-infrared data helps astronomers confirm whether an observed change is a genuine physical phenomenon rather than an instrument artifact or cosmic ray hit.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q10',
      category: 'dashboard',
      categoryLabel: 'Dashboard Features',
      number: '10',
      q: 'What is the Research Library?',
      summary: 'Curated scientific literature, SPHEREx mission documentation, and interactive glossaries.',
      a: (
        <div className="space-y-3">
          <p>
            The <strong className="text-[#F5F8FF] font-semibold">Research Library</strong> is an educational and academic repository integrated directly into COSMOSCOPE.
          </p>
          <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-[#C4D0E0]">
            <li><strong>Scientific References:</strong> Access peer-reviewed literature, NASA SPHEREx mission white papers, and technical instrument documentation.</li>
            <li><strong>Interactive Terminology Glossary:</strong> Quick explanations for essential astrophysical concepts such as Linear Variable Filters (LVF), World Coordinate Systems (WCS), Point Spread Functions (PSF), and AB Magnitude standards.</li>
            <li><strong>Data Archive Documentation:</strong> Direct links and guides for interacting with the NASA/IPAC Infrared Science Archive (IRSA) TAP services and table access protocols.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q11',
      category: 'dashboard',
      categoryLabel: 'Dashboard Features',
      number: '11',
      q: 'What is the Scientific Evidence Dossier?',
      summary: 'Comprehensive target dossiers, SHA-256 Evidence Passports, and the 6-tier provenance system.',
      a: (
        <div className="space-y-3">
          <p>
            The <strong className="text-[#F5F8FF] font-semibold">Scientific Evidence Dossier</strong> synthesizes every observation, coordinate calculation, and spectral measurement for a target into an auditable scientific report.
          </p>
          <div className="p-3.5 rounded-xl bg-[#0B1730]/90 border border-cyan-500/30 space-y-2">
            <span className="text-xs font-bold text-[#36DDF5] uppercase tracking-wider block">The 6-Tier Scientific Provenance System:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#071225] border border-cyan-500/20">
                <span className="text-[#36DDF5] font-bold">1. MEASURED:</span> Raw, calibrated pixel matrices and aperture fluxes from authentic telescope FITS cutouts.
              </div>
              <div className="p-2 rounded-lg bg-[#071225] border border-sky-500/20">
                <span className="text-sky-400 font-bold">2. CATALOGUED:</span> Verified parameters retrieved from external catalogues (Gaia DR3, AllWISE, SIMBAD).
              </div>
              <div className="p-2 rounded-lg bg-[#071225] border border-emerald-500/20">
                <span className="text-emerald-400 font-bold">3. CALCULATED:</span> Derived mathematically from measured data (e.g. centroid displacement, net flux).
              </div>
              <div className="p-2 rounded-lg bg-[#071225] border border-violet-500/20">
                <span className="text-violet-400 font-bold">4. INTERPOLATED:</span> Numerically estimated values between measured bands across spectral dispersion gaps.
              </div>
              <div className="p-2 rounded-lg bg-[#071225] border border-amber-500/20">
                <span className="text-amber-400 font-bold">5. SIMULATED:</span> Theoretical astrophysical models (such as 24-epoch Mira pulsation baselines or orbital tracks).
              </div>
              <div className="p-2 rounded-lg bg-[#071225] border border-rose-500/20">
                <span className="text-rose-400 font-bold">6. UNAVAILABLE:</span> Explicitly designated when authentic data does not exist, preventing misleading guesses.
              </div>
            </div>
          </div>
          <p className="text-xs text-[#C4D0E0]">
            Users can export a cryptographically sealed <strong className="text-[#F5F8FF]">Evidence Passport PDF</strong> with a tamper-proof SHA-256 hash seal, certifying all data sources and processing steps for peer review.
          </p>
        </div>
      )
    },
    {
      id: 'q12',
      category: 'dashboard',
      categoryLabel: 'Dashboard Features',
      number: '12',
      q: 'What is Scientific Analytics?',
      summary: 'Statistical metrics, multi-parameter radar charts, and astrophysical variability diagnostics.',
      a: (
        <div className="space-y-3">
          <p>
            <strong className="text-[#F5F8FF] font-semibold">Scientific Analytics</strong> provides high-level quantitative insights and diagnostic summaries for any selected target or field.
          </p>
          <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-[#C4D0E0]">
            <li><strong>Multi-Parameter Anomaly Radar:</strong> Evaluates targets across four critical observational pillars:
              <ul className="mt-1 ml-4 list-circle space-y-1 text-slate-300">
                <li><span className="text-[#36DDF5] font-semibold">Proper Motion:</span> Measures astrometric displacement velocity against background stars.</li>
                <li><span className="text-violet-300 font-semibold">Flux Variability:</span> Computes multi-epoch magnitude variance and light curve amplitude.</li>
                <li><span className="text-emerald-300 font-semibold">Ice Absorption Depth:</span> Quantifies optical depth (τ) at the 3.05 µm water-ice band.</li>
                <li><span className="text-amber-300 font-semibold">Spectral Novelty:</span> Measures spectral deviation from standard stellar templates.</li>
              </ul>
            </li>
            <li><strong>How to Interpret Results:</strong> High proper motion scores indicate nearby stars in our galactic neighborhood; high variability signals stellar pulsation or accretion outbursts; high ice absorption highlights candidate protoplanetary disks or frozen sub-stellar atmospheres.</li>
          </ul>
        </div>
      )
    },

    // =========================================================================
    // CATEGORY 3 — SCIENCE AND DATA
    // =========================================================================
    {
      id: 'q13',
      category: 'science',
      categoryLabel: 'Science & Data',
      number: '13',
      q: 'What is infrared astronomy, and why is it important?',
      summary: 'Peering through cosmic dust clouds to observe cold stars, planets, and the early universe.',
      a: (
        <div className="space-y-3">
          <p>
            Infrared astronomy observes light with wavelengths longer than visible red light (<span className="text-[#36DDF5] font-mono">0.75 µm to 1,000 µm</span>), invisible to the human eye. It is crucial for three major reasons:
          </p>
          <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-[#C4D0E0]">
            <li><strong>Penetrating Cosmic Dust:</strong> Interstellar dust grains scatter optical light, blinding visible telescopes to star-forming regions. Longer infrared waves pass straight through dust, unveiling hidden protostars and galactic centers.</li>
            <li><strong>Observing Cold Objects:</strong> Cool celestial bodies—such as brown dwarfs, planets, interstellar ices, and comets—do not emit visible light. They radiate their thermal energy primarily in the infrared.</li>
            <li><strong>Looking Back into Deep Time:</strong> As light from the earliest infant galaxies travels across billions of light-years of expanding spacetime, its wavelength is stretched into the infrared (cosmological redshift).</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q14',
      category: 'science',
      categoryLabel: 'Science & Data',
      number: '14',
      q: 'What are FITS files?',
      summary: 'Flexible Image Transport System, the international standard file format for professional astronomy.',
      a: (
        <div className="space-y-3">
          <p>
            <strong className="text-[#F5F8FF] font-semibold">FITS (Flexible Image Transport System)</strong> is the standardized digital data format approved by the International Astronomical Union (IAU) and NASA for storing and exchanging astronomical images, tables, and spectra.
          </p>
          <p>
            Unlike regular consumer image formats (like JPEG or PNG) that compress and discard raw pixel values, a FITS file stores:
          </p>
          <ul className="text-xs sm:text-sm space-y-1.5 list-disc list-inside text-[#C4D0E0]">
            <li><strong>Raw Calibrated Pixel Matrices:</strong> 32-bit or 64-bit floating-point numbers representing actual physical flux (e.g. MegaJanskys per steradian).</li>
            <li><strong>Human-Readable Metadata Headers:</strong> Key-value metadata containing observation date/time, instrument configuration, exposure duration, detector temperature, and World Coordinate System (WCS) parameters.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q15',
      category: 'science',
      categoryLabel: 'Science & Data',
      number: '15',
      q: 'What are Right Ascension and Declination?',
      summary: 'The celestial coordinate system used by astronomers to locate objects on the sky.',
      a: (
        <div className="space-y-3">
          <p>
            Right Ascension and Declination form the equatorial coordinate system, which projects Earth's longitude and latitude outward onto the celestial sphere:
          </p>
          <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-[#C4D0E0]">
            <li><strong>Right Ascension (RA, α):</strong> The celestial equivalent of longitude. It measures angular distance eastward along the celestial equator from the vernal equinox, expressed either in degrees (<span className="text-[#36DDF5] font-mono">0° to 360°</span>) or in hours, minutes, and seconds (<span className="text-[#36DDF5] font-mono">0h to 24h</span>).</li>
            <li><strong>Declination (Dec, δ):</strong> The celestial equivalent of latitude. It measures angular distance north (<span className="text-[#36DDF5] font-mono">+0° to +90°</span>) or south (<span className="text-[#36DDF5] font-mono">-0° to -90°</span>) relative to the celestial equator.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q16',
      category: 'science',
      categoryLabel: 'Science & Data',
      number: '16',
      q: 'What is stellar proper motion?',
      summary: 'The apparent angular motion of a star across the celestial sphere over time.',
      a: (
        <div className="space-y-3">
          <p>
            <strong className="text-[#F5F8FF] font-semibold">Proper motion</strong> is the slow angular shift in a star's position on the sky over time, caused by the star's actual physical velocity through the Milky Way relative to our Solar System.
          </p>
          <p>
            Proper motion is typically measured in <strong>milliarcseconds per year (mas/yr)</strong>. Because most stars are trillions of kilometers away, their proper motions are usually microscopic. However, nearby stars exhibit rapid motion. For example, <em>Barnard’s Star</em>—featured in COSMOSCOPE—moves at an astonishing <span className="text-[#36DDF5] font-mono">10,359 mas/yr (10.36″/year)</span>, moving the width of the Moon in just 180 years!
          </p>
        </div>
      )
    },
    {
      id: 'q17',
      category: 'science',
      categoryLabel: 'Science & Data',
      number: '17',
      q: 'What are observation epochs?',
      summary: 'The exact timestamp of an astronomical exposure used to detect temporal variability.',
      a: (
        <div className="space-y-3">
          <p>
            An <strong>observation epoch</strong> is the specific date and timestamp (often expressed in UTC and Modified Julian Date / MJD) when an astronomical survey exposure was captured by the telescope.
          </p>
          <p>
            SPHEREx observes the entire sky in six-month cycles. By comparing cutouts of the same celestial coordinates across different observation epochs, COSMOSCOPE allows users to detect moving kinematic objects, measure changing light curves, and spot transient events.
          </p>
        </div>
      )
    },
    {
      id: 'q18',
      category: 'science',
      categoryLabel: 'Science & Data',
      number: '18',
      q: 'Where does COSMOSCOPE obtain its astronomical data?',
      summary: 'Directly from NASA/IPAC IRSA, ESA Gaia, NASA AllWISE, 2MASS, and CDS SIMBAD.',
      a: (
        <div className="space-y-3">
          <p>
            COSMOSCOPE connects to public international astronomical data repositories:
          </p>
          <ul className="text-xs sm:text-sm space-y-1.5 list-disc list-inside text-[#C4D0E0]">
            <li><strong>NASA/IPAC Infrared Science Archive (IRSA):</strong> The official host for NASA’s SPHEREx data releases, providing calibrated Level-2 Multi-Extension FITS (MEF) cutouts via TAP and IBE APIs.</li>
            <li><strong>ESA Gaia DR3:</strong> European Space Agency’s astrometric catalogue providing proper motion vectors, parallax distances, and radial velocities.</li>
            <li><strong>NASA AllWISE & 2MASS:</strong> Caltech/IPAC infrared sky surveys providing multi-wavelength mid-infrared and near-infrared reference photometry.</li>
            <li><strong>CDS SIMBAD:</strong> Strasbourg Astronomical Data Center providing target cross-identifications and academic bibliography.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q19',
      category: 'science',
      categoryLabel: 'Science & Data',
      number: '19',
      q: 'Is the data directly obtained from NASA?',
      summary: 'Yes. All SPHEREx data products are retrieved from NASA/IPAC IRSA public archives.',
      a: (
        <div className="space-y-3">
          <p>
            <strong className="text-[#F5F8FF] font-semibold">Yes.</strong> All SPHEREx image cutouts and metadata headers utilized across COSMOSCOPE are retrieved directly from the public NASA/IPAC Infrared Science Archive (IRSA) Quick Release and Data Release collections.
          </p>
          <p>
            Every FITS cutout preserves its authentic NASA FITS headers, observation timestamps (UTC/MJD), telescope pointing coordinates, and detector calibrations.
          </p>
        </div>
      )
    },
    {
      id: 'q20',
      category: 'science',
      categoryLabel: 'Science & Data',
      number: '20',
      q: 'Are all detected changes confirmed discoveries?',
      summary: 'No. Automated detections are exploratory candidates that require verification.',
      a: (
        <div className="space-y-3">
          <p>
            <strong className="text-amber-400 font-semibold">No.</strong> In observational astronomy, any candidate flagged by automated change detection software must be treated with scientific caution.
          </p>
          <p>
            Detected flux shifts or apparent motions can be caused by genuine physical phenomena (such as high proper motion stars, asteroids, or eruptive variable stars), but they can also stem from detector artifacts, cosmic rays, optical diffraction spikes, or background noise. COSMOSCOPE labels all such findings as <strong>Exploratory Candidates</strong>.
          </p>
        </div>
      )
    },
    {
      id: 'q21',
      category: 'science',
      categoryLabel: 'Science & Data',
      number: '21',
      q: 'How reliable are the displayed measurements?',
      summary: 'Measurements adhere to rigorous astronomical calibration pipelines with published uncertainties.',
      a: (
        <div className="space-y-3">
          <p>
            All direct measurements in COSMOSCOPE are computed using standardized Python scientific libraries (<code className="px-1.5 py-0.5 rounded bg-[#0B1730] border border-cyan-500/30 text-[#36DDF5] font-mono text-xs">Astropy</code>, <code className="px-1.5 py-0.5 rounded bg-[#0B1730] border border-cyan-500/30 text-[#36DDF5] font-mono text-xs">Photutils</code>, and <code className="px-1.5 py-0.5 rounded bg-[#0B1730] border border-cyan-500/30 text-[#36DDF5] font-mono text-xs">NumPy</code>) following official NASA calibration algorithms.
          </p>
          <p>
            Measured fluxes and positions include statistical error estimates (±1σ). Where data is interpolated or simulated, it is visibly marked to maintain strict scientific integrity.
          </p>
        </div>
      )
    },
    {
      id: 'q22',
      category: 'science',
      categoryLabel: 'Science & Data',
      number: '22',
      q: 'What is the difference between measured and modelled data in COSMOSCOPE?',
      summary: 'Clear distinction between authentic telescope exposures and theoretical baseline models.',
      a: (
        <div className="space-y-3">
          <p>
            COSMOSCOPE maintains strict data transparency to prevent scientific misinterpretation:
          </p>
          <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-[#C4D0E0]">
            <li><strong className="text-[#36DDF5]">Measured Data:</strong> Represents real calibrated pixel values and aperture flux integrations obtained directly from authentic telescope FITS cutouts.</li>
            <li><strong className="text-amber-400">Modelled Data:</strong> Represents parameterized theoretical curves (such as a 24-epoch Mira pulsation model or simulated Keplerian orbit) used as visual comparison baselines. Modelled data is always visibly badged to prevent confusion with single-epoch exposures.</li>
          </ul>
        </div>
      )
    },

    // =========================================================================
    // CATEGORY 4 — GENERAL FAQs
    // =========================================================================
    {
      id: 'q23',
      category: 'general',
      categoryLabel: 'General FAQs',
      number: '23',
      q: 'Which astronomical targets are featured in COSMOSCOPE?',
      summary: 'Five verified NASA challenge case studies plus the ability to query any sky coordinate.',
      a: (
        <div className="space-y-3">
          <p>
            COSMOSCOPE pre-loads five scientifically verified benchmark targets representing distinct infrared astrophysical phenomena:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-[#0B1730]/80 border border-cyan-500/20">
              <span className="font-bold text-[#F5F8FF] block">1. Barnard’s Star (Red Dwarf)</span>
              High-velocity star displaying the fastest known proper motion across our galaxy (10.36″/yr).
            </div>
            <div className="p-2.5 rounded-xl bg-[#0B1730]/80 border border-cyan-500/20">
              <span className="font-bold text-[#F5F8FF] block">2. Epsilon Indi B (Brown Dwarf Binary)</span>
              Sub-stellar cooling laboratory (T ~ 900 K) exhibiting deep atmospheric methane (CH₄) absorption.
            </div>
            <div className="p-2.5 rounded-xl bg-[#0B1730]/80 border border-cyan-500/20">
              <span className="font-bold text-[#F5F8FF] block">3. WISE 0855-0714 (Ultra-Cool Y-Dwarf)</span>
              Coldest known sub-stellar object (T ~ 250 K) with candidate water-ice (H₂O) cloud absorption at 3.05 µm.
            </div>
            <div className="p-2.5 rounded-xl bg-[#0B1730]/80 border border-cyan-500/20">
              <span className="font-bold text-[#F5F8FF] block">4. RW Aurigae (Young Stellar Object)</span>
              Eruptive T Tauri binary exhibiting dramatic multi-magnitude occultations from protoplanetary dust.
            </div>
            <div className="p-2.5 rounded-xl bg-[#0B1730]/80 border border-cyan-500/20 sm:col-span-2">
              <span className="font-bold text-[#F5F8FF] block">5. R Draconis (Pulsating Mira Variable Giant)</span>
              Evolved red giant undergoing radial pulsations with a 245.6-day period and severe flux variations.
            </div>
          </div>
          <p className="text-xs text-[#C4D0E0] pt-1">
            Beyond these five targets, you can also query any celestial coordinate across the entire sky using the live Sky Explorer!
          </p>
        </div>
      )
    },
    {
      id: 'q24',
      category: 'general',
      categoryLabel: 'General FAQs',
      number: '24',
      q: 'Is COSMOSCOPE free and open-source?',
      summary: 'Yes, COSMOSCOPE is an open-science platform developed for the NASA Space Apps Challenge.',
      a: (
        <div className="space-y-3">
          <p>
            <strong className="text-[#F5F8FF] font-semibold">Yes!</strong> COSMOSCOPE is built on open-science principles for the NASA Space Apps Challenge.
          </p>
          <p>
            It is constructed using modern open-source technologies including React, Tailwind CSS, FastAPI, Astropy, Plotly, and Vite. All underlying astronomical APIs and datasets from NASA, ESA, and CDS are publicly accessible.
          </p>
        </div>
      )
    },
    {
      id: 'q25',
      category: 'general',
      categoryLabel: 'General FAQs',
      number: '25',
      q: 'Who can use COSMOSCOPE? Do I need an astronomy degree?',
      summary: 'Anyone can use COSMOSCOPE! Designed for students, citizen scientists, and professional researchers.',
      a: (
        <div className="space-y-3">
          <p>
            <strong className="text-[#F5F8FF] font-semibold">Anyone can use COSMOSCOPE!</strong> You do not need a degree in astrophysics or prior programming experience.
          </p>
          <p>
            The interface is crafted with intuitive visual controls, interactive sliders, tooltips, and explanatory guides so that high school students and amateur stargazers can explore infrared space science alongside university researchers.
          </p>
        </div>
      )
    },
    {
      id: 'q26',
      category: 'general',
      categoryLabel: 'General FAQs',
      number: '26',
      q: 'How does SPHEREx compare to the James Webb Space Telescope (JWST)?',
      summary: 'SPHEREx is an all-sky census telescope; JWST is a narrow-field deep-observing flagship.',
      a: (
        <div className="space-y-3">
          <p>
            SPHEREx and JWST are complementary NASA missions with fundamentally different survey architectures:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-[#0B1730]/90 border border-cyan-500/20">
              <span className="font-bold text-[#36DDF5] block mb-1">SPHEREx (All-Sky Census)</span>
              Maps the <em>entire 100% of the sky</em> every 6 months across 102 continuous infrared bands. Acts as a wide-angle census machine discovering millions of interesting sources.
            </div>
            <div className="p-3 rounded-xl bg-[#0B1730]/90 border border-violet-500/20">
              <span className="font-bold text-violet-400 block mb-1">JWST (Targeted Flagship)</span>
              Features a giant 6.5-meter mirror designed for ultra-deep, narrow-field pinpoint observations of specific faint galaxies and exoplanet atmospheres.
            </div>
          </div>
          <p className="text-xs text-[#C4D0E0]">
            In short: SPHEREx surveys the entire cosmos to find anomalous targets, which JWST can then observe in extreme detail!
          </p>
        </div>
      )
    },
    {
      id: 'q27',
      category: 'general',
      categoryLabel: 'General FAQs',
      number: '27',
      q: 'How do I report or investigate a potential candidate anomaly?',
      summary: 'Inspect candidates in the Discovery Engine, annotate notes, and export an Evidence Passport.',
      a: (
        <div className="space-y-3">
          <p>
            When you spot an unusual source or variable object in the Cosmic Time Machine or Discovery Engine:
          </p>
          <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-[#C4D0E0]">
            <li>Click <span className="text-[#36DDF5] font-semibold">"Inspect Candidate"</span> to open the Source Investigation Modal with multi-epoch thumbnail cutouts and astrometric displacement curves.</li>
            <li>Add observational notes and triage priority in the Candidate Review Queue.</li>
            <li>Navigate to the <span className="text-[#36DDF5] font-semibold">Evidence Dossier</span> and click <span className="text-[#36DDF5] font-semibold">"Generate Evidence Passport"</span> to download a cryptographically signed SHA-256 PDF report documenting your investigation.</li>
          </ul>
        </div>
      )
    }
  ];

  // Filtering Logic based on Category and Search Query
  const filteredFaqs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const qText = faq.q.toLowerCase();
      const sText = faq.summary.toLowerCase();
      const term = searchQuery.toLowerCase().trim();

      return qText.includes(term) || sText.includes(term);
    });
  }, [activeCategory, searchQuery]);

  const toggleFaq = (id) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  const handleExpandAll = () => {
    // If all are open or single open, we can expand all or collapse all
    // To keep it simple and clean, toggle first or set to 'all_open'
    // Let's implement an array or set if needed, or simply toggle the active one
  };

  return (
    <section id="faq" className="py-24 bg-[#071225]/40 backdrop-blur-sm border-t border-cyan-500/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1730]/85 border border-cyan-500/40 text-[#36DDF5] text-xs font-semibold tracking-widest uppercase shadow-sm">
            <HelpCircle className="w-3.5 h-3.5 text-[#36DDF5]" />
            Questions & Answers
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F8FF] tracking-tight">
            Frequently Asked <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#C4D0E0] font-light leading-relaxed">
            Everything you need to know about COSMOSCOPE, the NASA SPHEREx mission, our scientific tools, and infrared astronomy.
          </p>
        </div>

        {/* Category Filter Tabs & Search Bar */}
        <div className="space-y-4 mb-8">
          
          {/* Top Row: Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const count = cat.id === 'all' 
                ? faqData.length 
                : faqData.filter(f => f.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.35)] scale-105'
                      : 'bg-[#071225]/80 hover:bg-[#0B1730] text-[#C4D0E0] hover:text-[#F5F8FF] border border-cyan-500/25 hover:border-cyan-400/50'
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-[#36DDF5]'}`} />
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-cyan-500/15 text-[#36DDF5]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Row: Search Box & Active Filter Indicator */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A3BA]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g., FITS, ices, Gaia, dossier)..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#071225]/80 border border-cyan-500/25 text-[#F5F8FF] text-xs placeholder:text-[#91A3BA] focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#91A3BA] hover:text-[#F5F8FF]"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs font-mono text-[#91A3BA] flex items-center gap-2">
              <span>Showing {filteredFaqs.length} of {faqData.length} questions</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#36DDF5] hover:underline"
                >
                  (reset)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Accordion Questions List */}
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#071225]/85 border border-cyan-500/25 space-y-4">
            <HelpCircle className="w-10 h-10 mx-auto text-[#91A3BA] opacity-50" />
            <h3 className="text-lg font-bold text-[#F5F8FF]">No matching questions found</h3>
            <p className="text-xs text-[#C4D0E0]">
              Try searching for different keywords or select "All Questions".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-[#36DDF5] border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  id={`faq-${faq.id}`}
                  className={`rounded-2xl transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'bg-[#071225]/95 border border-cyan-400/70 shadow-[0_0_30px_rgba(0,240,255,0.18)] ring-1 ring-cyan-400/30'
                      : 'bg-[#071225]/80 hover:bg-[#071225]/95 border border-cyan-500/25 hover:border-cyan-400/50 shadow-sm'
                  }`}
                >
                  {/* Accordion Trigger Button */}
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 group transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1">
                      
                      {/* Question Number Badge */}
                      <span className={`flex-shrink-0 w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all ${
                        isOpen
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                          : 'bg-[#0B1730] border border-cyan-500/30 text-[#36DDF5] group-hover:border-cyan-400/60'
                      }`}>
                        {faq.number}
                      </span>

                      {/* Question Text & Category Pill */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-base sm:text-lg font-bold tracking-tight transition-colors ${
                            isOpen ? 'text-[#F5F8FF]' : 'text-[#F5F8FF] group-hover:text-[#36DDF5]'
                          }`}>
                            {faq.q}
                          </span>
                        </div>
                        <p className="text-xs text-[#91A3BA] font-light line-clamp-1">
                          {faq.summary}
                        </p>
                      </div>
                    </div>

                    {/* Expand/Collapse Chevron Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 border ${
                      isOpen
                        ? 'rotate-180 bg-cyan-500/20 border-cyan-400 text-[#36DDF5] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'bg-[#0B1730] border-cyan-500/30 text-[#91A3BA] group-hover:text-[#36DDF5] group-hover:border-cyan-400/50'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Accordion Answer Content */}
                  {isOpen && (
                    <div
                      id={`faq-answer-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-${faq.id}`}
                      className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm text-[#C4D0E0] leading-relaxed font-light border-t border-cyan-500/20 pt-4 animate-fadeIn"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Helper Card */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-[#071225]/80 to-violet-500/10 border border-cyan-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#F5F8FF]">Still have questions about SPHEREx data?</h4>
            <p className="text-xs text-[#C4D0E0] font-light">
              Explore the interactive Dashboard, consult the Research Library, or visit the official NASA/IPAC IRSA archive documentation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://irsa.ipac.caltech.edu/Missions/spherex.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0B1730] hover:bg-cyan-500/20 text-[#36DDF5] border border-cyan-500/30 hover:border-cyan-400/50 transition-all"
            >
              <span>NASA IRSA</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/explorer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-105 transition-all"
            >
              <span>Launch Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
