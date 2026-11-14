/**
 * COSMOSCOPE Authoritative Frontend Celestial Catalog.
 * Synchronized with backend extended_targets.py.
 * Contains 20 scientifically verified astronomical objects across 5 primary categories.
 */

export const CELESTIAL_CATEGORIES = [
  { id: "all", label: "All Objects", count: 20 },
  { id: "challenge", label: "Challenge Targets", count: 5 },
  { id: "stars", label: "Stars", count: 3 },
  { id: "brown_dwarfs", label: "Brown Dwarfs", count: 4 },
  { id: "ysos", label: "Young Stellar Objects", count: 4 },
  { id: "variables", label: "Variables & Evolved", count: 4 },
  { id: "nebulae_extragalactic", label: "Nebulae & Extragalactic", count: 3 },
];

export const CELESTIAL_CATALOG = [
  // =========================================================================
  // 1. ORIGINAL 5 NASA CHALLENGE TARGETS (PRESERVED)
  // =========================================================================
  {
    id: "barnards-star",
    name: "Barnard's Star",
    designations: ["Barnard's Star", "GJ 699", "BD+04 3561a", "Gaia DR3 4472832130942585856"],
    category: "stars",
    type: "High Proper Motion M-Dwarf",
    ra: 269.45208,
    dec: 4.69333,
    ra_hms: "17:57:48.50",
    dec_dms: "+04:41:36.00",
    constell: "Ophiuchus",
    spectral_type: "M4.0V",
    distance_pc: 1.83,
    distance_ly: 5.96,
    proper_motion: "10,390 mas/yr (356° PA)",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: true,
    detectors: [1, 2, 3, 6],
    badge: "10.4″/yr Motion",
    color: "#00F0FF",
    obsCount: 364,
    description: "Second-closest stellar system to the Sun. Displays extreme proper motion of 10.39 arcsec/yr.",
    analysisFocus: "proper_motion"
  },
  {
    id: "epsilon-indi-b",
    name: "Epsilon Indi B",
    designations: ["Epsilon Indi B", "Eps Ind B", "2MASS J22041052-5646577", "HIP 108938"],
    category: "brown_dwarfs",
    type: "Substellar Binary Brown Dwarf",
    ra: 331.04375,
    dec: -56.78278,
    ra_hms: "22:04:10.50",
    dec_dms: "-56:46:58.00",
    constell: "Indus",
    spectral_type: "T1 + T6",
    distance_pc: 3.64,
    distance_ly: 11.87,
    proper_motion: "4,705 mas/yr",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: true,
    detectors: [2, 3, 5],
    badge: "Brown Dwarf Binary",
    color: "#A855F7",
    obsCount: 449,
    description: "Substellar companion binary (T1 + T6 dwarfs) at 3.6 pc with strong methane and water ice bands.",
    analysisFocus: "substellar_sed"
  },
  {
    id: "wise-0855",
    name: "WISE 0855",
    designations: ["WISE J085510.83-071442.5", "WISE 0855", "WISEA J085510.74-071443.8"],
    category: "brown_dwarfs",
    type: "Sub-Zero Brown Dwarf (Water Ice)",
    ra: 133.79513,
    dec: -7.24515,
    ra_hms: "08:55:10.83",
    dec_dms: "-07:14:42.53",
    constell: "Hydra",
    spectral_type: "Y2",
    distance_pc: 2.23,
    distance_ly: 7.27,
    proper_motion: "8,130 mas/yr",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: true,
    detectors: [2, 3, 5, 6],
    badge: "Water Ice Clouds",
    color: "#38BDF8",
    obsCount: 256,
    description: "Fourth closest system to the Sun (~2.2 pc). Temperature around -13°C (260 K) with atmospheric water ice clouds.",
    analysisFocus: "water_ice_clouds"
  },
  {
    id: "rw-aurigae",
    name: "RW Aurigae",
    designations: ["RW Aurigae", "RW Aur", "Gaia DR3 162985396655184256", "HIP 23873"],
    category: "ysos",
    type: "Eruptive T Tauri Variable",
    ra: 76.95642,
    dec: 30.40142,
    ra_hms: "05:07:49.54",
    dec_dms: "+30:24:05.10",
    constell: "Auriga",
    spectral_type: "K1-K4e",
    distance_pc: 163.0,
    distance_ly: 532.0,
    proper_motion: "22.4 mas/yr",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: true,
    detectors: [1, 3, 4],
    badge: "Variable YSO",
    color: "#F59E0B",
    obsCount: 333,
    description: "Active Young Stellar Object (YSO) showing catastrophic multi-magnitude dimming from circumstellar disk dust.",
    analysisFocus: "photometric_variability"
  },
  {
    id: "r-draconis",
    name: "R Draconis",
    designations: ["R Draconis", "R Dra", "AAVSO 1632+66", "HD 149214", "HIP 79641"],
    category: "variables",
    type: "Mira Pulsating Giant Variable",
    ra: 248.16750,
    dec: 66.75500,
    ra_hms: "16:32:40.20",
    dec_dms: "+66:45:18.00",
    constell: "Draco",
    spectral_type: "M5e-M9e",
    distance_pc: 650.0,
    distance_ly: 2120.0,
    proper_motion: "16.8 mas/yr",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: true,
    detectors: [3, 4, 6],
    badge: "Mira Giant",
    color: "#EC4899",
    obsCount: 2483,
    description: "Classical long-period pulsating red giant with ~245-day cycle in northern continuous viewing zone.",
    analysisFocus: "long_period_pulsation"
  },

  // =========================================================================
  // 2. CATEGORY A: STARS (HIGH PROPER MOTION & NEARBY M-DWARFS)
  // =========================================================================
  {
    id: "proxima-centauri",
    name: "Proxima Centauri",
    designations: ["Alpha Centauri C", "GJ 551", "HIP 70890", "Gaia DR3 5853498713190525696"],
    category: "stars",
    type: "Nearest Star (Flare M-Dwarf)",
    ra: 217.42894,
    dec: -62.67949,
    ra_hms: "14:29:42.95",
    dec_dms: "-62:40:46.16",
    constell: "Centaurus",
    spectral_type: "M5.5Ve",
    distance_pc: 1.30,
    distance_ly: 4.25,
    proper_motion: "3,853 mas/yr",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: false,
    detectors: [1, 2, 3],
    badge: "Nearest Star",
    color: "#10B981",
    obsCount: 512,
    description: "Closest star to the Solar System (1.30 pc). Extreme flare M-dwarf host to exoplanets with prominent near-IR flaring.",
    analysisFocus: "m_dwarf_flaring_and_chromosphere"
  },
  {
    id: "kapteyns-star",
    name: "Kapteyn's Star",
    designations: ["VZ Pictoris", "GJ 191", "HD 33793", "Gaia DR3 4758788390708977280"],
    category: "stars",
    type: "Galactic Halo M-Subdwarf",
    ra: 77.91900,
    dec: -45.01839,
    ra_hms: "05:11:40.56",
    dec_dms: "-45:01:06.20",
    constell: "Pictor",
    spectral_type: "M1.0VI",
    distance_pc: 3.93,
    distance_ly: 12.83,
    proper_motion: "8,670 mas/yr",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: false,
    detectors: [1, 2, 3, 4],
    badge: "Halo Runaway",
    color: "#06B6D4",
    obsCount: 288,
    description: "Second fastest proper motion in the sky (8.67 arcsec/yr). Subdwarf kinematic relic of a dwarf galaxy with retrograde orbit.",
    analysisFocus: "galactic_halo_kinematics"
  },
  {
    id: "wolf-359",
    name: "Wolf 359",
    designations: ["CN Leonis", "GJ 406", "HIP 53767", "Gaia DR3 3864455806497793408"],
    category: "stars",
    type: "Extreme Flare M-Dwarf",
    ra: 164.12027,
    dec: 7.01467,
    ra_hms: "10:56:28.86",
    dec_dms: "+07:00:52.81",
    constell: "Leo",
    spectral_type: "M6.0V",
    distance_pc: 2.41,
    distance_ly: 7.86,
    proper_motion: "4,700 mas/yr",
    status: "VERIFIED SPHEREx COVERAGE",
    isChallengeTarget: false,
    detectors: [1, 2, 3],
    badge: "Active Flare Star",
    color: "#14B8A6",
    obsCount: 195,
    description: "Fifth-closest individual star to the Sun. Low-mass red dwarf exhibiting frequent energetic magnetic reconnection flares.",
    analysisFocus: "stellar_magnetism_and_flares"
  },

  // =========================================================================
  // 3. CATEGORY B: BROWN DWARFS (L, T, Y TYPES)
  // =========================================================================
  {
    id: "luhman-16",
    name: "Luhman 16",
    designations: ["WISE J1049-5319", "WISE J104915.57-531906.1", "2MASS J10491891-5319100"],
    category: "brown_dwarfs",
    type: "L/T Transition Brown Dwarf Binary",
    ra: 162.32875,
    dec: -53.31944,
    ra_hms: "10:49:18.90",
    dec_dms: "-53:19:10.00",
    constell: "Vela",
    spectral_type: "L7.5 + T0.5",
    distance_pc: 2.00,
    distance_ly: 6.52,
    proper_motion: "2,790 mas/yr",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: false,
    detectors: [2, 3, 4, 5],
    badge: "L/T Binary",
    color: "#8B5CF6",
    obsCount: 420,
    description: "Third-closest stellar/substellar system to the Sun. Binary brown dwarf demonstrating rapid rotational surface cloud patchiness.",
    analysisFocus: "patchy_cloud_meteorology"
  },
  {
    id: "gliese-229-b",
    name: "Gliese 229 B",
    designations: ["Gl 229 B", "GJ 229 B", "2MASS J06103462-2151527", "HD 42581 B"],
    category: "brown_dwarfs",
    type: "Methane Prototype T-Dwarf",
    ra: 92.64167,
    dec: -21.83278,
    ra_hms: "06:10:34.00",
    dec_dms: "-21:49:58.00",
    constell: "Lepus",
    spectral_type: "T7p",
    distance_pc: 5.75,
    distance_ly: 18.75,
    proper_motion: "725 mas/yr",
    status: "VERIFIED SPHEREx COVERAGE",
    isChallengeTarget: false,
    detectors: [2, 3, 4],
    badge: "Methane Prototype",
    color: "#7C3AED",
    obsCount: 184,
    description: "Historical benchmark T-dwarf discovery (1995). First brown dwarf confirmed by direct methane (CH4) absorption in infrared.",
    analysisFocus: "methane_absorption_spectroscopy"
  },
  {
    id: "2mass-0559-1404",
    name: "2MASS J0559-1404",
    designations: ["2MASS J05591914-1404488", "AllWISE J055919.16-140448.9"],
    category: "brown_dwarfs",
    type: "Isolated Benchmark T-Dwarf",
    ra: 89.82979,
    dec: -14.08022,
    ra_hms: "05:59:19.15",
    dec_dms: "-14:04:48.80",
    constell: "Lepus",
    spectral_type: "T4.5",
    distance_pc: 10.20,
    distance_ly: 33.30,
    proper_motion: "1,940 mas/yr",
    status: "VERIFIED SPHEREx COVERAGE",
    isChallengeTarget: false,
    detectors: [2, 3, 4],
    badge: "Isolated T-Dwarf",
    color: "#6366F1",
    obsCount: 162,
    description: "Isolated field T-dwarf devoid of host star glare. Pristine laboratory for measuring atmospheric water vapor and methane opacity.",
    analysisFocus: "photometric_stability_and_h2o"
  },

  // =========================================================================
  // 4. CATEGORY C: YOUNG STELLAR OBJECTS (YSOS & PROTOPLANETARY DISKS)
  // =========================================================================
  {
    id: "hl-tauri",
    name: "HL Tauri",
    designations: ["HL Tau", "Gaia DR3 153094896238618496", "2MASS J04312981+1813572"],
    category: "ysos",
    type: "Protoplanetary Disk YSO (Class I/II)",
    ra: 67.87417,
    dec: 18.23250,
    ra_hms: "04:31:29.80",
    dec_dms: "+18:13:57.00",
    constell: "Taurus",
    spectral_type: "K5V / Class I-II",
    distance_pc: 147.0,
    distance_ly: 480.0,
    proper_motion: "25.1 mas/yr",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: false,
    detectors: [1, 2, 3, 4, 5],
    badge: "Protoplanetary Disk",
    color: "#D97706",
    obsCount: 388,
    description: "Archetype protoplanetary disk host. Displays concentric rings and planet-carved gaps within circumstellar dust and ice mantles.",
    analysisFocus: "circumstellar_ice_and_silicates"
  },
  {
    id: "tw-hydrae",
    name: "TW Hydrae",
    designations: ["TW Hya", "HIP 53911", "Gaia DR3 5389657493774846464", "2MASS J11015191-3442170"],
    category: "ysos",
    type: "Classical T Tauri Star",
    ra: 165.46625,
    dec: -34.70472,
    ra_hms: "11:01:51.90",
    dec_dms: "-34:42:17.00",
    constell: "Hydra",
    spectral_type: "K6Ve",
    distance_pc: 60.1,
    distance_ly: 196.0,
    proper_motion: "80.2 mas/yr",
    status: "VERIFIED SPHEREx COVERAGE",
    isChallengeTarget: false,
    detectors: [1, 2, 3, 4],
    badge: "Nearest T Tauri",
    color: "#B45309",
    obsCount: 245,
    description: "Nearest known classical T Tauri star (60 pc) facing nearly face-on; primary benchmark for gas-rich transitional disk dispersal.",
    analysisFocus: "transitional_disk_evolution"
  },
  {
    id: "fu-orionis",
    name: "FU Orionis",
    designations: ["FU Ori", "HD 246878", "Gaia DR3 3328224578135606656", "2MASS J05452479+0904151"],
    category: "ysos",
    type: "Eruptive Prototype YSO",
    ra: 86.35333,
    dec: 9.07083,
    ra_hms: "05:45:24.80",
    dec_dms: "+09:04:15.00",
    constell: "Orion",
    spectral_type: "F-G supergiant (outburst)",
    distance_pc: 416.0,
    distance_ly: 1357.0,
    proper_motion: "4.1 mas/yr",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: false,
    detectors: [1, 2, 3, 4],
    badge: "Eruptive Prototype",
    color: "#F59E0B",
    obsCount: 310,
    description: "Prototype of FUor episodic accretion outbursts. In 1937, brightened by ~6 magnitudes; inner disk feeds protostellar core at high rate.",
    analysisFocus: "episodic_accretion_outburst"
  },

  // =========================================================================
  // 5. CATEGORY D: VARIABLE & EVOLVED STARS (MIRA, AGB, CARBON STARS)
  // =========================================================================
  {
    id: "mira",
    name: "Mira",
    designations: ["Omicron Ceti", "Omic Cet", "AAVSO 0214-03", "HD 14386", "HIP 10826"],
    category: "variables",
    type: "Mira Pulsating Red Giant Prototype",
    ra: 32.88225,
    dec: -2.97744,
    ra_hms: "02:11:31.74",
    dec_dms: "-02:58:38.78",
    constell: "Cetus",
    spectral_type: "M5e-M9e IIIpv",
    distance_pc: 92.0,
    distance_ly: 300.0,
    proper_motion: "238 mas/yr",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: false,
    detectors: [1, 2, 3, 4, 5, 6],
    badge: "Mira Prototype",
    color: "#DB2777",
    obsCount: 620,
    description: "Historical prototype of long-period pulsating Mira variables (332-day cycle). Exhibits multi-magnitude amplitude variations.",
    analysisFocus: "pulsational_atmospheric_shock"
  },
  {
    id: "cw-leonis",
    name: "CW Leonis",
    designations: ["IRC +10216", "2MASS J09475738+1316436", "AllWISE J094757.38+131643.5"],
    category: "variables",
    type: "Extreme Carbon Star (AGB)",
    ra: 146.98917,
    dec: 13.27861,
    ra_hms: "09:47:57.40",
    dec_dms: "+13:16:43.00",
    constell: "Leo",
    spectral_type: "C9,5e (Carbon Star)",
    distance_pc: 120.0,
    distance_ly: 390.0,
    proper_motion: "35 mas/yr",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: false,
    detectors: [3, 4, 5, 6],
    badge: "Extreme Carbon Star",
    color: "#F43F5E",
    obsCount: 480,
    description: "Brightest 5-micron source outside solar system. High mass-loss AGB carbon star enclosed in expanding concentric dust shells.",
    analysisFocus: "carbonaceous_dust_mass_loss"
  },
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    designations: ["Alpha Orionis", "Alp Ori", "AAVSO 0549+07", "HD 39801", "HIP 27989"],
    category: "variables",
    type: "Red Supergiant Semi-Regular Variable",
    ra: 88.79294,
    dec: 7.40706,
    ra_hms: "05:55:10.31",
    dec_dms: "+07:24:25.42",
    constell: "Orion",
    spectral_type: "M1-M2Ia-ab",
    distance_pc: 168.0,
    distance_ly: 548.0,
    proper_motion: "30.1 mas/yr",
    status: "VERIFIED MULTI-EPOCH COVERAGE",
    isChallengeTarget: false,
    detectors: [1, 2, 3, 4, 5, 6],
    badge: "Red Supergiant",
    color: "#EF4444",
    obsCount: 710,
    description: "Evolved pulsating red supergiant. Source of the famous 2019-2020 'Great Dimming' driven by giant convective dust condensation.",
    analysisFocus: "supergiant_dust_ejection"
  },

  // =========================================================================
  // 6. CATEGORY E: OTHER OBJECTS (NEBULAE, STAR-FORMING, EXTRAGALACTIC)
  // =========================================================================
  {
    id: "orion-nebula-core",
    name: "Orion Nebula Core",
    designations: ["M42 Core", "Trapezium Cluster", "Theta1 Orionis", "NGC 1976 Core"],
    category: "nebulae_extragalactic",
    type: "H II Star-Forming Region & PAHs",
    ra: 83.82208,
    dec: -5.39111,
    ra_hms: "05:35:17.30",
    dec_dms: "-05:23:28.00",
    constell: "Orion",
    spectral_type: "H II Starburst Complex",
    distance_pc: 412.0,
    distance_ly: 1344.0,
    proper_motion: "1.8 mas/yr",
    status: "VERIFIED SPHEREx COVERAGE",
    isChallengeTarget: false,
    detectors: [1, 2, 3, 4, 5, 6],
    badge: "H II & PAHs",
    color: "#84CC16",
    obsCount: 850,
    description: "Nearest massive starburst factory. Intense UV photon fields excite strong 3.3-micron Polycyclic Aromatic Hydrocarbon emission.",
    analysisFocus: "polycyclic_aromatic_hydrocarbons"
  },
  {
    id: "helix-nebula",
    name: "Helix Nebula",
    designations: ["NGC 7293", "PK 036-57 1", "2MASS J22293855-2050136"],
    category: "nebulae_extragalactic",
    type: "Planetary Nebula (Molecular Hydrogen)",
    ra: 337.41083,
    dec: -20.83722,
    ra_hms: "22:29:38.60",
    dec_dms: "-20:50:14.00",
    constell: "Aquarius",
    spectral_type: "Planetary Nebula",
    distance_pc: 200.0,
    distance_ly: 650.0,
    proper_motion: "38 mas/yr",
    status: "VERIFIED SPHEREx COVERAGE",
    isChallengeTarget: false,
    detectors: [2, 3, 4, 5],
    badge: "Planetary Nebula",
    color: "#10B981",
    obsCount: 320,
    description: "Closest bright planetary nebula to Earth. Hosts thousands of dense cometary knots with molecular hydrogen (H2) line emission.",
    analysisFocus: "molecular_hydrogen_cometary_knots"
  },
  {
    id: "ngc-1068",
    name: "NGC 1068 (M77)",
    designations: ["Messier 77", "M77", "Cetus A", "Seyfert 2 Prototype"],
    category: "nebulae_extragalactic",
    type: "Seyfert 2 Active Galactic Nucleus",
    ra: 40.66988,
    dec: -0.01328,
    ra_hms: "02:42:40.77",
    dec_dms: "-00:00:47.81",
    constell: "Cetus",
    spectral_type: "Seyfert 2 / Starburst",
    distance_pc: 14400000.0,
    distance_ly: 47000000.0,
    proper_motion: "0.0 mas/yr",
    status: "CATALOGUE MATCH ONLY",
    isChallengeTarget: false,
    detectors: [1, 2, 3, 4, 5, 6],
    badge: "Seyfert 2 AGN",
    color: "#3B82F6",
    obsCount: 110,
    description: "Prototypical Seyfert 2 Active Galactic Nucleus (AGN) & starburst. Obscured torus reradiates nuclear UV flux into infrared continuum.",
    analysisFocus: "active_galactic_nucleus_torus"
  }
];

