import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Compass, Sparkles, ZoomIn, ZoomOut, RotateCcw, Target, Eye, ExternalLink } from 'lucide-react';

const CHALLENGE_TARGETS = [
  { name: "Barnard's Star", ra: 269.45208, dec: 4.69333, color: "#00F0FF", type: "High Proper Motion M-Dwarf", constell: "Ophiuchus" },
  { name: "WISE J0855-0714", ra: 133.79513, dec: -7.24515, color: "#38BDF8", type: "Coldest Y-Dwarf (Water Ice)", constell: "Hydra" },
  { name: "Epsilon Indi B", ra: 331.04375, dec: -56.78278, color: "#A855F7", type: "Substellar Binary Brown Dwarf", constell: "Indus" },
  { name: "RW Aurigae", ra: 76.95642, dec: 30.40142, color: "#F59E0B", type: "Eruptive T Tauri Star", constell: "Auriga" },
  { name: "R Draconis", ra: 248.16750, dec: 66.75500, color: "#EC4899", type: "Mira Pulsating Giant Variable", constell: "Draco" },
];

// Helper to convert RA/Dec to Galactic l, b approximation
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
  const canvasRef = useRef(null);
  const [hoveredTarget, setHoveredTarget] = useState(null);
  const [mouseCoord, setMouseCoord] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Generate static background stars for galactic plane
  const starsRef = useRef(null);
  if (!starsRef.current) {
    const list = [];
    for (let i = 0; i < 900; i++) {
      const ra = Math.random() * 360;
      // Weight declination toward galactic belt
      const dec = (Math.random() - 0.5) * 180;
      const mag = Math.random();
      list.push({ ra, dec, mag });
    }
    starsRef.current = list;
  }

  // Projection: Equirectangular / Plate Carree (x: RA 0->360, y: Dec -90->+90)
  const project = useCallback((ra, dec, width, height) => {
    // RA: 0 to 360 (astronomical convention: East to the left -> RA increases right-to-left)
    const normX = 1 - (ra / 360);
    const normY = 0.5 - (dec / 180);
    const x = normX * width;
    const y = normY * height;
    return { x, y };
  }, []);

  const unproject = useCallback((x, y, width, height) => {
    const normX = x / width;
    const normY = y / height;
    const ra = ((1 - normX) * 360 + 360) % 360;
    const dec = (0.5 - normY) * 180;
    return { ra, dec };
  }, []);

  const renderMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Deep Space Cosmic Background
    const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, 40, width * 0.5, height * 0.5, width * 0.7);
    bgGrad.addColorStop(0, '#0C152E');
    bgGrad.addColorStop(0.6, '#070D1E');
    bgGrad.addColorStop(1, '#030712');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Galactic Plane / Milky Way Diffuse Infrared Belt
    ctx.save();
    ctx.lineWidth = 48;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.beginPath();
    for (let r = 0; r <= 360; r += 5) {
      // Approximate galactic plane curve in equatorial coordinates
      const decG = 27.1 * Math.sin((r - 192.8) * Math.PI / 180) * 1.5;
      const pt = project(r, decG, width, height);
      if (r === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    ctx.lineWidth = 18;
    ctx.strokeStyle = 'rgba(157, 78, 221, 0.08)';
    ctx.stroke();
    ctx.restore();

    // 3. Coordinate Grid (RA & Dec Lines)
    ctx.save();
    ctx.strokeStyle = 'rgba(31, 51, 102, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);

    // Declination parallels (-60, -30, 0, 30, 60)
    [-60, -30, 0, 30, 60].forEach(d => {
      const pt = project(180, d, width, height);
      ctx.beginPath();
      ctx.moveTo(0, pt.y);
      ctx.lineTo(width, pt.y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '9px monospace';
      ctx.fillText(`${d > 0 ? '+' : ''}${d}°`, 6, pt.y - 2);
    });

    // RA Meridians (0h, 6h, 12h, 18h, 24h)
    [0, 60, 120, 180, 240, 300, 360].forEach(r => {
      const pt = project(r, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(pt.x, 0);
      ctx.lineTo(pt.x, height);
      ctx.stroke();

      const hours = Math.round(r / 15);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '9px monospace';
      ctx.fillText(`${hours}h (${r}°)`, pt.x + 4, height - 6);
    });

    // Celestial Equator (Dec = 0) highlighted
    const eqPt = project(180, 0, width, height);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, eqPt.y);
    ctx.lineTo(width, eqPt.y);
    ctx.stroke();
    ctx.restore();

    // 4. Background Starfield
    ctx.save();
    starsRef.current.forEach(s => {
      const pt = project(s.ra, s.dec, width, height);
      ctx.fillStyle = `rgba(226, 232, 240, ${0.2 + s.mag * 0.6})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, s.mag > 0.8 ? 1.4 : 0.8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 5. Galactic Center (Sagittarius A* - Sgr A*) Marker
    const sgrA = project(266.417, -29.008, width, height);
    ctx.save();
    ctx.fillStyle = 'rgba(251, 146, 60, 0.2)';
    ctx.beginPath();
    ctx.arc(sgrA.x, sgrA.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FB923C';
    ctx.beginPath();
    ctx.arc(sgrA.x, sgrA.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '10px monospace';
    ctx.fillStyle = '#FDBA74';
    ctx.fillText('Galactic Center (Sgr A*)', sgrA.x + 6, sgrA.y - 6);
    ctx.restore();

    // 6. Draw 5 NASA Challenge Targets
    CHALLENGE_TARGETS.forEach(t => {
      const pt = project(t.ra, t.dec, width, height);
      const isSelected = Math.abs(t.ra - selectedRa) < 0.1 && Math.abs(t.dec - selectedDec) < 0.1;
      const isHovered = hoveredTarget?.name === t.name;

      ctx.save();
      // Outer glow pulse
      ctx.fillStyle = t.color + (isSelected || isHovered ? '40' : '20');
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isSelected || isHovered ? 12 : 7, 0, Math.PI * 2);
      ctx.fill();

      // Core point
      ctx.fillStyle = isSelected ? '#FFFFFF' : t.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isSelected ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = isSelected ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
      ctx.fillStyle = isSelected ? '#00F0FF' : '#E2E8F0';
      ctx.fillText(t.name, pt.x + 8, pt.y - 4);
      ctx.restore();
    });

    // 7. Draw Currently Selected Coordinates Crosshair
    const selPt = project(selectedRa, selectedDec, width, height);
    ctx.save();
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.5;
    // Reticle circle
    ctx.beginPath();
    ctx.arc(selPt.x, selPt.y, 14, 0, Math.PI * 2);
    ctx.stroke();

    // Reticle cross lines
    ctx.beginPath();
    ctx.moveTo(selPt.x - 18, selPt.y);
    ctx.lineTo(selPt.x - 8, selPt.y);
    ctx.moveTo(selPt.x + 8, selPt.y);
    ctx.lineTo(selPt.x + 18, selPt.y);
    ctx.moveTo(selPt.x, selPt.y - 18);
    ctx.lineTo(selPt.x, selPt.y - 8);
    ctx.moveTo(selPt.x, selPt.y + 8);
    ctx.lineTo(selPt.x, selPt.y + 18);
    ctx.stroke();
    ctx.restore();

  }, [selectedRa, selectedDec, hoveredTarget, project]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.parentElement.clientWidth || 640;
    canvas.height = 420;
    renderMap();
  }, [renderMap]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.parentElement.clientWidth || 640;
      canvas.height = 420;
      renderMap();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderMap]);

  // Mouse Move: Detect hover on targets and track celestial coordinates
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { ra, dec } = unproject(x, y, canvas.width, canvas.height);
    const gal = raDecToGalactic(ra, dec);
    setMouseCoord({ ra, dec, l: gal.l, b: gal.b });

    // Check hit test on 5 challenge targets
    let hit = null;
    for (const t of CHALLENGE_TARGETS) {
      const pt = project(t.ra, t.dec, canvas.width, canvas.height);
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist < 15) {
        hit = t;
        break;
      }
    }
    setHoveredTarget(hit);
  };

  // Mouse Click: Select target or pinpoint celestial position
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked an existing challenge target
    for (const t of CHALLENGE_TARGETS) {
      const pt = project(t.ra, t.dec, canvas.width, canvas.height);
      if (Math.hypot(pt.x - x, pt.y - y) < 15) {
        if (onSelectTarget) onSelectTarget(t.ra, t.dec, t.name);
        return;
      }
    }

    // Otherwise select the clicked celestial coordinates
    const { ra, dec } = unproject(x, y, canvas.width, canvas.height);
    if (onSelectTarget) {
      onSelectTarget(parseFloat(ra.toFixed(5)), parseFloat(dec.toFixed(5)), `RA ${ra.toFixed(2)}°, Dec ${dec.toFixed(2)}°`);
    }
  };

  const selectedGalactic = raDecToGalactic(selectedRa, selectedDec);

  return (
    <div className="relative flex flex-col h-full bg-space-900 rounded-xl border border-space-border overflow-hidden">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-space-850/80 border-b border-space-border text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>All-Sky Celestial & Galactic Map</span>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-space-800 text-[10px] text-slate-300 border border-space-border">
            Equatorial & Galactic View
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            Click anywhere on galaxy to target
          </span>
        </div>

        {onSwitchToCutout && (
          <button
            onClick={onSwitchToCutout}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-sm transition-all"
          >
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>Zoom to SPHEREx Cutout</span>
          </button>
        )}
      </div>

      {/* Interactive Map Area */}
      <div className="relative flex-1 cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoveredTarget(null); setMouseCoord(null); }}
          onClick={handleClick}
          className="w-full h-full block"
        />

        {/* Hover Target Tooltip */}
        {hoveredTarget && (
          <div className="absolute top-3 left-3 pointer-events-none p-3 rounded-xl bg-space-950/95 border border-cyan-500/40 shadow-xl backdrop-blur-md max-w-xs animate-in fade-in">
            <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{hoveredTarget.name}</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-mono">
              RA: {hoveredTarget.ra.toFixed(4)}° | Dec: {hoveredTarget.dec.toFixed(4)}°
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
              Constellation: {hoveredTarget.constell} • {hoveredTarget.type}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">
              Click to select & inspect observations
            </div>
          </div>
        )}

        {/* Challenge Target Quick Jump Pills at bottom */}
        <div className="absolute bottom-10 left-3 right-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto">
          <span className="text-[10px] font-semibold text-slate-300 bg-space-950/90 px-2 py-1 rounded-lg border border-space-border flex items-center gap-1 whitespace-nowrap">
            <Target className="w-3 h-3 text-cyan-400" />
            <span>5 Targets:</span>
          </span>
          {CHALLENGE_TARGETS.map(t => {
            const isSel = Math.abs(t.ra - selectedRa) < 0.1 && Math.abs(t.dec - selectedDec) < 0.1;
            return (
              <button
                key={t.name}
                onClick={() => onSelectTarget && onSelectTarget(t.ra, t.dec, t.name)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all border ${
                  isSel
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-semibold shadow-sm'
                    : 'bg-space-950/80 text-slate-300 border-space-border hover:bg-space-850 hover:text-white'
                }`}
              >
                {t.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Bar: Coordinates Readout */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-space-950/90 border-t border-space-border text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Selected: <strong className="text-cyan-300">{selectedName}</strong> (RA: {selectedRa.toFixed(4)}°, Dec: {selectedDec.toFixed(4)}°)
          </span>
          <span className="text-slate-500">|</span>
          <span className="hidden md:inline">
            Galactic: <span className="text-violet-300">l = {selectedGalactic.l.toFixed(2)}°, b = {selectedGalactic.b.toFixed(2)}°</span>
          </span>
        </div>

        {mouseCoord && (
          <div className="hidden sm:flex items-center gap-2 text-slate-300">
            <span>Cursor: RA {mouseCoord.ra.toFixed(1)}°, Dec {mouseCoord.dec.toFixed(1)}°</span>
          </div>
        )}
      </div>

    </div>
  );
}
