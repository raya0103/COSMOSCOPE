import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Target, 
  Grid, 
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

import { 
  CELESTIAL_CATALOG, 
  CHALLENGE_TARGETS 
} from '../data/celestialCatalog';

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

export default function RealSkySurveyViewer({
  selectedRa = 269.45208,
  selectedDec = 4.69333,
  selectedName = "Barnard's Star",
  onSelectTarget = null,
  currentSurvey = 'P/DSS2/color',
  cooFrame = 'equatorial',
  showGrid = true,
  onHoverCoord = null
}) {
  const mapContainerRef = useRef(null);
  const aladinInstanceRef = useRef(null);
  const challengeCatalogRef = useRef(null);
  const selectedCatalogRef = useRef(null);

  const [aladinReady, setAladinReady] = useState(false);
  const [initError, setInitError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hoveredChallenge, setHoveredChallenge] = useState(null);
  const [identifyingClick, setIdentifyingClick] = useState(false);

  // Initialize Aladin Lite
  const initAladin = useCallback(async () => {
    setIsInitializing(true);
    setInitError(null);

    try {
      const aladinModule = await import('aladin-lite');
      const A = aladinModule.default;
      await A.init;

      if (!mapContainerRef.current) return;

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

      // 1. Add Celestial Catalog Targets (Challenge + Extended)
      const cat = A.catalog({
        name: 'COSMOSCOPE Celestial Objects',
        sourceSize: 18,
        color: '#00F0FF',
        onClick: (marker) => {
          if (marker && marker.data && onSelectTarget) {
            onSelectTarget(marker.data.ra, marker.data.dec, marker.data.name);
          }
        }
      });
      aladin.addCatalog(cat);
      challengeCatalogRef.current = cat;

      CELESTIAL_CATALOG.forEach(t => {
        const marker = A.marker(t.ra, t.dec, {
          popupTitle: t.isChallengeTarget ? `★ ${t.name} (NASA Challenge)` : t.name,
          popupDesc: `<strong>${t.type}</strong><br>Constellation: ${t.constell}<br>RA: ${t.ra.toFixed(4)}°, Dec: ${t.dec.toFixed(4)}°<br>Badge: ${t.badge}`,
          data: t
        });
        cat.addSources([marker]);
      });

      // 2. Add Selected Reticle Layer
      const selCat = A.catalog({
        name: 'Active Target Reticle',
        sourceSize: 22,
        color: '#38BDF8'
      });
      aladin.addCatalog(selCat);
      selectedCatalogRef.current = selCat;

      const selMarker = A.marker(selectedRa, selectedDec, {
        popupTitle: selectedName,
        popupDesc: `Selected: ${selectedName}<br>RA: ${selectedRa.toFixed(4)}°, Dec: ${selectedDec.toFixed(4)}°`
      });
      selCat.addSources([selMarker]);

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

  // Update target position
  useEffect(() => {
    if (!aladinInstanceRef.current || !aladinReady) return;

    try {
      aladinInstanceRef.current.gotoRaDec(selectedRa, selectedDec);

      if (selectedCatalogRef.current) {
        selectedCatalogRef.current.clear();
        import('aladin-lite').then(({ default: A }) => {
          const marker = A.marker(selectedRa, selectedDec, {
            popupTitle: selectedName,
            popupDesc: `Selected: ${selectedName}<br>RA: ${selectedRa.toFixed(4)}°, Dec: ${selectedDec.toFixed(4)}°`
          });
          selectedCatalogRef.current.addSources([marker]);
        });
      }
    } catch (err) {
      console.warn("Failed to update position:", err);
    }
  }, [selectedRa, selectedDec, selectedName, aladinReady]);

  // Survey layer update
  useEffect(() => {
    if (aladinInstanceRef.current && aladinReady) {
      try {
        aladinInstanceRef.current.setImageSurvey(currentSurvey);
      } catch (err) {
        console.warn("Survey switch error:", err);
      }
    }
  }, [currentSurvey, aladinReady]);

  // Coordinate frame update
  useEffect(() => {
    if (aladinInstanceRef.current && aladinReady) {
      try {
        aladinInstanceRef.current.setFrame(cooFrame);
      } catch (err) {
        console.warn("Frame switch error:", err);
      }
    }
  }, [cooFrame, aladinReady]);

  // Grid toggle update
  useEffect(() => {
    if (aladinInstanceRef.current && aladinReady && typeof aladinInstanceRef.current.showCooGrid === 'function') {
      try {
        aladinInstanceRef.current.showCooGrid(showGrid);
      } catch (err) {
        console.warn("Grid toggle error:", err);
      }
    }
  }, [showGrid, aladinReady]);

  // Zoom controls
  const handleZoomIn = () => {
    if (!aladinInstanceRef.current) return;
    try {
      const fov = aladinInstanceRef.current.getFov();
      const current = Array.isArray(fov) ? fov[0] : fov;
      aladinInstanceRef.current.setFov(Math.max(0.02, current * 0.5));
    } catch (_) {}
  };

  const handleZoomOut = () => {
    if (!aladinInstanceRef.current) return;
    try {
      const fov = aladinInstanceRef.current.getFov();
      const current = Array.isArray(fov) ? fov[0] : fov;
      aladinInstanceRef.current.setFov(Math.min(180, current * 2.0));
    } catch (_) {}
  };

  const handleResetAllSky = () => {
    if (!aladinInstanceRef.current) return;
    try {
      aladinInstanceRef.current.gotoRaDec(selectedRa, selectedDec);
      aladinInstanceRef.current.setFov(180);
    } catch (_) {}
  };

  const handleCenterTarget = () => {
    if (!aladinInstanceRef.current) return;
    try {
      aladinInstanceRef.current.gotoRaDec(selectedRa, selectedDec);
      aladinInstanceRef.current.setFov(10);
    } catch (_) {}
  };

  // Map click handler
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

      // Hit-test on 5 challenge targets
      for (const t of CHALLENGE_TARGETS) {
        const sep = computeAngularDistanceArcsec(raVal, decVal, t.ra, t.dec);
        if (sep < 600) { // within 10 arcminutes
          if (onSelectTarget) onSelectTarget(t.ra, t.dec, t.name);
          return;
        }
      }

      setIdentifyingClick(true);
      const ident = await api.identifyCoordinates(raVal, decVal, 60.0);
      setIdentifyingClick(false);

      const targetName = (ident && ident.matched)
        ? ident.designation
        : `RA ${raVal.toFixed(4)}°, Dec ${decVal.toFixed(4)}°`;

      if (onSelectTarget) {
        onSelectTarget(raVal, decVal, targetName);
      }
    } catch (err) {
      setIdentifyingClick(false);
      console.warn("Click error:", err);
    }
  };

  // Mouse move handler
  const handleMapMouseMove = (e) => {
    if (!aladinInstanceRef.current || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    try {
      const coords = aladinInstanceRef.current.pix2world(x, y);
      if (coords && Array.isArray(coords) && coords.length >= 2 && !isNaN(coords[0])) {
        const gal = raDecToGalactic(coords[0], coords[1]);
        if (onHoverCoord) {
          onHoverCoord({ ra: coords[0], dec: coords[1], l: gal.l, b: gal.b });
        }

        let hit = null;
        for (const t of CHALLENGE_TARGETS) {
          const sep = computeAngularDistanceArcsec(coords[0], coords[1], t.ra, t.dec);
          if (sep < 300) {
            hit = t;
            break;
          }
        }
        setHoveredChallenge(hit);
      }
    } catch (_) {}
  };

  return (
    <div 
      className="relative w-full h-full cursor-crosshair overflow-hidden"
      onClick={handleMapClick}
      onMouseMove={handleMapMouseMove}
      onMouseLeave={() => {
        setHoveredChallenge(null);
        if (onHoverCoord) onHoverCoord(null);
      }}
    >
      {/* Aladin Lite WebGL Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full absolute inset-0"
      />

      {/* Loading Overlay */}
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-space-950/80 z-20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <span className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-cyan-300 font-mono">Streaming HiPS Survey Tiles...</span>
            <span className="text-[10px] text-slate-400 font-mono">CDS Strasbourg / IPAC All-Sky Network</span>
          </div>
        </div>
      )}

      {/* Fallback / Offline Notice */}
      {initError && (
        <div className="absolute inset-0 flex items-center justify-center bg-space-950/95 z-30 p-6">
          <div className="max-w-md p-5 rounded-2xl bg-space-900 border border-rose-500/40 shadow-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">HiPS Survey Stream Offline</h3>
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

      {/* Floating Canvas Controls (Top-Right) */}
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
          title="Center on Target"
        >
          <Target className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetAllSky}
          className="p-2 rounded-xl bg-space-950/90 hover:bg-space-850 text-slate-200 hover:text-cyan-300 border border-space-border hover:border-cyan-500/40 shadow-lg backdrop-blur-md transition-all"
          title="Reset to Full All-Sky View (180°)"
        >
          <RotateCcw className="w-4 h-4" />
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
            Click marker to select & load SPHEREx observations
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

    </div>
  );
}