export const CHALLENGE_TARGETS = CELESTIAL_CATALOG.filter(t => t.isChallengeTarget);

export function getTargetsByCategory(category = "all") {
  if (!category || category === "all") return CELESTIAL_CATALOG;
  if (category === "challenge") return CHALLENGE_TARGETS;
  return CELESTIAL_CATALOG.filter(t => t.category === category);
}

export function findTargetByCoords(ra, dec, toleranceDeg = 0.08) {
  const numRa = parseFloat(ra);
  const numDec = parseFloat(dec);
  if (isNaN(numRa) || isNaN(numDec)) return null;

  const rad = Math.PI / 180;
  const d1 = numDec * rad;
  let best = null;
  let minDist = Infinity;

  for (const t of CELESTIAL_CATALOG) {
    const d2 = t.dec * rad;
    const da = (t.ra - numRa) * rad;
    const dd = (t.dec - numDec) * rad;
    const a = Math.sin(dd / 2) ** 2 + Math.cos(d1) * Math.cos(d2) * (Math.sin(da / 2) ** 2);
    const sepDeg = (2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)))) / rad;

    if (sepDeg <= toleranceDeg && sepDeg < minDist) {
      minDist = sepDeg;
      best = {
        ...t,
        sepArcsec: (sepDeg * 3600).toFixed(1),
        sepArcmin: (sepDeg * 60).toFixed(2)
      };
    }
  }

  return best;
}
