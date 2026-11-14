import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Target, 
  Compass, 
  Layers, 
  Grid 
} from 'lucide-react';

import { 
  CELESTIAL_CATALOG, 
  CHALLENGE_TARGETS 
} from '../data/celestialCatalog';

// Helper to convert RA/Dec to Galactic coordinates (l, b)
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

// Helper to convert Galactic coordinates (l, b) to RA/Dec
function galacticToRaDec(lDeg, bDeg) {
  const rad = Math.PI / 180;
  const l = lDeg * rad;
  const b = bDeg * rad;
  const alphaGP = 192.85948 * rad;
  const deltaGP = 27.12825 * rad;
  const l0 = 122.93192 * rad;

  const sinDec = Math.sin(b) * Math.sin(deltaGP) + Math.cos(b) * Math.cos(deltaGP) * Math.cos(l0 - l);
  const dec = Math.asin(Math.max(-1, Math.min(1, sinDec)));

  const y = Math.cos(b) * Math.sin(l0 - l);
  const x = Math.sin(b) * Math.cos(deltaGP) - Math.cos(b) * Math.sin(deltaGP) * Math.cos(l0 - l);
  let ra = alphaGP + Math.atan2(y, x);
  ra = ((ra / rad) % 360 + 360) % 360;

  return { ra, dec: dec / rad };
}

