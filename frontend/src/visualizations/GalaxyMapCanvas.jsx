import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Compass, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Target, 
  Eye, 
  Layers, 
  Globe2, 
  Grid, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

const CHALLENGE_TARGETS = [
  { id: "barnards-star", name: "Barnard's Star", ra: 269.45208, dec: 4.69333, color: "#00F0FF", type: "High Proper Motion M-Dwarf", constell: "Ophiuchus", badge: "10.4″/yr Motion" },
  { id: "wise-0855", name: "WISE 0855", ra: 133.79513, dec: -7.24515, color: "#38BDF8", type: "Coldest Brown Dwarf (Water Ice)", constell: "Hydra", badge: "Water Ice" },
  { id: "epsilon-indi-b", name: "Epsilon Indi B", ra: 331.04375, dec: -56.78278, color: "#A855F7", type: "Substellar Binary Brown Dwarf", constell: "Indus", badge: "Brown Dwarf" },
  { id: "rw-aurigae", name: "RW Aurigae", ra: 76.95642, dec: 30.40142, color: "#F59E0B", type: "Eruptive T Tauri Variable", constell: "Auriga", badge: "Variable YSO" },
  { id: "r-draconis", name: "R Draconis", ra: 248.16750, dec: 66.75500, color: "#EC4899", type: "Mira Pulsating Giant Variable", constell: "Draco", badge: "Mira Giant" },
];

const SURVEY_OPTIONS = [
  { id: 'P/DSS2/color', name: 'DSS2 Optical', desc: '0.4 – 0.9 µm (POSS-II/AAO Color)', wave: 'Optical' },
  { id: 'P/2MASS/color', name: '2MASS Infrared', desc: '1.25 – 2.17 µm (JHKs Color)', wave: 'Near-IR' },
  { id: 'P/allWISE/color', name: 'AllWISE Mid-IR', desc: '3.4 – 12.0 µm (W1/W2/W3 Color)', wave: 'Mid-IR' },
];

// Helper to convert RA/Dec to Galactic l, b
function raDecToGalactic(raDeg, decDeg) {
  const rad = Math.PI / 180;
  const alpha = raDeg * rad;
  const delta = decDeg * rad;
  const alphaGP = 192.85948 * rad;
  const deltaGP = 27.12825 * rad;
  const l0 = 122.93192 * rad;

  const sinB = Math.sin(delta) * Math.sin(deltaGP) + Math.cos(delta) * Math.cos(deltaGP) * Math.cos(alpha - alphaGP);
  const b = Math.asin(Math.max(-1, Math.min(1, sinB)));

  const y = Math.cos(delta) * Math.sin(alpha - alphaGP);
  const x = Math.sin(delta) * Math.cos(deltaGP) - Math.cos(delta) * Math.sin(deltaGP) * Math.cos(alpha - alphaGP);
  let l = l0 - Math.atan2(y, x);
  l = ((l / rad) % 360 + 360) % 360;

  return { l, b: b / rad };
}

