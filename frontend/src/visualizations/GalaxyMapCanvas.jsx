import React, { useState } from 'react';
import { 
  Sparkles, 
  Eye, 
  Layers, 
  Globe2, 
  Grid, 
  Target,
  Telescope,
  Info
} from 'lucide-react';
import GalaxyOverviewCanvas from './GalaxyOverviewCanvas';
import RealSkySurveyViewer from './RealSkySurveyViewer';

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

export default function GalaxyMapCanvas({
  selectedRa = 269.45208,
  selectedDec = 4.69333,
  selectedName = "Barnard's Star",
  onSelectTarget = null,
  onSwitchToCutout = null
}) {
  // Mode selection: 'overview' (Animated Galaxy) vs 'survey' (Real HiPS Sky Survey)
  const [activeMode, setActiveMode] = useState('overview');

  // Shared View settings across both modes
  const [currentSurvey, setCurrentSurvey] = useState('P/DSS2/color');
  const [cooFrame, setCooFrame] = useState('equatorial'); // 'equatorial' or 'galactic'
  const [showGrid, setShowGrid] = useState(true);

  // Live mouse telemetry from child canvases
  const [mouseCoords, setMouseCoords] = useState(null);

  // Compute Galactic coordinates of the currently active celestial target
  const selectedGalactic = raDecToGalactic(selectedRa, selectedDec);

  return (
    <div className="relative w-full h-full flex flex-col bg-space-950 rounded-xl overflow-hidden border border-space-border/80">
      
      {/* 1. Master Control Header: Mode Toggle + Survey / Coordinate Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-space-900/90 border-b border-space-border/80 z-20 backdrop-blur-md">
        
        {/* Left: Dual Mode Switcher Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-xl bg-space-950 border border-space-border text-xs">
            <button
              onClick={() => setActiveMode('overview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                activeMode === 'overview'
                  ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/25 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Animated Galaxy Overview (Restored Milky Way Visualizer with Target Directions)"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Animated Galaxy Overview</span>
            </button>

            <button
              onClick={() => setActiveMode('survey')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                activeMode === 'survey'
                  ? 'bg-gradient-to-r from-violet-500/25 to-sky-600/25 text-sky-300 border border-sky-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Real Sky Survey (CDS HiPS WebGL2 Deep Multi-Wavelength Imagery)"
            >
              <Telescope className="w-3.5 h-3.5 text-sky-400" />
              <span>Real Sky Survey (HiPS)</span>
            </button>
          </div>

          {/* Mode Scientific Provenance Badge */}
          {activeMode === 'overview' ? (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Milky Way Model</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CDS HiPS Stream</span>
            </span>
          )}
        </div>

        {/* Center / Right: Layer, Coordinate Frame & Grid Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Survey Layer Selector (Active only when in Real Sky Survey mode) */}
          {activeMode === 'survey' && (
            <div className="flex items-center gap-1.5 bg-space-950 px-2 py-1 rounded-lg border border-space-border text-xs">
              <Layers className="w-3 h-3 text-cyan-400 hidden sm:inline" />
              <select
                value={currentSurvey}
                onChange={(e) => setCurrentSurvey(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
                title="Select HiPS Astronomical Survey Layer"
              >
                {SURVEY_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id} className="bg-space-900 text-slate-200">
                    {opt.name} ({opt.wave})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Coordinate Frame Toggle (Equatorial vs Galactic) */}
          <div className="flex items-center p-0.5 rounded-lg bg-space-950 border border-space-border text-xs">
            <button
              onClick={() => setCooFrame('equatorial')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                cooFrame === 'equatorial'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Equatorial Coordinate Frame (Right Ascension / Declination)"
            >
              Equatorial
            </button>
            <button
              onClick={() => setCooFrame('galactic')}
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

          {/* Celestial Grid Toggle */}
          <button
            onClick={() => setShowGrid(g => !g)}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              showGrid
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-space-950 text-slate-400 hover:text-slate-200 border-space-border'
            }`}
            title="Toggle Celestial Coordinate Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Switch to SPHEREx Cutout Button */}
          {onSwitchToCutout && (
            <button
              onClick={onSwitchToCutout}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-sm transition-all"
              title="Inspect 0.75 – 5.0 µm SPHEREx Calibrated Level 2 MEF Cutout"
            >
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>SPHEREx Cutout</span>
            </button>
          )}

        </div>

      </div>

      {/* 2. Interactive Map Viewport (Houses whichever mode is active) */}
      <div className="relative flex-1 min-h-[380px] overflow-hidden">
        
        {activeMode === 'overview' ? (
          /* MODE 1: Animated Galaxy Overview */
          <GalaxyOverviewCanvas
            selectedRa={selectedRa}
            selectedDec={selectedDec}
            selectedName={selectedName}
            onSelectTarget={onSelectTarget}
            cooFrame={cooFrame}
            showGrid={showGrid}
            onHoverCoord={setMouseCoords}
          />
        ) : (
          /* MODE 2: Real Astronomical Sky Survey (HiPS) */
          <RealSkySurveyViewer
            selectedRa={selectedRa}
            selectedDec={selectedDec}
            selectedName={selectedName}
            onSelectTarget={onSelectTarget}
            currentSurvey={currentSurvey}
            cooFrame={cooFrame}
            showGrid={showGrid}
            onHoverCoord={setMouseCoords}
          />
        )}

        {/* 5 NASA Challenge Target Quick Jump Pills (Floating above bottom) */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar z-20 pointer-events-auto">
          <span className="text-[10px] font-semibold text-slate-300 bg-space-950/95 px-2 py-1 rounded-lg border border-space-border flex items-center gap-1 whitespace-nowrap backdrop-blur-md shadow-md">
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
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all border backdrop-blur-md shadow-md ${
                  isSel
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'bg-space-950/90 text-slate-300 border-space-border hover:bg-space-850 hover:text-white hover:border-cyan-500/40'
                }`}
              >
                <span>{t.name}</span>
                <span className="text-[9px] text-slate-400 ml-1 opacity-75">({t.badge})</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. Bottom Status Bar: Object Telemetry, Cursor Readout & Data Source Provenance */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-space-950/95 border-t border-space-border text-[11px] font-mono text-slate-400 z-10">
        
        {/* Left: Active Target Telemetry */}
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

        {/* Right: Live Mouse Cursor Readout + Provenance Label */}
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

          <span className="text-slate-600 hidden xl:inline">|</span>

          {/* Scientific Provenance Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-slate-500">
            <Info className="w-3 h-3 text-slate-400" />
            <span>
              {activeMode === 'overview'
                ? 'Milky Way Galaxy Orientation Model (Visual Reference)'
                : `Authentic CDS HiPS Tile Network • ${SURVEY_OPTIONS.find(s => s.id === currentSurvey)?.name || 'Survey'}`
              }
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
