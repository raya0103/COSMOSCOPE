import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Telescope, 
  Sparkles, 
  Layers, 
  Activity, 
  Clock, 
  ArrowRight,
  Database,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Globe2,
  Binary,
  Compass,
  CheckCircle2,
  Radio,
  Eye,
  BarChart3,
  Menu,
  X,
  FileCheck2,
  Users,
  Search,
  BookOpen,
  Info,
  Sun,
  Moon
} from 'lucide-react';
import SearchHeader from '../components/SearchHeader';
import FullPageGalaxyBackground from '../components/FullPageGalaxyBackground';
import FaqSection from '../components/FaqSection';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTargetTab, setActiveTargetTab] = useState(0);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch verified targets from backend
  useEffect(() => {
    api.getTargets()
      .then(setTargets)
      .catch((err) => {
        console.warn("Could not fetch target catalogue from API, using default baseline.", err);
      });
  }, []);

  const handleSearch = (searchParams) => {
    navigate(`/explorer?ra=${searchParams.ra}&dec=${searchParams.dec}&fov=${searchParams.fov_arcmin}&name=${encodeURIComponent(searchParams.target_name || '')}`);
  };

  // 5 Research Targets Metadata
  const targetProfiles = [
    {
      id: "barnard",
      name: "Barnard's Star",
      type: "High Proper Motion Red Dwarf",
      constellation: "Ophiuchus",
      ra: 269.45208,
      dec: 4.69333,
      distance: "1.83 pc (5.96 ly)",
      properMotion: "10.36 arcsec/yr (Speed record holder)",
      bands: "D1, D2, D3, D6 (0.92 – 4.67 µm)",
      significance: "Demonstrates authentic astrometric displacement across SPHEREx and archival surveys, verifying sub-pixel centroid tracking against Gaia DR3 astrometric predictions.",
      image: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?q=80&w=1200&auto=format&fit=crop",
      badge: "High-Proper Motion Benchmark"
    },
    {
      id: "epsindi",
      name: "Epsilon Indi B",
      type: "Cold Brown Dwarf Binary (T1V + T6V)",
      constellation: "Indus",
      ra: 331.04375,
      dec: -56.78278,
      distance: "3.64 pc (11.87 ly)",
      properMotion: "4.71 arcsec/yr",
      bands: "D2, D5 (1.36 – 3.88 µm)",
      significance: "Sub-stellar cooling laboratory (T ~ 900 K) exhibiting steep methane (CH₄) absorption bands and high proper motion, bridging giant planets and stars.",
      image: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1200&auto=format&fit=crop",
      badge: "Sub-Stellar Brown Dwarf"
    },
    {
      id: "wise0855",
      name: "WISE 0855-0714",
      type: "Ultra-Cool Sub-Stellar Y-Dwarf",
      constellation: "Hydra",
      ra: 133.79513,
      dec: -7.24515,
      distance: "2.28 pc (7.43 ly)",
      properMotion: "8.14 arcsec/yr",
      bands: "D3, D5, D6 (2.42 – 5.00 µm)",
      significance: "Coldest known sub-stellar object (T ~ 250 K), uniquely situated for investigating condensed atmospheric water-ice (H₂O) cloud absorption features at 3.05 µm.",
      image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200&auto=format&fit=crop",
      badge: "Atmospheric Water-Ice Candidate"
    },
    {
      id: "rwaur",
      name: "RW Aurigae",
      type: "Eruptive T Tauri Classical Binary (CTTS)",
      constellation: "Auriga",
      ra: 76.95642,
      dec: 30.40142,
      distance: "163 pc (531 ly)",
      properMotion: "0.021 arcsec/yr",
      bands: "D1, D2, D4 (0.75 – 3.82 µm)",
      significance: "Young stellar laboratory featuring dramatic multi-magnitude occultation events caused by tidally disrupted protoplanetary dust streams and stellar accretion outbursts.",
      image: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=1200&auto=format&fit=crop",
      badge: "Variable Young Stellar Object"
    },
    {
      id: "rdrac",
      name: "R Draconis",
      type: "Pulsating Mira Asymptotic Giant (AGB)",
      constellation: "Draco",
      ra: 248.16750,
      dec: 66.75500,
      distance: "660 pc (2150 ly)",
      properMotion: "0.016 arcsec/yr",
      bands: "D1, D3, D5, D6 (0.75 – 5.00 µm)",
      significance: "Evolved giant undergoing radial pulsations with a 245.6-day period and severe flux variations (>5 mag amplitude), expelling circumstellar dust shells into the interstellar medium.",
      image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1200&auto=format&fit=crop",
      badge: "Long-Period Variable Giant"
    }
  ];

  return (
    <div className="cosmoscope-landing relative min-h-screen text-[#C4D0E0] selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      
      {/* =========================================================================
          FULL-PAGE ANIMATED GALAXY BACKGROUND (Preserved exactly as requested)
          ========================================================================= */}
      <FullPageGalaxyBackground />

      {/* Main Foreground Container (z-10 ensures full readability over background) */}
      <div className="relative z-10">

        {/* =========================================================================
            1. NAVIGATION: Restored Deep Navy Glass Navigation Bar
            ========================================================================= */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#030712]/80 border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              
              {/* Left: Brand Identity */}
              <Link to="/" className="flex items-center gap-3.5 group">
                <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-violet-600/30 border border-cyan-500/40 group-hover:border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300">
                  <Telescope className="w-5 h-5 text-[#36DDF5] group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black tracking-widest text-lg bg-gradient-to-r from-[#F5F8FF] via-cyan-200 to-sky-400 bg-clip-text text-transparent cosmoscope-brand-text">
                    COSMOSCOPE
                  </span>
                  <span className="text-[10px] font-mono text-[#91A3BA] tracking-wider">
                    EXPLORE THE CHANGING UNIVERSE
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#C4D0E0]">
                <a href="#about" className="hover:text-[#36DDF5] transition-colors">About</a>
                <a href="#science" className="hover:text-[#36DDF5] transition-colors">Science</a>
                <a href="#how-it-works" className="hover:text-[#36DDF5] transition-colors">How It Works</a>
                <a href="#discoveries" className="hover:text-[#36DDF5] transition-colors">Discoveries</a>
                <a href="#sources" className="hover:text-[#36DDF5] transition-colors">Data Sources</a>
                <a href="#faq" className="hover:text-[#36DDF5] transition-colors">FAQ</a>
              </div>

              {/* Right: Explore Dashboard Action & Theme Toggle */}
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="relative p-2.5 rounded-full bg-[#071225]/85 border border-cyan-500/30 text-[#C4D0E0] hover:text-[#36DDF5] hover:border-cyan-400/50 transition-all flex items-center justify-center shadow-sm"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  ) : (
                    <Moon className="w-4 h-4 text-violet-400" />
                  )}
                </button>

                <button
                  onClick={() => navigate('/explorer')}
                  className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.35)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <span>Explore Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mobile Header Controls */}
              <div className="flex sm:hidden items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-[#071225]/85 border border-cyan-500/30 text-[#C4D0E0] hover:text-[#36DDF5] shadow-sm"
                  aria-label="Toggle Theme"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl bg-[#071225]/85 border border-cyan-500/30 text-[#C4D0E0] hover:text-[#F5F8FF] shadow-sm"
                  aria-label="Toggle Menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Slide-down Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-cyan-500/20 bg-[#030712]/95 backdrop-blur-2xl px-6 py-6 space-y-4 shadow-xl">
              <div className="flex flex-col space-y-3 text-base font-medium text-[#C4D0E0]">
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#36DDF5] py-1">About</a>
                <a href="#science" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#36DDF5] py-1">Science</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#36DDF5] py-1">How It Works</a>
                <a href="#discoveries" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#36DDF5] py-1">Discoveries</a>
                <a href="#sources" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#36DDF5] py-1">Data Sources</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#36DDF5] py-1">FAQ</a>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-b border-cyan-500/15 text-sm">
                <span className="text-[#C4D0E0] font-medium">Appearance</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#071225] border border-cyan-500/30 text-xs font-mono text-[#C4D0E0] hover:text-[#36DDF5]"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-violet-400" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/explorer'); }}
                  className="w-full py-3 rounded-xl text-center text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg"
                >
                  Launch Live Dashboard →
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* =========================================================================
            2. HERO SECTION: Full-Width Cinematic Astronomical Hero
            ========================================================================= */}
        <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
          {/* Subtle Celestial Depth Backdrop Layer */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2600&auto=format&fit=crop')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-transparent to-[#030712]" />
          </div>

          {/* Hero Content Container */}
          <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            
            {/* Unified Headline & Subtitle Container with Luminous Celestial Aura */}
            <div className="relative inline-block mx-auto max-w-4xl">
              <div className="absolute -inset-x-16 -inset-y-12 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.08)_0%,transparent_70%)] pointer-events-none -z-10 blur-2xl" />

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[#F5F8FF] leading-[1.05]">
                EXPLORE THE <br />
                <span className="bg-gradient-to-r from-[#36DDF5] via-sky-300 to-violet-400 bg-clip-text text-transparent hero-gradient-title">
                  CHANGING UNIVERSE.
                </span>
              </h1>


              {/* Supporting Text */}
              <p className="mt-6 text-lg sm:text-2xl text-[#C4D0E0] font-light max-w-3xl mx-auto leading-relaxed">
                Travel through cosmic time. Explore real SPHEREx observations. Uncover the stories hidden in infrared light.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => navigate('/explorer')}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold tracking-wide uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_35px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(0,240,255,0.7)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Telescope className="w-4 h-4" />
                <span>Explore COSMOSCOPE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#about"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-semibold text-[#C4D0E0] bg-[#071225]/80 border border-cyan-500/30 backdrop-blur-md hover:bg-[#0B1730] hover:text-[#36DDF5] hover:border-cyan-400/60 transition-all duration-300 shadow-sm"
              >
                <Compass className="w-4 h-4 text-[#36DDF5]" />
                <span>Discover the Mission</span>
              </a>
            </div>

            {/* Live Search Bar for Immediate Discovery */}
            <div className="max-w-3xl mx-auto pt-6 text-left">
              <SearchHeader onSearch={handleSearch} loading={loading} />
            </div>

            {/* Key Mission Metrics Strip (Translucent Dark Navy Glass) */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-[#071225]/80 border border-cyan-500/25 backdrop-blur-md shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#36DDF5] font-mono">102 Bands</div>
                <div className="text-[11px] text-[#91A3BA] uppercase tracking-wider mt-1 font-semibold">Spectral Channels (R=35–128)</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#071225]/80 border border-cyan-500/25 backdrop-blur-md shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono">0.75 – 5.0 µm</div>
                <div className="text-[11px] text-[#91A3BA] uppercase tracking-wider mt-1 font-semibold">Near-Infrared Full Coverage</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#071225]/80 border border-cyan-500/25 backdrop-blur-md shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-violet-400 font-mono">6 Detectors</div>
                <div className="text-[11px] text-[#91A3BA] uppercase tracking-wider mt-1 font-semibold">2K×2K LVF Focal Plane Arrays</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#071225]/80 border border-cyan-500/25 backdrop-blur-md shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">3,885+ Obs</div>
                <div className="text-[11px] text-[#91A3BA] uppercase tracking-wider mt-1 font-semibold">Live IRSA Multi-Epoch Cutouts</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. WHY COSMOSCOPE MATTERS: Editorial Astronomy Storytelling (The 3 Cards)
            ========================================================================= */}
        <section id="about" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1730]/85 border border-cyan-500/40 text-[#36DDF5] text-xs font-semibold tracking-widest uppercase">
              Editorial Perspective
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F5F8FF] tracking-tight">
              Why Observing the Changing Universe Matters
            </h2>
            <p className="text-base sm:text-lg text-[#C4D0E0] font-normal leading-relaxed">
              The sky is not a frozen snapshot. Across cosmic epochs, stars oscillate in brightness, cold sub-stellar dwarfs glide through galactic coordinates, and eruptive young systems reshape their environments.
            </p>
          </div>

          {/* Three Editorial Highlights: Translucent Dark Navy Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Highlight 1: A Changing Universe */}
            <div className="group relative rounded-3xl overflow-hidden bg-[#071225]/80 backdrop-blur-md border border-cyan-500/25 hover:border-cyan-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,240,255,0.15)] transition-all duration-500 flex flex-col">
              <div className="h-64 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=1200&auto=format&fit=crop" 
                  alt="Dynamic Stellar Field"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071225] via-[#071225]/40 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0B1730]/90 backdrop-blur-md border border-cyan-500/40 text-xs font-mono text-[#36DDF5]">
                  01 • Temporal Dynamics
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between space-y-4 bg-[#071225]/40">
                <div>
                  <h3 className="text-xl font-bold text-[#F5F8FF] group-hover:text-[#36DDF5] transition-colors">
                    A Changing Universe
                  </h3>
                  <p className="text-sm text-[#C4D0E0] mt-2 leading-relaxed">
                    Celestial objects evolve and vary across human timescales. From the 245-day pulsation cycles of Mira giants to eruptive protoplanetary disk obscurations, multi-epoch observations reveal physics that single exposures cannot capture.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#91A3BA] border-t border-cyan-500/15 pt-4">
                  Verified: Astrometric displacement & flux oscillations
                </div>
              </div>
            </div>

            {/* Highlight 2: Hidden in Infrared */}
            <div className="group relative rounded-3xl overflow-hidden bg-[#071225]/80 backdrop-blur-md border border-violet-500/25 hover:border-violet-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(157,78,221,0.15)] transition-all duration-500 flex flex-col">
              <div className="h-64 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200&auto=format&fit=crop" 
                  alt="Infrared Nebula and Dust Clouds"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071225] via-[#071225]/40 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0B1730]/90 backdrop-blur-md border border-violet-500/40 text-xs font-mono text-violet-300">
                  02 • Infrared Penetration
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between space-y-4 bg-[#071225]/40">
                <div>
                  <h3 className="text-xl font-bold text-[#F5F8FF] group-hover:text-violet-300 transition-colors">
                    Hidden in Infrared
                  </h3>
                  <p className="text-sm text-[#C4D0E0] mt-2 leading-relaxed">
                    Visible light is easily scattered by interstellar dust, concealing young stars and cold sub-stellar dwarfs. Near- and mid-infrared wavelengths (0.75–5.0 µm) pierce this veil, mapping water, carbon dioxide, and carbon monoxide ice mantles.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#91A3BA] border-t border-violet-500/15 pt-4">
                  102 Spectral Bands: Uncovering cold planetary atmospheres
                </div>
              </div>
            </div>

            {/* Highlight 3: Across Cosmic Time */}
            <div className="group relative rounded-3xl overflow-hidden bg-[#071225]/80 backdrop-blur-md border border-sky-500/25 hover:border-sky-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(56,189,248,0.15)] transition-all duration-500 flex flex-col">
              <div className="h-64 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop" 
                  alt="Deep Celestial Starfield"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071225] via-[#071225]/40 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0B1730]/90 backdrop-blur-md border border-sky-500/40 text-xs font-mono text-sky-300">
                  03 • Multi-Decade Baseline
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between space-y-4 bg-[#071225]/40">
                <div>
                  <h3 className="text-xl font-bold text-[#F5F8FF] group-hover:text-sky-300 transition-colors">
                    Across Cosmic Time
                  </h3>
                  <p className="text-sm text-[#C4D0E0] mt-2 leading-relaxed">
                    Synthesizing historical archives (2MASS, AllWISE, Gaia DR3) with modern SPHEREx observations builds a 25-year astrometric and photometric baseline, enabling rigorous differentiation between persistent motion and transient phenomena.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#91A3BA] border-t border-sky-500/15 pt-4">
                  Cross-Mission Integration: 1998 to 2026+ verified data
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            4. ABOUT COSMOSCOPE: Authentic Scientific Research Identity
            ========================================================================= */}
        <section className="py-20 bg-[#071225]/40 backdrop-blur-sm border-y border-cyan-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column: Platform Narrative */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1730]/85 border border-violet-500/40 text-violet-300 text-xs font-semibold tracking-widest uppercase">
                  Platform Architecture
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F8FF] tracking-tight leading-tight">
                  Authentic NASA/IPAC Science Meets Interactive Exploration
                </h2>

                <p className="text-lg text-[#36DDF5] font-medium leading-relaxed">
                  COSMOSCOPE is an interactive astronomical research platform integrating genuine NASA/IPAC SPHEREx observations with historical astronomical archive data and scientific analysis tools.
                </p>

                <p className="text-sm text-[#C4D0E0] leading-relaxed font-light">
                  COSMOSCOPE bridges the gap between raw Multi-Extension FITS terabytes and accessible astrophysical insight. By combining Table Access Protocol (TAP) streaming, interactive multi-epoch blinking, circular aperture photometry, and continuous 102-band spectrophotometric extraction, the platform enables researchers, students, and astronomers to explore the dynamic infrared cosmos.
                </p>

                {/* Scientific Distinction Callouts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#0B1730]/80 border border-cyan-500/30 shadow-sm">
                    <div className="text-xs font-bold text-[#36DDF5] uppercase tracking-wide">Archive Data</div>
                    <div className="text-[11px] text-[#C4D0E0] mt-1">Level 2 MEF FITS directly from NASA/IPAC IRSA</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0B1730]/80 border border-violet-500/30 shadow-sm">
                    <div className="text-xs font-bold text-violet-400 uppercase tracking-wide">Analysis Tools</div>
                    <div className="text-[11px] text-[#C4D0E0] mt-1">Real-time aperture fluxes, centroids & subtraction</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0B1730]/80 border border-amber-500/30 shadow-sm">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">Model Integrity</div>
                    <div className="text-[11px] text-[#C4D0E0] mt-1">Theoretical models strictly labeled and separated</div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/explorer')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#36DDF5] hover:text-cyan-300 transition-colors"
                  >
                    <span>Launch Sky Explorer to inspect raw FITS data</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Visual Presentation with Genuine Imagery */}
              <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-[#071225]">
                <img 
                  src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1200&auto=format&fit=crop" 
                  alt="SPHEREx Observatory in Orbit"
                  className="w-full h-[450px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071225] via-[#071225]/40 to-transparent" />
                
                {/* Overlay Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-[#030712]/85 backdrop-blur-xl border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F8FF]">SPHEREx Mission Architecture</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-[#36DDF5] border border-cyan-500/40">
                      Sun-Synchronous Polar Orbit
                    </span>
                  </div>
                  <p className="text-[11px] text-[#C4D0E0] leading-normal">
                    Altitude 650 km • Orbital Period ~97.8 min • Great-circle 360° scans every orbit • Complete 4π full-sky survey every 6 months across 102 narrow spectral bandpasses.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            5. HOW IT WORKS: Three Clear Scientific Steps
            ========================================================================= */}
        <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1730]/85 border border-cyan-500/40 text-[#36DDF5] text-xs font-semibold tracking-widest uppercase">
              Methodology
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F5F8FF] tracking-tight">
              How COSMOSCOPE Works
            </h2>
            <p className="text-base sm:text-lg text-[#C4D0E0] font-normal leading-relaxed">
              A three-stage data processing pipeline bridging raw infrared FITS data to peer-reviewed astrophysical insight.
            </p>
          </div>

          {/* Steps Grid: Translucent Dark Navy Glass */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 01: EXPLORE */}
            <div className="relative rounded-3xl p-8 bg-[#071225]/80 backdrop-blur-md border border-cyan-500/25 hover:border-cyan-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 space-y-5 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-5xl font-black font-mono text-[#36DDF5]/40">01</span>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-[#36DDF5] flex items-center justify-center">
                    <Telescope className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#36DDF5] uppercase tracking-widest">01 — STAGE ONE</div>
                  <h3 className="text-2xl font-bold text-[#F5F8FF] mt-1">EXPLORE</h3>
                </div>
                <p className="text-sm text-[#C4D0E0] leading-relaxed font-light">
                  Access astronomical observations of selected celestial targets from available space-mission archives. Explore genuine SPHEREx FITS images alongside historical observations and supporting catalogue data.
                </p>
              </div>
              <div className="pt-3 text-xs font-mono font-semibold text-[#36DDF5] border-t border-cyan-500/20">
                Tools: Cosmic Time Machine · Multi-Mission Sky Explorer
              </div>
            </div>

            {/* Step 02: ANALYZE */}
            <div className="relative rounded-3xl p-8 bg-[#071225]/80 backdrop-blur-md border border-violet-500/25 hover:border-violet-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 space-y-5 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-5xl font-black font-mono text-violet-400/40">02</span>
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">02 — STAGE TWO</div>
                  <h3 className="text-2xl font-bold text-[#F5F8FF] mt-1">ANALYZE</h3>
                </div>
                <p className="text-sm text-[#C4D0E0] leading-relaxed font-light">
                  Investigate astronomical images, spectral channels, brightness and positional changes. Use interactive image processing, aperture photometry, spectral analysis and multi-epoch comparisons to examine each target.
                </p>
              </div>
              <div className="pt-3 text-xs font-mono font-semibold text-violet-300 border-t border-violet-500/20">
                Tools: FITS Image Analysis · Spectral Lab · Astrometry
              </div>
            </div>

            {/* Step 03: DISCOVER */}
            <div className="relative rounded-3xl p-8 bg-[#071225]/80 backdrop-blur-md border border-emerald-500/25 hover:border-emerald-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 space-y-5 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-5xl font-black font-mono text-emerald-400/40">03</span>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">03 — STAGE THREE</div>
                  <h3 className="text-2xl font-bold text-[#F5F8FF] mt-1">DISCOVER</h3>
                </div>
                <p className="text-sm text-[#C4D0E0] leading-relaxed font-light">
                  Identify interesting patterns and potential anomalies through scientific visualizations and evidence-based analysis. Review candidate discoveries, contribute classifications and generate detailed scientific reports.
                </p>
              </div>
              <div className="pt-3 text-xs font-mono font-semibold text-emerald-300 border-t border-emerald-500/20">
                Tools: Discovery Engine · Anomaly Analysis · Scientific Evidence Dossiers
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            6. EXPLORE THE SCIENCE: Four Premium Feature Cards
            ========================================================================= */}
        <section id="science" className="py-24 bg-[#071225]/40 backdrop-blur-sm border-y border-cyan-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1730]/85 border border-cyan-500/40 text-[#36DDF5] text-xs font-semibold tracking-widest uppercase">
                Interactive Modules
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F5F8FF] tracking-tight">
                Explore the Science
              </h2>
              <p className="text-base sm:text-lg text-[#C4D0E0] font-normal leading-relaxed">
                Four specialized astronomical analysis environments built directly on authentic SPHEREx observation structures.
              </p>
            </div>

            {/* 4 Feature Cards Grid: Translucent Dark Navy Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Card 1: Cosmic Time Machine */}
              <div 
                onClick={() => navigate('/time-machine')}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-[#071225]/80 backdrop-blur-md border border-cyan-500/25 hover:border-cyan-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,240,255,0.15)] transition-all duration-500 flex flex-col"
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1200&auto=format&fit=crop" 
                    alt="Multi-epoch Starfield"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071225] via-[#071225]/40 to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0B1730]/90 backdrop-blur-md border border-cyan-500/40 text-xs font-mono text-[#36DDF5] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Route: /time-machine</span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between space-y-4 bg-[#071225]/40">
                  <div>
                    <h3 className="text-2xl font-bold text-[#F5F8FF] group-hover:text-[#36DDF5] transition-colors flex items-center justify-between">
                      <span>Cosmic Time Machine</span>
                      <ArrowRight className="w-5 h-5 text-[#36DDF5] group-hover:translate-x-1.5 transition-transform" />
                    </h3>
                    <p className="text-sm text-[#C4D0E0] mt-3 leading-relaxed font-light">
                      Compare observations across different epochs and explore how celestial sources change. Features dynamic blinking (0.5–3.0 Hz), automated flux-matched difference imaging, and synchronized astrometric motion vectors.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-cyan-500/15 text-xs text-[#91A3BA]">
                    <span className="text-[#36DDF5] font-mono font-semibold">Capabilities:</span>
                    <span>Blink Comparator • Epoch Subtraction • Motion Tracking</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Spectral Lab */}
              <div 
                onClick={() => navigate('/spectral-lab')}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-[#071225]/80 backdrop-blur-md border border-violet-500/25 hover:border-violet-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(157,78,221,0.15)] transition-all duration-500 flex flex-col"
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop" 
                    alt="Infrared Spectrum and Wavelengths"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071225] via-[#071225]/40 to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0B1730]/90 backdrop-blur-md border border-violet-500/40 text-xs font-mono text-violet-300 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Route: /spectral-lab</span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between space-y-4 bg-[#071225]/40">
                  <div>
                    <h3 className="text-2xl font-bold text-[#F5F8FF] group-hover:text-violet-300 transition-colors flex items-center justify-between">
                      <span>Spectral Lab</span>
                      <ArrowRight className="w-5 h-5 text-violet-400 group-hover:translate-x-1.5 transition-transform" />
                    </h3>
                    <p className="text-sm text-[#C4D0E0] mt-3 leading-relaxed font-light">
                      Explore infrared spectral channels and investigate exploratory absorption features. Displays continuous spectrophotometric energy distributions across 102 bands (0.75–5.0 µm) and evaluates exploratory H₂O, CO₂, and CO ice optical depths.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-violet-500/15 text-xs text-[#91A3BA]">
                    <span className="text-violet-400 font-mono font-semibold">Capabilities:</span>
                    <span>102-Band SED • Ice Absorption Fitting • 6 Detectors</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Image Analysis Lab */}
              <div 
                onClick={() => navigate('/image-lab')}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-[#071225]/80 backdrop-blur-md border border-sky-500/25 hover:border-sky-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(56,189,248,0.15)] transition-all duration-500 flex flex-col"
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=1200&auto=format&fit=crop" 
                    alt="FITS Image Analysis"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071225] via-[#071225]/40 to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0B1730]/90 backdrop-blur-md border border-sky-500/40 text-xs font-mono text-sky-300 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Route: /image-lab</span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between space-y-4 bg-[#071225]/40">
                  <div>
                    <h3 className="text-2xl font-bold text-[#F5F8FF] group-hover:text-sky-300 transition-colors flex items-center justify-between">
                      <span>Image Analysis Lab</span>
                      <ArrowRight className="w-5 h-5 text-sky-400 group-hover:translate-x-1.5 transition-transform" />
                    </h3>
                    <p className="text-sm text-[#C4D0E0] mt-3 leading-relaxed font-light">
                      Investigate image subtraction, photometry, stacking and image-level analysis. Execute circular aperture integrations with background annulus estimation, compare radial brightness profiles, and stack multi-exposure frames for √N noise reduction.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-sky-500/15 text-xs text-[#91A3BA]">
                    <span className="text-sky-400 font-mono font-semibold">Capabilities:</span>
                    <span>Aperture Photometry • Multi-Frame Stacking • Radial Profiles</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Discovery Engine */}
              <div 
                onClick={() => navigate('/discovery')}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-[#071225]/80 backdrop-blur-md border border-emerald-500/25 hover:border-emerald-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] transition-all duration-500 flex flex-col"
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200&auto=format&fit=crop" 
                    alt="Deep Sky Candidate Field"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071225] via-[#071225]/40 to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0B1730]/90 backdrop-blur-md border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Route: /discovery</span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between space-y-4 bg-[#071225]/40">
                  <div>
                    <h3 className="text-2xl font-bold text-[#F5F8FF] group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                      <span>Discovery Engine</span>
                      <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1.5 transition-transform" />
                    </h3>
                    <p className="text-sm text-[#C4D0E0] mt-3 leading-relaxed font-light">
                      Explore anomaly scores, candidate classifications and scientific evidence. Features our 4-pillar anomaly radar evaluating motion vectors, flux variability, spectral ice features, and catalog novelty into a transparent composite index.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-emerald-500/15 text-xs text-[#91A3BA]">
                    <span className="text-emerald-400 font-mono font-semibold">Capabilities:</span>
                    <span>4-Pillar Radar • Candidate Review Queue • Scientific Evidence Dossiers</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            7. RESEARCH TARGETS: Authentic Project Targets Dossier
            ========================================================================= */}
        <section id="discoveries" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1730]/85 border border-cyan-500/40 text-[#36DDF5] text-xs font-semibold tracking-widest uppercase">
              Case Studies
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F5F8FF] tracking-tight">
              Five Verified Research Targets
            </h2>
            <p className="text-base sm:text-lg text-[#C4D0E0] font-normal leading-relaxed">
              Real astrophysical targets with genuine Multi-Extension FITS observations archived in NASA/IPAC IRSA SPHEREx QR2.
            </p>
          </div>

          {/* Target Tabs Header */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {targetProfiles.map((target, idx) => (
              <button
                key={target.id}
                onClick={() => setActiveTargetTab(idx)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                  activeTargetTab === idx
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-105 font-bold'
                    : 'bg-[#071225]/85 border border-cyan-500/25 text-[#C4D0E0] hover:text-[#F5F8FF] hover:border-cyan-400/50 shadow-sm'
                }`}
              >
                {target.name}
              </button>
            ))}
          </div>

          {/* Active Target Card: Deep Navy Glass Panel */}
          {(() => {
            const t = targetProfiles[activeTargetTab];
            return (
              <div className="rounded-3xl overflow-hidden bg-[#071225]/90 backdrop-blur-md border border-cyan-500/30 shadow-[0_12px_48px_rgba(0,0,0,0.5)]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  
                  {/* Target Visual / Artwork */}
                  <div className="lg:col-span-5 relative h-80 lg:h-auto min-h-[340px] overflow-hidden">
                    <img 
                      src={t.image} 
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#071225] via-[#071225]/40 to-transparent" />
                    
                    {/* Category Pill */}
                    <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-full bg-[#0B1730]/90 backdrop-blur-md border border-cyan-500/40 text-xs font-mono text-[#36DDF5] shadow-sm">
                      {t.badge}
                    </div>
                  </div>

                  {/* Target Information & Technical Details */}
                  <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-mono text-[#36DDF5] font-bold uppercase tracking-wider">{t.type}</span>
                        <span className="text-xs font-mono text-[#91A3BA]">Constellation: {t.constellation}</span>
                      </div>

                      <h3 className="text-3xl sm:text-4xl font-black text-[#F5F8FF] mt-1">
                        {t.name}
                      </h3>

                      <p className="text-sm text-[#C4D0E0] mt-4 leading-relaxed font-light">
                        {t.significance}
                      </p>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
                        <div className="p-3.5 rounded-2xl bg-[#0B1730]/80 border border-cyan-500/20 shadow-sm">
                          <div className="text-[10px] font-mono text-[#91A3BA] uppercase">Right Ascension</div>
                          <div className="text-sm font-bold text-[#F5F8FF] font-mono mt-0.5">{t.ra}°</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#0B1730]/80 border border-cyan-500/20 shadow-sm">
                          <div className="text-[10px] font-mono text-[#91A3BA] uppercase">Declination</div>
                          <div className="text-sm font-bold text-[#F5F8FF] font-mono mt-0.5">{t.dec}°</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#0B1730]/80 border border-cyan-500/20 shadow-sm">
                          <div className="text-[10px] font-mono text-[#91A3BA] uppercase">Distance</div>
                          <div className="text-sm font-bold text-[#F5F8FF] font-mono mt-0.5">{t.distance}</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#0B1730]/80 border border-cyan-500/20 shadow-sm">
                          <div className="text-[10px] font-mono text-[#91A3BA] uppercase">Proper Motion</div>
                          <div className="text-sm font-bold text-[#36DDF5] font-mono mt-0.5">{t.properMotion}</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#0B1730]/80 border border-cyan-500/20 sm:col-span-2 shadow-sm">
                          <div className="text-[10px] font-mono text-[#91A3BA] uppercase">SPHEREx Channels</div>
                          <div className="text-sm font-bold text-violet-300 font-mono mt-0.5">{t.bands}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Link to Inspect in Sky Explorer */}
                    <div className="pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
                      <button
                        onClick={() => navigate(`/explorer?name=${encodeURIComponent(t.name)}&ra=${t.ra}&dec=${t.dec}&fov=3.0`)}
                        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105 transition-all"
                      >
                        <Telescope className="w-4 h-4" />
                        <span>Inspect {t.name} in Sky Explorer</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate(`/time-machine?ra=${t.ra}&dec=${t.dec}&name=${encodeURIComponent(t.name)}`)}
                        className="text-xs font-semibold text-[#91A3BA] hover:text-[#36DDF5] transition-colors"
                      >
                        Open in Time Machine →
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}
        </section>

        {/* =========================================================================
            8. MISSION IMPACT: Engaging Editorial on the Value of Temporal Infrared
            ========================================================================= */}
        <section className="relative py-28 sm:py-32 overflow-hidden">
          {/* Full-width Panoramic Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2600&auto=format&fit=crop')`,
            }}
          >
            <div className="absolute inset-0 bg-[#030712]/90 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712]" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1730]/85 border border-cyan-500/40 text-[#36DDF5] text-xs font-semibold tracking-widest uppercase">
              Mission Impact
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#F5F8FF] tracking-tight leading-tight">
              Illuminating the Dynamic Cosmos Through Infrared Time-Series
            </h2>

            <p className="text-base sm:text-xl text-[#C4D0E0] font-light leading-relaxed max-w-3xl mx-auto">
              Astronomical research has traditionally relied on static atlases. By providing continuous, all-sky spectrophotometry every 6 months across 102 infrared channels, SPHEREx transforms our view of the universe from a frozen photograph into a living, evolving timeline.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-6 text-left">
              <div className="p-5 rounded-2xl bg-[#071225]/85 border border-cyan-500/25 shadow-sm backdrop-blur-md">
                <CheckCircle2 className="w-5 h-5 text-[#36DDF5] mb-2" />
                <div className="text-sm font-bold text-[#F5F8FF]">Multi-Epoch Infrared</div>
                <div className="text-xs text-[#91A3BA] mt-1">Isolates high-velocity motion and intrinsic stellar variability.</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#071225]/85 border border-violet-500/25 shadow-sm backdrop-blur-md">
                <CheckCircle2 className="w-5 h-5 text-violet-400 mb-2" />
                <div className="text-sm font-bold text-[#F5F8FF]">Historical Integration</div>
                <div className="text-xs text-[#91A3BA] mt-1">Cross-matches 25-year baselines from 2MASS, WISE, and Gaia DR3.</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#071225]/85 border border-sky-500/25 shadow-sm backdrop-blur-md">
                <CheckCircle2 className="w-5 h-5 text-sky-400 mb-2" />
                <div className="text-sm font-bold text-[#F5F8FF]">Scientific Visualization</div>
                <div className="text-xs text-[#91A3BA] mt-1">Transforms raw terabytes into intuitive, verifiable analysis curves.</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#071225]/85 border border-emerald-500/25 shadow-sm backdrop-blur-md">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-sm font-bold text-[#F5F8FF]">Transparent Discovery</div>
                <div className="text-xs text-[#91A3BA] mt-1">Enforces rigorous distinction between observations and models.</div>
              </div>
            </div>

            <div className="pt-8">
              <p className="text-lg sm:text-xl font-medium text-[#36DDF5] tracking-wide italic">
                "The universe is in motion. Through infrared vision and temporal precision, COSMOSCOPE illuminates the changing sky."
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. DATA SOURCES & SCIENTIFIC TRANSPARENCY: Rigorous Provenance
            ========================================================================= */}
        <section id="sources" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1730]/85 border border-cyan-500/40 text-[#36DDF5] text-xs font-semibold tracking-widest uppercase">
              Data Governance
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F5F8FF] tracking-tight">
              Data Sources & Scientific Transparency
            </h2>
            <p className="text-base sm:text-lg text-[#C4D0E0] font-normal leading-relaxed">
              COSMOSCOPE operates exclusively on authentic public astronomical archives and enforces strict classification tiers for scientific integrity.
            </p>
          </div>

          {/* 5 Data Source Cards: Translucent Dark Navy Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
            <div className="p-6 rounded-2xl bg-[#071225]/80 backdrop-blur-md border border-cyan-500/25 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#36DDF5] uppercase">Primary Survey</div>
                <div className="text-base font-extrabold text-[#F5F8FF] mt-1">NASA / IPAC IRSA</div>
                <div className="text-xs text-[#C4D0E0] mt-2 font-light">SPHEREx QR2/QR3 Level 2 Multi-Extension FITS cutouts & TAP catalog streaming.</div>
              </div>
              <div className="text-[10px] font-mono text-[#91A3BA] mt-4">IRSA / Caltech / JPL</div>
            </div>

            <div className="p-6 rounded-2xl bg-[#071225]/80 backdrop-blur-md border border-sky-500/25 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-sky-400 uppercase">Astrometric Truth</div>
                <div className="text-base font-extrabold text-[#F5F8FF] mt-1">Gaia DR3 (ESA)</div>
                <div className="text-xs text-[#C4D0E0] mt-2 font-light">Sub-milliarcsecond proper motions, parallaxes, and position epoch predictions.</div>
              </div>
              <div className="text-[10px] font-mono text-[#91A3BA] mt-4">European Space Agency</div>
            </div>

            <div className="p-6 rounded-2xl bg-[#071225]/80 backdrop-blur-md border border-violet-500/25 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-violet-400 uppercase">NIR Baseline</div>
                <div className="text-base font-extrabold text-[#F5F8FF] mt-1">2MASS Survey</div>
                <div className="text-xs text-[#C4D0E0] mt-2 font-light">J, H, and Ks photometric baselines establishing 1997–2001 historical reference epochs.</div>
              </div>
              <div className="text-[10px] font-mono text-[#91A3BA] mt-4">NASA / UMASS / IPAC</div>
            </div>

            <div className="p-6 rounded-2xl bg-[#071225]/80 backdrop-blur-md border border-amber-500/25 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-amber-400 uppercase">Mid-Infrared</div>
                <div className="text-base font-extrabold text-[#F5F8FF] mt-1">WISE / NEOWISE</div>
                <div className="text-xs text-[#C4D0E0] mt-2 font-light">W1–W4 multi-epoch thermal infrared time-series spanning 2010 to 2024.</div>
              </div>
              <div className="text-[10px] font-mono text-[#91A3BA] mt-4">NASA / JPL-Caltech</div>
            </div>

            <div className="p-6 rounded-2xl bg-[#071225]/80 backdrop-blur-md border border-emerald-500/25 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase">Cross-ID</div>
                <div className="text-base font-extrabold text-[#F5F8FF] mt-1">CDS SIMBAD</div>
                <div className="text-xs text-[#C4D0E0] mt-2 font-light">Astronomical object identification, literature classifications, and bibliographies.</div>
              </div>
              <div className="text-[10px] font-mono text-[#91A3BA] mt-4">CDS Strasbourg</div>
            </div>
          </div>

          {/* Mandatory 5 Transparency Tiers Panel */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#071225]/90 backdrop-blur-md border border-cyan-500/40 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#36DDF5]" />
              <h3 className="text-xl font-bold text-[#F5F8FF]">Scientific Transparency Framework</h3>
            </div>
            <p className="text-sm text-[#C4D0E0] font-light leading-relaxed">
              To prevent scientific misrepresentation and ensure adherence to rigorous astronomical standards, COSMOSCOPE classifies all displayed data into five transparent tiers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#0B1730]/85 border border-cyan-500/30 shadow-sm">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-[#36DDF5] uppercase">Tier 1</span>
                <div className="text-sm font-bold text-[#F5F8FF] mt-2">Measured Observations</div>
                <p className="text-xs text-[#C4D0E0] mt-1 font-light">
                  Actual retrieved astronomical observations and FITS-derived measurements directly from telescope archives.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1730]/85 border border-sky-500/30 shadow-sm">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 uppercase">Tier 2</span>
                <div className="text-sm font-bold text-[#F5F8FF] mt-2">Derived Measurements</div>
                <p className="text-xs text-[#C4D0E0] mt-1 font-light">
                  Results calculated from observational data (aperture fluxes, centroids), with appropriate statistical and systematic uncertainties.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1730]/85 border border-violet-500/30 shadow-sm">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 uppercase">Tier 3</span>
                <div className="text-sm font-bold text-[#F5F8FF] mt-2">Interpolated Data</div>
                <p className="text-xs text-[#C4D0E0] mt-1 font-light">
                  Modelled or interpolated spectral channels across LVF dispersion, explicitly identified as synthesized curves.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1730]/85 border border-amber-500/30 shadow-sm">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">Tier 4</span>
                <div className="text-sm font-bold text-[#F5F8FF] mt-2">Theoretical Models</div>
                <p className="text-xs text-[#C4D0E0] mt-1 font-light">
                  Theoretical light curves and model baselines, visibly badged and never presented as direct telescope exposures.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1730]/85 border border-rose-500/30 shadow-sm">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 uppercase">Tier 5</span>
                <div className="text-sm font-bold text-[#F5F8FF] mt-2">Simulations</div>
                <p className="text-xs text-[#C4D0E0] mt-1 font-light">
                  Illustrative simulations, including the project's Keplerian orbit visualization, clearly labelled as illustrative models.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. FAQ: Interactive Scientific FAQ Accordion
            ========================================================================= */}
        <FaqSection />

        {/* =========================================================================
            11. FOOTER: Professional Scientific Footer (Restored Dark Theme)
            ========================================================================= */}
        <footer className="border-t border-cyan-500/20 bg-[#030712]/95 backdrop-blur-xl py-16 text-[#91A3BA] text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
              {/* Column 1: Identity & Description */}
              <div className="space-y-4 md:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-[#36DDF5] flex items-center justify-center font-bold">
                    <Telescope className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-[#F5F8FF] text-base tracking-wider">COSMOSCOPE</span>
                </div>
                <p className="text-xs text-[#91A3BA] leading-relaxed font-light">
                  An interactive open-science platform for exploring genuine NASA SPHEREx infrared observations, multi-epoch celestial variability, and astrometric motion vectors.
                </p>
              </div>

              {/* Column 2: Homepage Section Anchors */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#F5F8FF] uppercase tracking-wider">Sections</div>
                <ul className="space-y-2 text-[#C4D0E0] font-light">
                  <li><a href="#about" className="hover:text-[#36DDF5] transition-colors">About the Mission</a></li>
                  <li><a href="#science" className="hover:text-[#36DDF5] transition-colors">Science Modules</a></li>
                  <li><a href="#how-it-works" className="hover:text-[#36DDF5] transition-colors">How It Works</a></li>
                  <li><a href="#discoveries" className="hover:text-[#36DDF5] transition-colors">Research Targets</a></li>
                  <li><a href="#sources" className="hover:text-[#36DDF5] transition-colors">Data Sources & Transparency</a></li>
                  <li><a href="#faq" className="hover:text-[#36DDF5] transition-colors">FAQ</a></li>
                </ul>
              </div>

              {/* Column 3: Functional Dashboard Routes */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#F5F8FF] uppercase tracking-wider">Research Dashboard</div>
                <ul className="space-y-2 text-[#C4D0E0] font-light">
                  <li><Link to="/explorer" className="hover:text-[#36DDF5] transition-colors">Sky Explorer</Link></li>
                  <li><Link to="/time-machine" className="hover:text-[#36DDF5] transition-colors">Cosmic Time Machine</Link></li>
                  <li><Link to="/spectral-lab" className="hover:text-[#36DDF5] transition-colors">102-Band Spectral Lab</Link></li>
                  <li><Link to="/image-lab" className="hover:text-[#36DDF5] transition-colors">Image Analysis Lab</Link></li>
                  <li><Link to="/discovery" className="hover:text-[#36DDF5] transition-colors">Discovery Engine</Link></li>
                  <li><Link to="/analytics" className="hover:text-[#36DDF5] transition-colors">Scientific Analytics</Link></li>
                  <li><Link to="/dossier" className="hover:text-[#36DDF5] transition-colors">Scientific Evidence Dossier</Link></li>
                </ul>
              </div>

              {/* Column 4: Scientific Provenance */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#F5F8FF] uppercase tracking-wider">Data Provenance</div>
                <p className="text-xs text-[#91A3BA] leading-relaxed font-light">
                  Data streamed from the NASA/IPAC Infrared Science Archive (IRSA), Caltech/JPL. Astrometry crossmatched with ESA Gaia DR3, NASA 2MASS, AllWISE, and CDS SIMBAD.
                </p>
                <div className="pt-2 font-mono text-[10px] text-[#91A3BA]">
                  FITS Standard: 102 Bands • 0.75 – 5.0 µm • MEF Format
                </div>
              </div>

            </div>

            {/* Bottom Row */}
            <div className="pt-8 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#91A3BA]">
              <div>
                © 2026 COSMOSCOPE.
              </div>
              <div className="font-semibold text-[#36DDF5] tracking-wider uppercase">
                Explore the changing universe.
              </div>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}