function computeAngularDistanceArcsec(ra1, dec1, ra2, dec2) {
  const rad = Math.PI / 180;
  const d1 = dec1 * rad;
  const d2 = dec2 * rad;
  const da = (ra2 - ra1) * rad;
  const dd = (dec2 - dec1) * rad;
  const a = Math.sin(dd / 2) ** 2 + Math.cos(d1) * Math.cos(d2) * (Math.sin(da / 2) ** 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  return (c / rad) * 3600.0;
}

export default function GalaxyMapCanvas({
  selectedRa = 269.45208,
  selectedDec = 4.69333,
  selectedName = "Barnard's Star",
  onSelectTarget = null,
  onSwitchToCutout = null
}) {
  const mapContainerRef = useRef(null);
  const aladinInstanceRef = useRef(null);
  const targetCatalogRef = useRef(null);
  const selectedMarkerRef = useRef(null);

  const [aladinReady, setAladinReady] = useState(false);
  const [initError, setInitError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // View settings
  const [currentSurvey, setCurrentSurvey] = useState('P/DSS2/color');
  const [cooFrame, setCooFrame] = useState('equatorial'); // 'equatorial' or 'galactic'
  const [showGrid, setShowGrid] = useState(true);

  // Interactive telemetry
  const [mouseCoords, setMouseCoords] = useState(null);
  const [hoveredChallenge, setHoveredChallenge] = useState(null);
  const [identifyingClick, setIdentifyingClick] = useState(false);
  const [identSource, setIdentSource] = useState(null);

  // Initialize Aladin Lite
  const initAladin = useCallback(async () => {
    setIsInitializing(true);
    setInitError(null);

    try {
      const aladinModule = await import('aladin-lite');
      const A = aladinModule.default;
      await A.init;

      if (!mapContainerRef.current) return;

      // Clean existing instance if any
      if (aladinInstanceRef.current && typeof aladinInstanceRef.current.destroy === 'function') {
        try { aladinInstanceRef.current.destroy(); } catch (_) {}
      }

      const aladin = A.aladin(mapContainerRef.current, {
        survey: currentSurvey,
        fov: 180,
        target: `${selectedRa} ${selectedDec}`,
        cooFrame: cooFrame,
        projection: 'AIT',
        showCooGrid: showGrid,
        showCooGridControl: false,
        showSimbadPointerControl: false,
        showLayersControl: false,
        showFullscreenControl: false,
        showGotoControl: false,
        showShareControl: false,
        showContextualMenu: false,
        showProjectionControl: false,
        showZoomControl: false
      });

      aladinInstanceRef.current = aladin;

      // 1. Add NASA Challenge Targets Catalog
      const challengeCat = A.catalog({
        name: 'NASA SPHEREx Challenge Targets',
        sourceSize: 18,
        color: '#00F0FF',
        onClick: (marker) => {
          if (marker && marker.data) {
            if (onSelectTarget) {
              onSelectTarget(marker.data.ra, marker.data.dec, marker.data.name);
            }
          }
        }
      });
      aladin.addCatalog(challengeCat);
      targetCatalogRef.current = challengeCat;

      CHALLENGE_TARGETS.forEach(t => {
        const marker = A.marker(t.ra, t.dec, {
          popupTitle: t.name,
          popupDesc: `<strong>${t.type}</strong><br>Constellation: ${t.constell}<br>RA: ${t.ra.toFixed(4)}°, Dec: ${t.dec.toFixed(4)}°`,
          data: t
        });
        challengeCat.addSources([marker]);
      });

      // 2. Add Selected Reticle Layer
      const selCat = A.catalog({
        name: 'Active Target Reticle',
        sourceSize: 24,
        color: '#38BDF8'
      });
      aladin.addCatalog(selCat);
      selectedMarkerRef.current = selCat;

      const activeMarker = A.marker(selectedRa, selectedDec, {
        popupTitle: selectedName,
        popupDesc: `Selected Celestial Target: ${selectedName}<br>RA: ${selectedRa.toFixed(4)}°, Dec: ${selectedDec.toFixed(4)}°`
      });
      selCat.addSources([activeMarker]);

      setAladinReady(true);
      setIsInitializing(false);
    } catch (err) {
      console.error("Aladin Lite initialisation error:", err);
      setInitError(err.message || "Failed to initialize WebGL HiPS Survey Viewer");
      setIsInitializing(false);
    }
  }, [currentSurvey, cooFrame, showGrid, selectedRa, selectedDec, selectedName, onSelectTarget]);

  useEffect(() => {
    initAladin();

    return () => {
      if (aladinInstanceRef.current && typeof aladinInstanceRef.current.destroy === 'function') {
        try { aladinInstanceRef.current.destroy(); } catch (_) {}
      }
      aladinInstanceRef.current = null;
    };
  }, []);

  // Update selected target position on the real sky map
  useEffect(() => {
    if (!aladinInstanceRef.current || !aladinReady) return;

    try {
      aladinInstanceRef.current.gotoRaDec(selectedRa, selectedDec);

      // Re-center active reticle
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.clear();
        import('aladin-lite').then(({ default: A }) => {
          const marker = A.marker(selectedRa, selectedDec, {
            popupTitle: selectedName,
            popupDesc: `Selected: ${selectedName}<br>RA: ${selectedRa.toFixed(4)}°, Dec: ${selectedDec.toFixed(4)}°`
          });
          selectedMarkerRef.current.addSources([marker]);
        });
      }
    } catch (err) {
      console.warn("Failed to update map position:", err);
    }
  }, [selectedRa, selectedDec, selectedName, aladinReady]);

  // Handle survey change
  const handleSurveyChange = (surveyId) => {
    setCurrentSurvey(surveyId);
    if (aladinInstanceRef.current) {
      try {
        aladinInstanceRef.current.setImageSurvey(surveyId);
      } catch (err) {
        console.warn("Failed to change survey:", err);
      }
    }
  };

  // Handle coordinate frame toggle
  const handleFrameChange = (frame) => {
    setCooFrame(frame);
    if (aladinInstanceRef.current) {
      try {
        aladinInstanceRef.current.setFrame(frame);
      } catch (err) {
        console.warn("Failed to change frame:", err);
      }
    }
  };

  // Handle grid toggle
  const handleToggleGrid = () => {
    const nextState = !showGrid;
    setShowGrid(nextState);
    if (aladinInstanceRef.current && typeof aladinInstanceRef.current.showCooGrid === 'function') {
      try {
        aladinInstanceRef.current.showCooGrid(nextState);
      } catch (err) {
        console.warn("Failed to toggle grid:", err);
      }
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (!aladinInstanceRef.current) return;
    try {
      const fov = aladinInstanceRef.current.getFov();
      const current = Array.isArray(fov) ? fov[0] : fov;
      aladinInstanceRef.current.setFov(Math.max(0.02, current * 0.5));
    } catch (err) {
      console.warn("Zoom in error:", err);
    }
  };

  const handleZoomOut = () => {
    if (!aladinInstanceRef.current) return;
    try {
      const fov = aladinInstanceRef.current.getFov();
      const current = Array.isArray(fov) ? fov[0] : fov;
      aladinInstanceRef.current.setFov(Math.min(180, current * 2.0));
    } catch (err) {
      console.warn("Zoom out error:", err);
    }
  };

  const handleResetAllSky = () => {
    if (!aladinInstanceRef.current) return;
    try {
      aladinInstanceRef.current.gotoRaDec(selectedRa, selectedDec);
      aladinInstanceRef.current.setFov(180);
    } catch (err) {
      console.warn("Reset view error:", err);
    }
  };

  const handleCenterTarget = () => {
    if (!aladinInstanceRef.current) return;
    try {
      aladinInstanceRef.current.gotoRaDec(selectedRa, selectedDec);
      aladinInstanceRef.current.setFov(10);
    } catch (err) {
      console.warn("Center target error:", err);
    }
  };

  // Handle map click: Convert pixel coordinates to celestial RA/Dec & resolve object
  const handleMapClick = async (e) => {
    if (!aladinInstanceRef.current || !mapContainerRef.current) return;
    if (e.target.closest('button') || e.target.closest('.no-map-click')) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    try {
      const coords = aladinInstanceRef.current.pix2world(x, y);
      if (!coords || !Array.isArray(coords) || coords.length < 2 || isNaN(coords[0])) return;

      const [clickedRa, clickedDec] = coords;
      const raVal = parseFloat(clickedRa.toFixed(5));
      const decVal = parseFloat(clickedDec.toFixed(5));

      // Fast check if user clicked close to a challenge target
      for (const t of CHALLENGE_TARGETS) {
        const sep = computeAngularDistanceArcsec(raVal, decVal, t.ra, t.dec);
        // If clicked within 600 arcseconds (10 arcminutes)
        if (sep < 600) {
          if (onSelectTarget) {
            onSelectTarget(t.ra, t.dec, t.name);
          }
          return;
        }
      }

      setIdentifyingClick(true);
      const ident = await api.identifyCoordinates(raVal, decVal, 60.0);
      setIdentifyingClick(false);

      const targetName = (ident && ident.matched)
        ? ident.designation
        : `RA ${raVal.toFixed(4)}°, Dec ${decVal.toFixed(4)}°`;

      setIdentSource(ident ? ident.identification_source : null);

      if (onSelectTarget) {
        onSelectTarget(raVal, decVal, targetName);
      }
    } catch (err) {
      setIdentifyingClick(false);
      console.warn("Map click identification error:", err);
    }
  };

  // Handle map mouse move: Real-time celestial telemetry readout
  const handleMapMouseMove = (e) => {
    if (!aladinInstanceRef.current || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    try {
      const coords = aladinInstanceRef.current.pix2world(x, y);
      if (coords && Array.isArray(coords) && coords.length >= 2 && !isNaN(coords[0])) {
        const gal = raDecToGalactic(coords[0], coords[1]);
        setMouseCoords({
          ra: coords[0],
          dec: coords[1],
          l: gal.l,
          b: gal.b
        });

        // Hover test for challenge targets
        let hit = null;
        for (const t of CHALLENGE_TARGETS) {
          const sep = computeAngularDistanceArcsec(coords[0], coords[1], t.ra, t.dec);
          if (sep < 300) { // within 5 arcminutes
            hit = t;
            break;
          }
        }
        setHoveredChallenge(hit);
      }
    } catch (_) {}
  };

  const selectedGalactic = raDecToGalactic(selectedRa, selectedDec);

  return (
    <div className="relative flex flex-col h-full bg-space-950 rounded-xl border border-space-border overflow-hidden">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-space-900/90 border-b border-space-border text-xs z-10 backdrop-blur-md">
        
        {/* Left: Title & Survey Layer Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>All-Sky Celestial Map</span>
          </span>
          
          <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-[10px] text-cyan-300 border border-cyan-500/30 font-mono hidden sm:inline">
            Aladin Lite HiPS Engine
          </span>

          {/* Survey Layer Selector */}
          <div className="flex items-center gap-1 ml-1 bg-space-950 p-0.5 rounded-lg border border-space-border text-[11px]">
            {SURVEY_OPTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => handleSurveyChange(s.id)}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  currentSurvey === s.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={s.desc}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Coordinate Frame Selector */}
          <div className="flex items-center gap-1 bg-space-950 p-0.5 rounded-lg border border-space-border text-[11px]">
            <button
              onClick={() => handleFrameChange('equatorial')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                cooFrame === 'equatorial'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Equatorial Coordinate Frame (ICRS J2000: Right Ascension / Declination)"
            >
              Equatorial
            </button>
            <button
              onClick={() => handleFrameChange('galactic')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                cooFrame === 'galactic'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Galactic Coordinate Frame (Galactic Longitude l / Latitude b)"
            >
              Galactic
            </button>
          </div>
        </div>

        {/* Right: Switch to Cutout Button */}
        {onSwitchToCutout && (
          <button
            onClick={onSwitchToCutout}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-sm transition-all"
            title="Inspect 0.75 – 5.0 µm SPHEREx Calibrated Level 2 MEF Cutout"
          >
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>Switch to SPHEREx Cutout</span>
          </button>
        )}
      </div>

      {/* 2. Interactive Map Container */}
      <div 
        className="relative flex-1 cursor-crosshair overflow-hidden min-h-[380px]"
        onClick={handleMapClick}
        onMouseMove={handleMapMouseMove}
        onMouseLeave={() => setMouseCoords(null)}
      >
        {/* The DOM element where Aladin Lite renders WebGL2 HiPS tiles */}
        <div 
          id="aladin-sky-map"
          ref={mapContainerRef} 
          className="w-full h-full absolute inset-0"
        />

        {/* Loading Spinner */}
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-space-950/80 z-20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <span className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-cyan-300 font-mono">Streaming HiPS Astronomical Survey Tiles...</span>
              <span className="text-[10px] text-slate-400 font-mono">CDS Strasbourg / IPAC All-Sky Network</span>
            </div>
          </div>
        )}

        {/* Fallback / Offline Notice (Zero fake starfield fabrication) */}
        {initError && (
          <div className="absolute inset-0 flex items-center justify-center bg-space-950/95 z-30 p-6">
            <div className="max-w-md p-5 rounded-2xl bg-space-900 border border-rose-500/40 shadow-2xl text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">HiPS Astronomical Survey Stream Offline</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unable to initialize the WebGL2 astronomical viewer or stream survey tiles from the CDS HiPS repository.
                COSMOSCOPE maintains strict scientific integrity and does not substitute synthetic placeholder stars.
              </p>
              <div className="p-2.5 rounded-lg bg-black/40 border border-space-border text-[11px] font-mono text-rose-300 text-left">
                Error: {initError}
              </div>
              <button
                onClick={initAladin}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Survey Stream Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Map Action Controls (Top-Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20 no-map-click">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-space-950/90 hover:bg-space-850 text-slate-200 hover:text-cyan-300 border border-space-border hover:border-cyan-500/40 shadow-lg backdrop-blur-md transition-all"
            title="Zoom In (Decrease FOV)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-space-950/90 hover:bg-space-850 text-slate-200 hover:text-cyan-300 border border-space-border hover:border-cyan-500/40 shadow-lg backdrop-blur-md transition-all"
            title="Zoom Out (Increase FOV)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleCenterTarget}
            className="p-2 rounded-xl bg-space-950/90 hover:bg-space-850 text-slate-200 hover:text-cyan-300 border border-space-border hover:border-cyan-500/40 shadow-lg backdrop-blur-md transition-all"
            title="Center on Selected Celestial Target"
          >
            <Target className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetAllSky}
            className="p-2 rounded-xl bg-space-950/90 hover:bg-space-850 text-slate-200 hover:text-cyan-300 border border-space-border hover:border-cyan-500/40 shadow-lg backdrop-blur-md transition-all"
            title="Reset to Full All-Sky View (180° FOV)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleGrid}
            className={`p-2 rounded-xl border shadow-lg backdrop-blur-md transition-all ${
              showGrid
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-space-950/90 hover:bg-space-850 text-slate-400 border-space-border'
            }`}
            title="Toggle Celestial Coordinate Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>

        {/* Hovered Target Tooltip (Top-Left) */}
        {hoveredChallenge && (
          <div className="absolute top-3 left-3 pointer-events-none p-3 rounded-xl bg-space-950/95 border border-cyan-500/50 shadow-2xl backdrop-blur-md max-w-xs z-20 animate-in fade-in">
            <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{hoveredChallenge.name}</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-mono">
              RA: {hoveredChallenge.ra.toFixed(4)}° | Dec: {hoveredChallenge.dec.toFixed(4)}°
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Constellation: {hoveredChallenge.constell} • {hoveredChallenge.type}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">
              Click anywhere near marker to load SPHEREx observations
            </div>
          </div>
        )}

        {/* Identifying Click Spinner Overlay */}
        {identifyingClick && (
          <div className="absolute top-3 left-3 p-2 rounded-xl bg-space-950/90 border border-cyan-500/40 text-xs text-cyan-300 flex items-center gap-2 z-20">
            <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Resolving nearest catalogue object...</span>
          </div>
        )}

        {/* 5 NASA Challenge Target Quick Jump Pills (Bottom) */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar z-20 pointer-events-auto no-map-click">
          <span className="text-[10px] font-semibold text-slate-300 bg-space-950/90 px-2 py-1 rounded-lg border border-space-border flex items-center gap-1 whitespace-nowrap backdrop-blur-md">
            <Target className="w-3 h-3 text-cyan-400" />
            <span>5 Targets:</span>
          </span>
          {CHALLENGE_TARGETS.map(t => {
            const isSel = Math.abs(t.ra - selectedRa) < 0.1 && Math.abs(t.dec - selectedDec) < 0.1;
            return (
              <button
                key={t.name}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectTarget) onSelectTarget(t.ra, t.dec, t.name);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all border backdrop-blur-md ${
                  isSel
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'bg-space-950/85 text-slate-300 border-space-border hover:bg-space-850 hover:text-white hover:border-cyan-500/40'
                }`}
              >
                <span>{t.name}</span>
                <span className="text-[9px] text-slate-400 ml-1 opacity-75">({t.badge})</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. Bottom Status Bar: Telemetry & Attribution */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-space-950/95 border-t border-space-border text-[11px] font-mono text-slate-400 z-10">
        
        {/* Left: Selected Object Info */}
        <div className="flex items-center gap-2">
          <span>
            Target: <strong className="text-cyan-300 font-sans">{selectedName}</strong>
          </span>
          <span className="text-slate-500">|</span>
          <span>RA {selectedRa.toFixed(4)}°, Dec {selectedDec.toFixed(4)}°</span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-violet-300 hidden md:inline">
            Gal: l = {selectedGalactic.l.toFixed(2)}°, b = {selectedGalactic.b.toFixed(2)}°
          </span>
        </div>

        {/* Right: Live Mouse Cursor Readout */}
        <div className="flex items-center gap-3">
          {mouseCoords ? (
            <div className="flex items-center gap-2 text-slate-200">
              <span className="text-slate-500">Cursor:</span>
              <span className="text-cyan-300">RA {mouseCoords.ra.toFixed(3)}°, Dec {mouseCoords.dec.toFixed(3)}°</span>
              <span className="text-violet-300 hidden lg:inline">
                (l = {mouseCoords.l.toFixed(2)}°, b = {mouseCoords.b.toFixed(2)}°)
              </span>
            </div>
          ) : (
            <span className="text-slate-500 hidden sm:inline">
              Click anywhere on sky to target coordinates
            </span>
          )}
        </div>

      </div>

    </div>
  );
}