export default function GalaxyOverviewCanvas({
  selectedRa = 269.45208,
  selectedDec = 4.69333,
  selectedName = "Barnard's Star",
  onSelectTarget = null,
  cooFrame = 'equatorial', // 'equatorial' or 'galactic'
  showGrid = true,
  onHoverCoord = null
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const [hoveredTarget, setHoveredTarget] = useState(null);

  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Generate realistic, multi-layered background starfield
  const starsRef = useRef(null);
  if (!starsRef.current) {
    const list = [];
    // 950 realistic background stars with varying magnitudes, sizes and twinkle rates
    for (let i = 0; i < 950; i++) {
      const ra = Math.random() * 360;
      // Normal distribution around galactic plane
      const g = (Math.random() - 0.5) * 180;
      const dec = Math.asin((Math.random() - 0.5) * 2) * (180 / Math.PI);
      const mag = Math.random();
      const baseRadius = mag > 0.92 ? 1.8 : mag > 0.75 ? 1.2 : 0.7;
      const twinkleSpeed = 0.5 + Math.random() * 1.5;
      const twinklePhase = Math.random() * Math.PI * 2;
      const color = mag > 0.9 ? '#E0F2FE' : mag > 0.8 ? '#DDD6FE' : mag > 0.6 ? '#FCE7F3' : '#F8FAFC';
      list.push({ ra, dec, mag, baseRadius, twinkleSpeed, twinklePhase, color });
    }
    starsRef.current = list;
  }

  // Projection logic based on coordinate frame
  const project = useCallback((ra, dec, width, height) => {
    let normX, normY;

    if (cooFrame === 'galactic') {
      const gal = raDecToGalactic(ra, dec);
      normX = 1 - (gal.l / 360);
      normY = 0.5 - (gal.b / 180);
    } else {
      normX = 1 - (ra / 360);
      normY = 0.5 - (dec / 180);
    }

    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const x = centerX + (normX * width - centerX) * zoom + pan.x;
    const y = centerY + (normY * height - centerY) * zoom + pan.y;

    return { x, y };
  }, [cooFrame, zoom, pan]);

  const unproject = useCallback((x, y, width, height) => {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    const unzoomedX = (x - centerX - pan.x) / zoom + centerX;
    const unzoomedY = (y - centerY - pan.y) / zoom + centerY;

    const normX = unzoomedX / width;
    const normY = unzoomedY / height;

    if (cooFrame === 'galactic') {
      const l = ((1 - normX) * 360 + 360) % 360;
      const b = Math.max(-90, Math.min(90, (0.5 - normY) * 180));
      return galacticToRaDec(l, b);
    } else {
      const ra = ((1 - normX) * 360 + 360) % 360;
      const dec = Math.max(-90, Math.min(90, (0.5 - normY) * 180));
      return { ra, dec };
    }
  }, [cooFrame, zoom, pan]);

  // Main render function with animated star twinkling & glowing Milky Way
  const render = useCallback((time = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Deep Space Cosmic Background
    const bgGrad = ctx.createRadialGradient(
      width * 0.5, height * 0.5, 40,
      width * 0.5, height * 0.5, width * 0.75
    );
    bgGrad.addColorStop(0, '#0D1533');
    bgGrad.addColorStop(0.55, '#070D22');
    bgGrad.addColorStop(1, '#030712');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Visible Glowing Milky Way Band
    ctx.save();
    const tSeconds = time * 0.001;

    // Layer A: Outer Diffuse Infrared / Dust Glow
    ctx.lineWidth = 64 * zoom;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    ctx.beginPath();
    for (let r = 0; r <= 360; r += 6) {
      let pt;
      if (cooFrame === 'galactic') {
        pt = project(r, 0, width, height); // Galactic equator is a straight line
      } else {
        const decG = 27.1 * Math.sin((r - 192.8) * Math.PI / 180) * 1.5;
        pt = project(r, decG, width, height);
      }
      if (r === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Layer B: Violet / Magenta Stellar Core Band
    ctx.lineWidth = 28 * zoom;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.09)';
    ctx.stroke();

    // Layer C: Inner Dense Galactic Plane Stream
    ctx.lineWidth = 10 * zoom;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.stroke();
    ctx.restore();

    // 3. Coordinate Grid (RA & Dec or Galactic l, b)
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);

      // Parallels (-60, -30, 0, 30, 60)
      [-60, -30, 0, 30, 60].forEach(d => {
        let pt0, pt1;
        if (cooFrame === 'galactic') {
          pt0 = project(galacticToRaDec(0, d).ra, galacticToRaDec(0, d).dec, width, height);
          pt1 = project(galacticToRaDec(180, d).ra, galacticToRaDec(180, d).dec, width, height);
        } else {
          pt0 = project(0, d, width, height);
          pt1 = project(180, d, width, height);
        }

        ctx.beginPath();
        ctx.moveTo(0, pt0.y);
        ctx.lineTo(width, pt0.y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.font = '9px monospace';
        const label = cooFrame === 'galactic' ? `b = ${d > 0 ? '+' : ''}${d}°` : `Dec ${d > 0 ? '+' : ''}${d}°`;
        ctx.fillText(label, 6, pt0.y - 3);
      });

      // Meridians (0h, 6h, 12h, 18h, 24h)
      [0, 60, 120, 180, 240, 300, 360].forEach(r => {
        let pt;
        if (cooFrame === 'galactic') {
          const eq = galacticToRaDec(r, 0);
          pt = project(eq.ra, eq.dec, width, height);
        } else {
          pt = project(r, 0, width, height);
        }

        ctx.beginPath();
        ctx.moveTo(pt.x, 0);
        ctx.lineTo(pt.x, height);
        ctx.stroke();

        const hours = Math.round(r / 15);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.font = '9px monospace';
        const label = cooFrame === 'galactic' ? `l = ${r}°` : `RA ${hours}h (${r}°)`;
        ctx.fillText(label, pt.x + 4, height - 6);
      });

      // Highlight Celestial / Galactic Equator
      const eqPt = project(180, 0, width, height);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(0, eqPt.y);
      ctx.lineTo(width, eqPt.y);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Smooth Animated Background Stars
    ctx.save();
    starsRef.current.forEach(s => {
      const pt = project(s.ra, s.dec, width, height);
      // Skip offscreen
      if (pt.x < -10 || pt.x > width + 10 || pt.y < -10 || pt.y > height + 10) return;

      const twinkle = Math.sin(tSeconds * s.twinkleSpeed + s.twinklePhase) * 0.35 + 0.65;
      const alpha = (0.2 + s.mag * 0.6) * twinkle;

      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1.0, alpha));
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, s.baseRadius * (zoom > 1.5 ? 1.2 : 1.0), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
    ctx.restore();

    // 5. Galactic Center (Sagittarius A*) Marker
    const sgrA = project(266.417, -29.008, width, height);
    if (sgrA.x >= -30 && sgrA.x <= width + 30 && sgrA.y >= -30 && sgrA.y <= height + 30) {
      ctx.save();
      ctx.fillStyle = 'rgba(251, 146, 60, 0.18)';
      ctx.beginPath();
      ctx.arc(sgrA.x, sgrA.y, 14 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FB923C';
      ctx.beginPath();
      ctx.arc(sgrA.x, sgrA.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '10px Inter, monospace';
      ctx.fillStyle = '#FDBA74';
      ctx.fillText('Galactic Center (Sgr A*)', sgrA.x + 8, sgrA.y - 6);
      ctx.restore();
    }

    // 6. Astronomical Catalog Targets with Visible Markers and Labels
    CELESTIAL_CATALOG.forEach(t => {
      const pt = project(t.ra, t.dec, width, height);
      if (pt.x < -50 || pt.x > width + 50 || pt.y < -50 || pt.y > height + 50) return;

      const isSelected = Math.abs(t.ra - selectedRa) < 0.08 && Math.abs(t.dec - selectedDec) < 0.08;
      const isHovered = hoveredTarget?.name === t.name;

      ctx.save();
      // Outer pulsating ring
      const basePulse = t.isChallengeTarget ? 10 : 7;
      const pulse = isSelected ? Math.sin(tSeconds * 3) * 3 + 15 : isHovered ? 14 : basePulse;
      ctx.fillStyle = t.color + (isSelected ? '45' : isHovered ? '35' : '20');
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pulse, 0, Math.PI * 2);
      ctx.fill();

      // Outer border circle
      ctx.strokeStyle = t.color;
      ctx.lineWidth = isSelected ? 2 : (t.isChallengeTarget ? 1.5 : 1);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isSelected ? 9 : (t.isChallengeTarget ? 6 : 4), 0, Math.PI * 2);
      ctx.stroke();

      // Core point
      ctx.fillStyle = isSelected ? '#FFFFFF' : t.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isSelected ? 4 : (t.isChallengeTarget ? 3 : 2), 0, Math.PI * 2);
      ctx.fill();

      // Target Label
      ctx.font = isSelected ? 'bold 11px Inter, sans-serif' : (t.isChallengeTarget ? '600 10px Inter, sans-serif' : '9px Inter, sans-serif');
      ctx.fillStyle = isSelected ? '#00F0FF' : (t.isChallengeTarget ? '#F1F5F9' : '#CBD5E1');
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(t.name, pt.x + 10, pt.y - 4);
      ctx.restore();
    });

    // 7. Active Coordinates Reticle / Crosshair
    const selPt = project(selectedRa, selectedDec, width, height);
    if (selPt.x >= -50 && selPt.x <= width + 50 && selPt.y >= -50 && selPt.y <= height + 50) {
      ctx.save();
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 1.5;

      // Reticle Circle
      ctx.beginPath();
      ctx.arc(selPt.x, selPt.y, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Reticle Crosshairs
      ctx.beginPath();
      ctx.moveTo(selPt.x - 18, selPt.y);
      ctx.lineTo(selPt.x - 7, selPt.y);
      ctx.moveTo(selPt.x + 7, selPt.y);
      ctx.lineTo(selPt.x + 18, selPt.y);
      ctx.moveTo(selPt.x, selPt.y - 18);
      ctx.lineTo(selPt.x, selPt.y - 7);
      ctx.moveTo(selPt.x, selPt.y + 7);
      ctx.lineTo(selPt.x, selPt.y + 18);
      ctx.stroke();

      // Selected Object Name label if not a challenge target
      const isKnownChallenge = CHALLENGE_TARGETS.some(
        t => Math.abs(t.ra - selectedRa) < 0.08 && Math.abs(t.dec - selectedDec) < 0.08
      );
      if (!isKnownChallenge && selectedName) {
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#38BDF8';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(selectedName, selPt.x + 14, selPt.y - 8);
      }

      ctx.restore();
    }

  }, [cooFrame, showGrid, zoom, pan, selectedRa, selectedDec, selectedName, hoveredTarget, project]);

  // Animation Loop via requestAnimationFrame
  useEffect(() => {
    let active = true;

    const loop = (timestamp) => {
      if (!active) return;
      render(timestamp);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [render]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      render();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  // Mouse Move: Track cursor coordinates and hit-test targets
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Pan if dragging
    if (isDraggingRef.current) {
      setPan({
        x: pan.x + (x - dragStartRef.current.x),
        y: pan.y + (y - dragStartRef.current.y)
      });
      dragStartRef.current = { x, y };
      return;
    }

    const { ra, dec } = unproject(x, y, canvas.width, canvas.height);
    const gal = raDecToGalactic(ra, dec);

    if (onHoverCoord) {
      onHoverCoord({ ra, dec, l: gal.l, b: gal.b });
    }

    // Check hit test on celestial catalog targets
    let hit = null;
    for (const t of CELESTIAL_CATALOG) {
      const pt = project(t.ra, t.dec, canvas.width, canvas.height);
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist < 18) {
        hit = t;
        break;
      }
    }
    setHoveredTarget(hit);
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
      const rect = canvasRef.current.getBoundingClientRect();
      dragStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleMouseUp = (e) => {
    isDraggingRef.current = false;
  };

  // Mouse Click: Select target or pinpoint celestial position
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check hit test on celestial catalog targets
    for (const t of CELESTIAL_CATALOG) {
      const pt = project(t.ra, t.dec, canvas.width, canvas.height);
      if (Math.hypot(pt.x - x, pt.y - y) < 18) {
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

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(6, z * 1.4));
  const handleZoomOut = () => setZoom(z => Math.max(0.7, z / 1.4));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleCenter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pt = project(selectedRa, selectedDec, canvas.width, canvas.height);
    const centerX = canvas.width * 0.5;
    const centerY = canvas.height * 0.5;
    setPan({
      x: pan.x + (centerX - pt.x),
      y: pan.y + (centerY - pt.y)
    });
  };

  return (
    <div className="relative w-full h-full cursor-crosshair overflow-hidden">
      
      {/* 2D Animated Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          isDraggingRef.current = false;
          setHoveredTarget(null);
          if (onHoverCoord) onHoverCoord(null);
        }}
        onClick={handleClick}
        className="w-full h-full block"
      />

      {/* Floating Canvas Controls (Top-Right) */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl bg-space-950/90 hover:bg-space-850 text-slate-200 hover:text-cyan-300 border border-space-border hover:border-cyan-500/40 shadow-lg backdrop-blur-md transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl bg-space-950/90 hover:bg-space-850 text-slate-200 hover:text-cyan-300 border border-space-border hover:border-cyan-500/40 shadow-lg backdrop-blur-md transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleCenter}
          className="p-2 rounded-xl bg-space-950/90 hover:bg-space-850 text-slate-200 hover:text-cyan-300 border border-space-border hover:border-cyan-500/40 shadow-lg backdrop-blur-md transition-all"
          title="Center on Target"
        >
          <Target className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-xl bg-space-950/90 hover:bg-space-850 text-slate-200 hover:text-cyan-300 border border-space-border hover:border-cyan-500/40 shadow-lg backdrop-blur-md transition-all"
          title="Reset Zoom & Pan"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Hovered Target Tooltip (Top-Left) */}
      {hoveredTarget && (
        <div className="absolute top-3 left-3 pointer-events-none p-3 rounded-xl bg-space-950/95 border border-cyan-500/50 shadow-2xl backdrop-blur-md max-w-xs z-20 animate-in fade-in">
          <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{hoveredTarget.name}</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-mono">
            RA: {hoveredTarget.ra.toFixed(4)}° | Dec: {hoveredTarget.dec.toFixed(4)}°
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Constellation: {hoveredTarget.constell} • {hoveredTarget.type}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">
            Click marker to select & load SPHEREx observations
          </div>
        </div>
      )}

    </div>
  );
}
