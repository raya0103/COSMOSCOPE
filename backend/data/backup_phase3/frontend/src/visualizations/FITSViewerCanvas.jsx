import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, ExternalLink, Sparkles, Grid } from 'lucide-react';

export default function FITSViewerCanvas({
  imageData = null,
  title = "FITS Cutout",
  bunit = "MJy / sr",
  detector = 1,
  colormap = "inferno",
  stretch = "asinh",
  blinkImage = null,
  blinkActive = false,
  blinkSpeedMs = 500,
  irsaUrl = null,        // Direct IRSA cutout URL for provenance
  imageShape = null,     // [rows, cols] from FITS header
  fluxRange = null,      // {min, max, median} in MJy/sr
  measuredCentroid = null, // { x, y } in pixel coords (e.g. 14.3, 14.4)
  predictedCentroid = null, // { x, y } in pixel coords from Gaia DR3
  showAstrometry = true,
  provenanceLabel = "● NASA/IPAC IRSA",
  modeBadge = null
}) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverPixel, setHoverPixel] = useState(null);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [renderMode, setRenderMode] = useState('smooth'); // 'smooth' (default, natural star view) or 'pixelated' (raw detector blocks)
  const [blinkState, setBlinkState] = useState(0); // 0 = primary, 1 = secondary

  // Blinking Timer
  useEffect(() => {
    if (!blinkActive || !blinkImage) return;
    const interval = setInterval(() => {
      setBlinkState(prev => (prev === 0 ? 1 : 0));
    }, blinkSpeedMs);
    return () => clearInterval(interval);
  }, [blinkActive, blinkImage, blinkSpeedMs]);

  const activeData = (blinkActive && blinkState === 1 && blinkImage) ? blinkImage : imageData;

  // Render FITS onto canvas with smooth sub-pixel interpolation or raw detector blocks
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeData || activeData.length === 0) return;
    const ctx = canvas.getContext('2d');
    
    const rows = activeData.length;
    const cols = activeData[0].length;
    
    // Target display resolution on canvas
    const targetSize = 440;
    canvas.width  = targetSize;
    canvas.height = targetSize;

    // === Robust Astronomical ZScale Background & Peak Estimation ===
    const allVals = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = activeData[r][c];
        if (v !== null && !isNaN(v) && isFinite(v)) allVals.push(v);
      }
    }
    allVals.sort((a, b) => a - b);
    if (allVals.length === 0) return;

    const median = allVals[Math.floor(allVals.length * 0.5)] ?? 0;
    // Calculate Median Absolute Deviation (MAD) for robust noise estimation
    const absDevs = allVals.map(v => Math.abs(v - median)).sort((a, b) => a - b);
    const mad = absDevs[Math.floor(absDevs.length * 0.5)] || 1e-4;
    const sigma = 1.4826 * mad;
    const maxObs = allVals[allVals.length - 1];

    let minVal, maxVal;
    // Check if an astronomical source is present
    if (maxObs - median > 4.0 * sigma) {
      // Source present: keep background velvety dark and stretch up through peak
      minVal = Math.max(allVals[0], median - 1.0 * sigma);
      maxVal = Math.min(maxObs, median + Math.max(12.0 * sigma, (maxObs - median) * 0.95));
    } else {
      // Faint or diffuse noise field: suppress noisy background fluctuations
      minVal = median - 1.5 * sigma;
      maxVal = median + 5.0 * sigma;
    }
    if (maxVal <= minVal) maxVal = minVal + 1;
    const range = maxVal - minVal;

    // Helper: map raw flux -> RGBA colour tuple [r, g, b]
    const getRGB = (val) => {
      const norm = Math.max(0, Math.min(1, (val - minVal) / range));
      let s = norm;
      if (stretch === 'asinh')     s = Math.asinh(norm * 3) / Math.asinh(3);
      else if (stretch === 'log')  s = Math.log10(1 + norm * 9);
      else if (stretch === 'sqrt') s = Math.sqrt(norm);

      let r, g, b;
      if (colormap === 'inferno') {
        r = Math.min(255, s * 2.5 * 255);
        g = Math.min(255, Math.pow(s, 2) * 220);
        b = Math.min(255, Math.pow(s, 0.5) * 120);
      } else if (colormap === 'viridis') {
        r = Math.min(255, Math.sin(s * Math.PI) * 150);
        g = Math.min(255, s * 255);
        b = Math.min(255, (1 - s) * 200 + s * 100);
      } else if (colormap === 'coolwarm') {
        r = Math.min(255, s * 255);
        g = Math.min(255, (1 - Math.abs(s - 0.5) * 2) * 180);
        b = Math.min(255, (1 - s) * 255);
      } else { // greyscale
        const grey = Math.min(255, Math.max(0, s * 255));
        r = g = b = grey;
      }
      return [Math.round(r), Math.round(g), Math.round(b)];
    };

    // 1. Render raw native matrix to offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = cols;
    offscreen.height = rows;
    const offCtx = offscreen.getContext('2d');
    const imgData = offCtx.createImageData(cols, rows);

    for (let r = 0; r < rows; r++) {
      // FITS convention: row 0 = bottom -> flip vertically for visual display
      const fitsRow = (rows - 1) - r;
      for (let c = 0; c < cols; c++) {
        const val = activeData[fitsRow]?.[c] ?? 0;
        const [red, green, blue] = getRGB(val);
        const idx = (r * cols + c) * 4;
        imgData.data[idx] = red;
        imgData.data[idx + 1] = green;
        imgData.data[idx + 2] = blue;
        imgData.data[idx + 3] = 255;
      }
    }
    offCtx.putImageData(imgData, 0, 0);

    // 2. Render onto display canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (renderMode === 'pixelated') {
      // Raw detector pixel mode: crisp nearest-neighbor blocks
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
    } else {
      // Smooth Sub-Pixel Mode: Multi-stage interpolation (eliminates chunky pixel blocks)
      // Step A: upscale 4x smoothly onto intermediate buffer
      const step1Canvas = document.createElement('canvas');
      step1Canvas.width = cols * 4;
      step1Canvas.height = rows * 4;
      const step1Ctx = step1Canvas.getContext('2d');
      step1Ctx.imageSmoothingEnabled = true;
      step1Ctx.imageSmoothingQuality = 'high';
      step1Ctx.drawImage(offscreen, 0, 0, step1Canvas.width, step1Canvas.height);

      // Step B: upscale from intermediate buffer onto target canvas with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(step1Canvas, 0, 0, canvas.width, canvas.height);
    }
  }, [activeData, colormap, stretch, renderMode]);

  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

  // Mouse interaction for pan and zoom
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
    
    const canvas = canvasRef.current;
    if (canvas && activeData && activeData.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      
      const rows = activeData.length;
      const cols = activeData[0]?.length || 1;
      
      const col = Math.min(cols - 1, Math.max(0, Math.floor((clientX / rect.width) * cols)));
      const canvasRow = Math.min(rows - 1, Math.max(0, Math.floor((clientY / rect.height) * rows)));
      const fitsRow = (rows - 1) - canvasRow;
      const val = activeData[fitsRow]?.[col];
      setHoverPixel({ x: col, y: fitsRow, val });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative flex flex-col h-full bg-space-900 rounded-xl border border-space-border overflow-hidden">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-space-850/80 border-b border-space-border text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-cyan-300">{title}</span>
          <span className="px-1.5 py-0.5 rounded bg-space-800 text-[10px] text-slate-300 border border-space-border">
            Det {detector}
          </span>
          {/* NASA/IRSA Live Data Badge */}
          <span className="px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-semibold">
            {provenanceLabel}
          </span>
          {modeBadge && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
              {modeBadge}
            </span>
          )}
          {imageShape && (
            <span className="text-[10px] text-slate-400 font-mono">{imageShape[1]}×{imageShape[0]}px</span>
          )}
          {blinkActive && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] animate-pulse">
              BLINKING {blinkState === 0 ? "EPOCH 1" : "EPOCH 2"}
            </span>
          )}
        </div>
        
        {/* Controls: Rendering Mode, Zoom, Reticle */}
        <div className="flex items-center gap-1.5">
          {/* Smooth / Pixelated Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-space-950 border border-space-border text-[10px] font-medium mr-1">
            <button
              onClick={() => setRenderMode('smooth')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                renderMode === 'smooth'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Smooth Sub-Pixel View (Natural Telescope Optics)"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Smooth</span>
            </button>
            <button
              onClick={() => setRenderMode('pixelated')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                renderMode === 'pixelated'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Raw Detector Pixel Blocks"
            >
              <Grid className="w-3 h-3" />
              <span>Raw Pixels</span>
            </button>
          </div>

          {irsaUrl && (
            <a
              href={irsaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-space-700 text-blue-400 hover:text-blue-200"
              title="Open original FITS file at NASA/IPAC IRSA"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button 
            onClick={() => setZoom(prev => Math.min(prev * 1.3, 10))}
            className="p-1 rounded hover:bg-space-700 text-slate-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setZoom(prev => Math.max(prev / 1.3, 0.5))}
            className="p-1 rounded hover:bg-space-700 text-slate-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={resetView}
            className="p-1 rounded hover:bg-space-700 text-slate-400 hover:text-white"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setShowCrosshair(prev => !prev)}
            className={`p-1 rounded ${showCrosshair ? 'text-cyan-400 bg-cyan-500/20' : 'text-slate-400 hover:bg-space-700'}`}
            title="Toggle Reticle / Crosshair"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div 
        className="relative flex-1 flex items-center justify-center p-4 overflow-hidden cursor-crosshair bg-black"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="relative inline-block shadow-2xl"
        >
          <canvas 
            ref={canvasRef} 
            className="border border-space-border/50 shadow-lg rounded"
            style={{ 
              imageRendering: renderMode === 'pixelated' ? 'pixelated' : 'auto', 
              display: 'block' 
            }}
          />
          {/* Astrometric Centroid & Gaia DR3 Overlays */}
          {showAstrometry && activeData && activeData.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 440 440">
              {measuredCentroid && (
                <g>
                  {/* Measured Sub-Pixel Centroid: Green Circle & Reticle */}
                  {(() => {
                    const rows = activeData.length;
                    const cols = activeData[0]?.length || 1;
                    const mx = (measuredCentroid.x / cols) * 440;
                    const my = ((rows - 1 - measuredCentroid.y) / rows) * 440;
                    return (
                      <>
                        <circle cx={mx} cy={my} r="9" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.9" />
                        <circle cx={mx} cy={my} r="2" fill="#10b981" />
                        <line x1={mx - 14} y1={my} x2={mx + 14} y2={my} stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />
                        <line x1={mx} y1={my - 14} x2={mx} y2={my + 14} stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />
                        <text x={mx + 12} y={my - 8} fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          Measured Centroid
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}
              {predictedCentroid && (
                <g>
                  {/* Gaia DR3 Predicted Position: Blue/Indigo Diamond */}
                  {(() => {
                    const rows = activeData.length;
                    const cols = activeData[0]?.length || 1;
                    const px = (predictedCentroid.x / cols) * 440;
                    const py = ((rows - 1 - predictedCentroid.y) / rows) * 440;
                    return (
                      <>
                        <polygon 
                          points={`${px},${py - 8} ${px + 8},${py} ${px},${py + 8} ${px - 8},${py}`}
                          stroke="#60a5fa"
                          strokeWidth="2"
                          fill="rgba(96, 165, 250, 0.2)"
                        />
                        <circle cx={px} cy={py} r="1.5" fill="#60a5fa" />
                        <text x={px + 12} y={py + 14} fill="#60a5fa" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          Gaia DR3 Pred
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}
              {/* Scale bar in bottom-left: ~30 arcsec */}
              <g transform="translate(16, 420)">
                <line x1="0" y1="0" x2="35" y2="0" stroke="white" strokeWidth="2" />
                <line x1="0" y1="-4" x2="0" y2="4" stroke="white" strokeWidth="2" />
                <line x1="35" y1="-4" x2="35" y2="4" stroke="white" strokeWidth="2" />
                <text x="0" y="-6" fill="white" fontSize="9" fontFamily="monospace">~30″</text>
              </g>
            </svg>
          )}
          {showCrosshair && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Central Photometry Aperture Ring */}
              <div className="w-8 h-8 border border-cyan-400/70 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
              {/* Precision Reticle Lines */}
              <div className="absolute w-full h-[1px] bg-cyan-400/30" />
              <div className="absolute h-full w-[1px] bg-cyan-400/30" />
            </div>
          )}
        </div>
      </div>

      {/* Pixel Readout Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-space-850/90 border-t border-space-border text-[11px] font-mono text-slate-400">
        <div>
          {hoverPixel ? (
            <span>
              Pixel: <b className="text-cyan-300">({hoverPixel.x}, {hoverPixel.y})</b> | Flux: <b className="text-emerald-400">{hoverPixel.val !== undefined ? hoverPixel.val.toFixed(4) : '--'}</b> {bunit}
            </span>
          ) : fluxRange ? (
            <span>
              SPHEREx FITS: <b className="text-emerald-400">{fluxRange.min?.toFixed(2)}</b> to <b className="text-cyan-300">{fluxRange.max?.toFixed(2)}</b> {bunit} · median <b className="text-blue-300">{fluxRange.median?.toFixed(3)}</b>
            </span>
          ) : (
            <span>Hover cursor over image to inspect pixel values</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Mode: <b className="text-cyan-400">{renderMode === 'smooth' ? 'Smooth Sub-Pixel' : 'Raw Pixels'}</b></span>
          <span className="text-slate-500">Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      </div>

    </div>
  );
}
