import React, { useState } from 'react';

const DETECTOR_COLORS = {
  1: '#38BDF8', // D1 - cyan
  2: '#3B82F6', // D2 - blue
  3: '#8B5CF6', // D3 - purple
  4: '#EC4899', // D4 - pink
  5: '#F59E0B', // D5 - amber
  6: '#EF4444', // D6 - red
};

export default function SpectralPlot({
  spectrum = [],
  iceFeatures = {},
  title = "102-Channel Near-Infrared Spectrophotometry"
}) {
  const [hoverPoint, setHoverPoint] = useState(null);
  const [scaleMode, setScaleMode] = useState("linear"); // "linear" or "log"

  if (!spectrum || spectrum.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-space-900 rounded-xl border border-space-border text-slate-500 text-sm">
        No spectral data loaded. Search coordinates or select a target.
      </div>
    );
  }

  // Determine bounds
  const minWave = 0.75;
  const maxWave = 5.0;
  
  const fluxes = spectrum.map(p => p.flux_density_ujy).filter(f => !isNaN(f) && f > 0);
  const minFlux = fluxes.length > 0 ? Math.min(...fluxes) : 1;
  const maxFlux = fluxes.length > 0 ? Math.max(...fluxes) : 100;
  
  const svgWidth = 800;
  const svgHeight = 320;
  const padLeft = 65;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;
  
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const getX = (wave) => padLeft + ((wave - minWave) / Math.max(1e-6, maxWave - minWave)) * plotW;
  
  const getY = (flux) => {
    if (scaleMode === "log") {
      const logMin = Math.log10(Math.max(0.1, minFlux * 0.8));
      const logMax = Math.log10(Math.max(0.11, maxFlux * 1.2));
      const logVal = Math.log10(Math.max(0.1, flux));
      return padTop + plotH - ((logVal - logMin) / Math.max(1e-6, logMax - logMin)) * plotH;
    } else {
      const topFlux = maxFlux * 1.15;
      const btmFlux = Math.max(0, minFlux * 0.85);
      return padTop + plotH - ((flux - btmFlux) / Math.max(1e-6, topFlux - btmFlux)) * plotH;
    }
  };

  // Generate path
  const pathD = spectrum.map((p, idx) => {
    const x = getX(p.wavelength_um);
    const y = getY(p.flux_density_ujy);
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="flex flex-col bg-space-900 rounded-xl border border-space-border p-4">
      
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-[11px] text-slate-400">
              SPHEREx LVF • 0.75–5.00 µm • 6 Detector Arrays
            </p>
            {/* NASA Data Provenance Badge */}
            <span className="px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-semibold">
              ● NASA/IPAC IRSA
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {spectrum.filter(p => p.is_direct_observation).length} real FITS measurements
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              / {spectrum.filter(p => !p.is_direct_observation).length} SED-interpolated
            </span>
          </div>
        </div>
        
        {/* Scale Toggle */}
        <div className="flex items-center gap-1 bg-space-850 p-1 rounded-lg border border-space-border text-xs">
          <button
            onClick={() => setScaleMode("linear")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${scaleMode === 'linear' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            Linear
          </button>
          <button
            onClick={() => setScaleMode("log")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${scaleMode === 'log' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            Log₁₀
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden bg-space-950/80 rounded-lg border border-space-border/60">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
          
          {/* Detector Array Background Shading */}
          <rect x={getX(0.75)} y={padTop} width={getX(1.09) - getX(0.75)} height={plotH} fill="#38BDF8" fillOpacity="0.05" />
          <rect x={getX(1.10)} y={padTop} width={getX(1.62) - getX(1.10)} height={plotH} fill="#3B82F6" fillOpacity="0.05" />
          <rect x={getX(1.63)} y={padTop} width={getX(2.41) - getX(1.63)} height={plotH} fill="#8B5CF6" fillOpacity="0.05" />
          <rect x={getX(2.42)} y={padTop} width={getX(3.82) - getX(2.42)} height={plotH} fill="#EC4899" fillOpacity="0.05" />
          <rect x={getX(3.83)} y={padTop} width={getX(4.41) - getX(3.83)} height={plotH} fill="#F59E0B" fillOpacity="0.05" />
          <rect x={getX(4.42)} y={padTop} width={getX(5.00) - getX(4.42)} height={plotH} fill="#EF4444" fillOpacity="0.05" />

          {/* Grid lines */}
          {[1.0, 2.0, 3.0, 4.0, 5.0].map(w => (
            <g key={w}>
              <line x1={getX(w)} y1={padTop} x2={getX(w)} y2={padTop + plotH} stroke="#1F3366" strokeWidth="1" strokeDasharray="3,3" />
              <text x={getX(w)} y={padTop + plotH + 18} fill="#94A3B8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                {w.toFixed(1)} µm
              </text>
            </g>
          ))}

          {/* Ice Absorption Markers */}
          {/* H2O Ice 3.05 um */}
          <line x1={getX(3.05)} y1={padTop} x2={getX(3.05)} y2={padTop + plotH} stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="4,2" />
          <text x={getX(3.05)} y={padTop + 14} fill="#00F0FF" fontSize="9" textAnchor="middle" fontWeight="bold">
            H₂O Ice (3.05µm)
          </text>
          
          {/* CO2 Ice 4.27 um */}
          <line x1={getX(4.27)} y1={padTop} x2={getX(4.27)} y2={padTop + plotH} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,2" />
          <text x={getX(4.27)} y={padTop + 14} fill="#F59E0B" fontSize="9" textAnchor="middle" fontWeight="bold">
            CO₂ Ice (4.27µm)
          </text>

          {/* Spectrum Trace */}
          <path d={pathD} fill="none" stroke="#38BDF8" strokeWidth="2.5" />

          {/* Data Points */}
          {spectrum.map((p) => {
            const cx = getX(p.wavelength_um);
            const cy = getY(p.flux_density_ujy);
            const col = DETECTOR_COLORS[p.detector] || '#38BDF8';
            return (
              <circle
                key={p.channel_id}
                cx={cx}
                cy={cy}
                r={p.is_direct_observation ? 4 : 2.5}
                fill={p.is_direct_observation ? col : '#070D1E'}
                stroke={col}
                strokeWidth={p.is_direct_observation ? 2 : 1}
                className="cursor-pointer hover:r-6 transition-all"
                onMouseEnter={() => setHoverPoint(p)}
                onMouseLeave={() => setHoverPoint(null)}
              />
            );
          })}

          {/* Y Axis Label */}
          <text 
            x={- (padTop + plotH / 2)} 
            y={18} 
            transform="rotate(-90)" 
            fill="#94A3B8" 
            fontSize="10" 
            textAnchor="middle"
          >
            Flux Density (µJy)
          </text>
        </svg>

        {/* Hover Point Tooltip */}
        {hoverPoint && (
          <div className="absolute top-3 right-3 p-2 rounded-lg bg-space-900/90 border border-cyan-500/40 text-xs shadow-xl backdrop-blur-sm pointer-events-none font-mono">
            <div className="text-cyan-300 font-bold">Channel #{hoverPoint.channel_id} (Det {hoverPoint.detector})</div>
            <div className="text-slate-300">λ: {hoverPoint.wavelength_um.toFixed(3)} µm (Δλ: {hoverPoint.bandwidth_um.toFixed(3)})</div>
            <div className="text-emerald-400 font-semibold">{hoverPoint.flux_density_ujy.toFixed(2)} µJy ({hoverPoint.flux_density_mjy_sr.toFixed(4)} MJy/sr)</div>
            <div className="text-[10px] text-slate-400">
              {hoverPoint.is_direct_observation ? "● Direct IRSA Measurement" : "○ Continuum Modeled"}
            </div>
          </div>
        )}

      </div>

      {/* Detector Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DETECTOR_COLORS[1] }} /> D1 (0.75-1.09)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DETECTOR_COLORS[2] }} /> D2 (1.10-1.62)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DETECTOR_COLORS[3] }} /> D3 (1.63-2.41)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DETECTOR_COLORS[4] }} /> D4 (2.42-3.82)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DETECTOR_COLORS[5] }} /> D5 (3.83-4.41)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DETECTOR_COLORS[6] }} /> D6 (4.42-5.00)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-400 bg-emerald-400" /> ● Real FITS (IRSA)</span>
          <span className="flex items-center gap-1 text-slate-500"><span className="w-2.5 h-2.5 rounded-full border border-slate-400 bg-space-950" /> ○ SED Interpolated</span>
          <span className="text-cyan-400">102 Channels</span>
        </div>
      </div>

    </div>
  );
}
