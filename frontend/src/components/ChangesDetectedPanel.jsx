import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Filter, ChevronDown, ChevronUp, Compass, ArrowRight,
  ExternalLink, Download, AlertTriangle, CheckCircle2, Search,
  Eye, Activity, Layers, FileCheck2, Navigation, ShieldCheck
} from 'lucide-react';
import PlotlyChart from './PlotlyChart';
import ProvenanceBadge from './ProvenanceBadge';

function buildCandidateLightCurve(cand) {
  if (!cand || !cand.light_curve || cand.light_curve.length === 0) return null;
  return {
    data: [
      {
        x: cand.light_curve.map((p, idx) => {
          if (p.date_obs) {
            return p.date_obs.includes('T') ? p.date_obs.split('T')[0] : p.date_obs;
          }
          return `Epoch ${p.epoch_index !== undefined ? p.epoch_index + 1 : idx + 1}`;
        }),
        y: cand.light_curve.map(p => p.flux),
        mode: 'lines+markers',
        name: 'Infrared Flux',
        line: { color: '#ec4899', width: 2.5 },
        marker: { size: 8, color: '#ec4899' },
        hovertemplate: 'Date: %{x}<br>Flux: %{y:.2f} MJy/sr<extra></extra>'
      }
    ],
    layout: {
      xaxis: { title: "Observation Epoch" },
      yaxis: { title: "Surface Brightness (MJy/sr)" },
      margin: { l: 55, r: 20, t: 15, b: 45 }
    }
  };
}

function buildCandidateTrajectory(cand) {
  if (!cand || !cand.trajectory || cand.trajectory.length === 0) return null;
  return {
    data: [
      {
        x: cand.trajectory.map(p => p.ra),
        y: cand.trajectory.map(p => p.dec),
        mode: 'lines+markers+text',
        name: 'Sky Trajectory',
        text: cand.trajectory.map((p, idx) => `Ep #${p.epoch_index !== undefined ? p.epoch_index + 1 : idx + 1}`),
        textposition: 'top center',
        line: { color: '#06b6d4', width: 2, dash: 'dot' },
        marker: { size: 8, color: '#06b6d4' },
        hovertemplate: 'Epoch: %{text}<br>RA: %{x:.5f}°<br>Dec: %{y:.5f}°<extra></extra>'
      }
    ],
    layout: {
      xaxis: { title: "Right Ascension (deg)" },
      yaxis: { title: "Declination (deg)" },
      margin: { l: 60, r: 20, t: 15, b: 45 }
    }
  };
}

export default function ChangesDetectedPanel({
  candidates = [],
  categoryCounts = {},
  selectedCandidate = null,
  onSelectCandidate = null,
  onInvestigate = null,
  loading = false,
  targetName = "Target"
}) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Toggle expansion of candidate investigation panel
  const toggleCandidateExpansion = (candId) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(candId)) {
        next.delete(candId);
      } else {
        next.add(candId);
      }
      return next;
    });
  };

  // Filter candidates according to selected pill tab
  const filteredCandidates = candidates.filter(c => {
    if (activeFilter === 'all') return true;
    return c.category === activeFilter;
  });

  // Handle export to CSV
  const handleExportCSV = () => {
    if (!candidates || candidates.length === 0) return;
    const headers = [
      "Candidate_ID",
      "Classification",
      "Category",
      "RA_deg",
      "Dec_deg",
      "RA_HMS",
      "Dec_DMS",
      "Epochs_Present",
      "Total_Epochs",
      "Displacement_arcsec",
      "Displacement_px",
      "Motion_Rate_mas_yr",
      "Delta_Flux_Pct",
      "Peak_SNR",
      "Gaia_Source_ID",
      "AllWISE_ID",
      "Confidence_Score",
      "Confidence_Level"
    ];

    const rows = candidates.map(c => [
      c.candidate_id,
      `"${c.classification}"`,
      c.category,
      c.ra,
      c.dec,
      `"${c.ra_hms}"`,
      `"${c.dec_dms}"`,
      c.epochs_present_count,
      c.total_epochs,
      c.measured_displacement_arcsec,
      c.displacement_px,
      c.proper_motion_mas_yr,
      c.delta_flux_percent,
      c.peak_snr,
      c.gaia_match ? `"${c.gaia_match.source_id}"` : "NONE",
      c.allwise_match ? `"${c.allwise_match.designation}"` : "NONE",
      c.confidence_score,
      c.confidence_level
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cosmoscope_changes_detected_${targetName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeColor = (category) => {
    switch (category) {
      case 'moving_objects':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'unidentified':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'known_asteroids':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'brightened_dimmed':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'artifacts':
        return 'bg-slate-700/40 text-slate-400 border-slate-600/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="astro-card p-5 rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-space-border/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Automated Astronomical Change Detection</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                {candidates.length} Detected
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cross-epoch multi-frame verification isolating genuine astrophysical changes from pointing drift and detector glitches.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={candidates.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-850 hover:bg-space-800 border border-space-border text-cyan-300 text-xs font-medium transition-all disabled:opacity-50"
          title="Export detection results table as CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            activeFilter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'bg-space-950 text-slate-400 border-space-border hover:bg-space-850'
          }`}
        >
          <span>All Candidates</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-space-900 border border-space-border font-mono">
            {categoryCounts.all || candidates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('moving_objects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            activeFilter === 'moving_objects'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'bg-space-950 text-slate-400 border-space-border hover:bg-space-850'
          }`}
        >
          <span>Moving Objects</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-space-900 border border-space-border font-mono">
            {categoryCounts.moving_objects || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('unidentified')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            activeFilter === 'unidentified'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
              : 'bg-space-950 text-slate-400 border-space-border hover:bg-space-850'
          }`}
        >
          <span>Unidentified Sources</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-space-900 border border-space-border font-mono">
            {categoryCounts.unidentified || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('known_asteroids')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            activeFilter === 'known_asteroids'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-space-950 text-slate-400 border-space-border hover:bg-space-850'
          }`}
        >
          <span>Known Asteroids</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-space-900 border border-space-border font-mono">
            {categoryCounts.known_asteroids || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('brightened_dimmed')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            activeFilter === 'brightened_dimmed'
              ? 'bg-pink-500/20 text-pink-300 border-pink-500/60 shadow-[0_0_12px_rgba(236,72,153,0.25)]'
              : 'bg-space-950 text-slate-400 border-space-border hover:bg-space-850'
          }`}
        >
          <span>Brightened / Dimmed</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-space-900 border border-space-border font-mono">
            {categoryCounts.brightened_dimmed || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('artifacts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            activeFilter === 'artifacts'
              ? 'bg-slate-700/50 text-slate-300 border-slate-500 shadow-md'
              : 'bg-space-950 text-slate-500 border-space-border hover:bg-space-850'
          }`}
        >
          <span>Artifacts / Glitches</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-space-900 border border-space-border font-mono">
            {categoryCounts.artifacts || 0}
          </span>
        </button>
      </div>

      {/* Candidate List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-mono animate-pulse">
            Scanning observation sequence with cross-epoch change detection algorithms...
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs font-mono bg-space-950/60 rounded-xl border border-space-border/60">
            No candidates matched filter "{activeFilter}".
          </div>
        ) : (
          filteredCandidates.map((cand) => {
            const isExpanded = expandedIds.has(cand.candidate_id);
            const isSelected = selectedCandidate?.candidate_id === cand.candidate_id;
            const lightCurveData = isExpanded ? buildCandidateLightCurve(cand) : null;
            const trajectoryData = isExpanded ? buildCandidateTrajectory(cand) : null;
            const hasLightCurve = Boolean(cand.light_curve && cand.light_curve.length > 0);
            const hasTrajectory = Boolean(cand.trajectory && cand.trajectory.length > 0);

            return (
              <div
                key={cand.candidate_id}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-space-950/80 border-space-border hover:border-slate-700'
                }`}
              >
                {/* Summary Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onSelectCandidate && onSelectCandidate(cand)}
                      className="text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-cyan-300 group-hover:underline">
                          {cand.candidate_id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getBadgeColor(cand.category)}`}>
                          {cand.classification}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-space-900 text-slate-400 font-mono">
                          {cand.epochs_present_count}/{cand.total_epochs} epochs
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        RA: {cand.ra.toFixed(5)}° ({cand.ra_hms}) • Dec: {cand.dec.toFixed(5)}° ({cand.dec_dms})
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Metrics preview */}
                    <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Displacement:</span>
                        <span className="text-amber-300 font-semibold">{cand.measured_displacement_arcsec}″ ({cand.displacement_px} px)</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Flux Δ:</span>
                        <span className="text-pink-300 font-semibold">+{cand.delta_flux_percent}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Peak SNR:</span>
                        <span className="text-emerald-300 font-semibold">{cand.peak_snr}σ</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        toggleCandidateExpansion(cand.candidate_id);
                        if (onSelectCandidate) onSelectCandidate(cand);
                        if (onInvestigate) onInvestigate(cand);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        isExpanded
                          ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                          : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
                      }`}
                      title={isExpanded ? "Collapse full investigation report" : "Expand full interactive investigation report"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isExpanded ? "Close Investigation" : "Investigate"}</span>
                    </button>

                    <button
                      onClick={() => toggleCandidateExpansion(cand.candidate_id)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isExpanded
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-space-850 hover:bg-space-800 text-slate-400 hover:text-white border-space-border'
                      }`}
                      title={isExpanded ? "Collapse Details" : "Expand Full Investigation"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Full Investigation Panel — Natural Document Flow */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-space-border/60 space-y-4 animate-fade-in">
                    
                    {/* Header & Quick Identity Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-space-900/90 border border-space-border">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-slate-200 font-mono">
                          {cand.candidate_id} Scientific Investigation Dossier
                        </span>
                      </div>
                      <ProvenanceBadge tier="MEASURED" source="SPHEREx QR2 & Astrometry Engine" size="sm" />
                    </div>

                    {/* Detailed Properties Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-space-900/60 border border-space-border/60">
                        <span className="text-slate-500 text-[10px] block">Motion Rate:</span>
                        <span className="text-white font-bold">{cand.proper_motion_mas_yr} mas/yr</span>
                        <span className="text-slate-400 text-[10px] block">({cand.angular_motion_rate_arcsec_hr}″/hr)</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-space-900/60 border border-space-border/60">
                        <span className="text-slate-500 text-[10px] block">Position Angle:</span>
                        <span className="text-cyan-300 font-bold">{cand.position_angle_deg}°</span>
                        <span className="text-slate-400 text-[10px] block">East of North</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-space-900/60 border border-space-border/60">
                        <span className="text-slate-500 text-[10px] block">Gaia DR3 Match:</span>
                        <span className="text-emerald-400 font-bold">
                          {cand.gaia_match ? `${cand.gaia_match.dist_arcsec}″ away` : "No Match (<4″)"}
                        </span>
                        <span className="text-slate-400 text-[10px] block truncate">
                          {cand.gaia_match ? `ID: ${cand.gaia_match.source_id}` : "Uncatalogued Optical"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-space-900/60 border border-space-border/60">
                        <span className="text-slate-500 text-[10px] block">AllWISE Match:</span>
                        <span className="text-violet-400 font-bold">
                          {cand.allwise_match ? `${cand.allwise_match.dist_arcsec}″ away` : "No Match (<4″)"}
                        </span>
                        <span className="text-slate-400 text-[10px] block truncate">
                          {cand.allwise_match ? cand.allwise_match.designation : "Uncatalogued Infrared"}
                        </span>
                      </div>
                    </div>

                    {/* Side-by-Side Epoch Cutouts Strip */}
                    {cand.epoch_stamps && cand.epoch_stamps.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          Multi-Epoch Visual Cutouts (Aligned Centroid Verification):
                        </span>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
                          {cand.epoch_stamps.map((stamp, sIdx) => (
                            <div
                              key={`stamp_${cand.candidate_id}_${sIdx}`}
                              className="flex flex-col items-center p-2 rounded-xl bg-space-900 border border-space-border min-w-[105px] flex-shrink-0"
                            >
                              <div className="w-16 h-16 rounded overflow-hidden border border-space-border/80 bg-black mb-1.5 relative shadow-inner">
                                <img
                                  src={stamp.thumbnail_base64}
                                  alt={`Epoch ${stamp.epoch_index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {stamp.is_detected && (
                                  <div className="absolute inset-0 border border-cyan-400/70 rounded pointer-events-none" />
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-cyan-300 font-bold">
                                Epoch #{stamp.epoch_index + 1}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400">
                                {stamp.date_obs?.split('T')[0] || '--'}
                              </span>
                              <span className="text-[9px] font-mono text-emerald-400">
                                {stamp.is_detected ? `${stamp.flux.toFixed(1)} MJy/sr` : "Undetected"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Two Independent Scientific Charts: Side-by-Side on Desktop/Laptop, Stacked on Tablet/Mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                      {/* Chart 1: Light Curve — Multi-Epoch Flux Evolution */}
                      <div className="w-full min-h-[310px] h-[320px] rounded-xl overflow-hidden bg-space-950 border border-space-border/80 flex flex-col">
                        {hasLightCurve && lightCurveData ? (
                          <PlotlyChart
                            data={lightCurveData.data}
                            layout={lightCurveData.layout}
                            height={270}
                            title="Light Curve — Multi-Epoch Flux Evolution"
                            downloadFileName={`cosmoscope_lightcurve_${cand.candidate_id}`}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 font-mono text-xs">
                            <Activity className="w-8 h-8 text-pink-400/40 mb-2" />
                            <span className="font-semibold text-slate-300">Single-Epoch Transient</span>
                            <span className="text-[11px] text-slate-500 mt-1">Multi-epoch flux evolution requires ≥2 observation detections.</span>
                          </div>
                        )}
                      </div>

                      {/* Chart 2: Astrometric Trajectory — Sky Coordinate Trajectory (RA vs Dec) */}
                      <div className="w-full min-h-[310px] h-[320px] rounded-xl overflow-hidden bg-space-950 border border-space-border/80 flex flex-col">
                        {hasTrajectory && trajectoryData ? (
                          <PlotlyChart
                            data={trajectoryData.data}
                            layout={trajectoryData.layout}
                            height={270}
                            title="Astrometric Trajectory — Sky Coordinate Track"
                            downloadFileName={`cosmoscope_trajectory_${cand.candidate_id}`}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 font-mono text-xs">
                            <Navigation className="w-8 h-8 text-cyan-400/40 mb-2" />
                            <span className="font-semibold text-slate-300">Single-Epoch Centroid</span>
                            <span className="text-[11px] text-slate-500 mt-1">Proper motion trajectory requires ≥2 observation detections.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Information Section 1: External Catalogue Cross-Matches (Gaia DR3 and AllWISE) */}
                    <div className="p-4 rounded-xl bg-space-950 border border-space-border/80 space-y-3 font-mono text-xs">
                      <div className="flex flex-wrap items-center justify-between border-b border-space-border/60 pb-2">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-cyan-400" />
                          <span className="text-slate-300 font-bold">External Catalogue Cross-Matches</span>
                        </div>
                        <span className="text-[11px] text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                          Search Radius: &lt;4.0″
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {/* Gaia DR3 */}
                        <div className="p-3 rounded-lg bg-space-900/70 border border-space-border/70 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Gaia DR3 (Optical Astrometry)
                            </span>
                            {cand.gaia_match && (
                              <span className="text-[10px] text-emerald-300 font-semibold">{cand.gaia_match.dist_arcsec}″ offset</span>
                            )}
                          </div>
                          {cand.gaia_match ? (
                            <div className="text-slate-300 text-xs space-y-1">
                              <div>Source ID: <span className="text-white font-bold">{cand.gaia_match.source_id}</span></div>
                              <div>G Mag: <span className="text-white">{cand.gaia_match.phot_g_mean_mag || 'N/A'}</span></div>
                              <div>
                                pmRA: <span className="text-cyan-300 font-bold">{cand.gaia_match.pmra !== undefined && cand.gaia_match.pmra !== null ? cand.gaia_match.pmra.toFixed(1) : '--'} mas/yr</span>
                                {' | '}
                                pmDec: <span className="text-cyan-300 font-bold">{cand.gaia_match.pmdec !== undefined && cand.gaia_match.pmdec !== null ? cand.gaia_match.pmdec.toFixed(1) : '--'} mas/yr</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-500 text-xs py-1">
                              No optical Gaia DR3 counterpart within 4.0″. Object is optical-faint or high-obscuration infrared transient.
                            </div>
                          )}
                        </div>

                        {/* AllWISE */}
                        <div className="p-3 rounded-lg bg-space-900/70 border border-space-border/70 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-violet-400 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              AllWISE (Mid-Infrared Baseline)
                            </span>
                            {cand.allwise_match && (
                              <span className="text-[10px] text-violet-300 font-semibold">{cand.allwise_match.dist_arcsec}″ offset</span>
                            )}
                          </div>
                          {cand.allwise_match ? (
                            <div className="text-slate-300 text-xs space-y-1">
                              <div>Designation: <span className="text-white font-bold">{cand.allwise_match.designation}</span></div>
                              <div>W1 (3.4 µm): <span className="text-white">{cand.allwise_match.w1mag || 'N/A'} mag</span></div>
                              <div>W2 (4.6 µm): <span className="text-white">{cand.allwise_match.w2mag || 'N/A'} mag</span></div>
                            </div>
                          ) : (
                            <div className="text-slate-500 text-xs py-1">
                              No AllWISE counterpart within 4.0″. Consistent with newly emerging source or cold substellar object.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Information Section 2: Scientific Caution / Detection Notes */}
                    <div className="p-3.5 rounded-xl bg-space-900/90 border border-amber-500/30 text-xs flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-amber-300 font-bold">Scientific Caution / Astrometric Assessment: </span>
                        <span className="text-slate-300 leading-relaxed">{cand.scientific_caveat}</span>
                      </div>
                    </div>

                    {/* Information Section 3: Confidence Score and Observation Details */}
                    <div className="p-3.5 rounded-xl bg-space-950/90 border border-space-border/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Confidence Score:</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                            {Math.round((cand.confidence_score || 0.8) * 100)}% ({cand.confidence_level})
                          </span>
                        </div>
                        <div className="text-slate-400">
                          Coverage: <span className="text-white font-semibold">{cand.epochs_present_count}/{cand.total_epochs} Epochs</span>
                        </div>
                        <div className="text-slate-400">
                          Peak SNR: <span className="text-emerald-400 font-semibold">{cand.peak_snr}σ</span>
                        </div>
                      </div>

                      <div className="text-slate-400 text-[11px]">
                        Angular Motion: <span className="text-amber-300 font-bold">{cand.proper_motion_mas_yr} mas/yr</span> ({cand.angular_motion_rate_arcsec_hr}″/hr)
                      </div>
                    </div>

                    {/* Information Section 4: Related Navigation Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-space-border/60">
                      <button
                        onClick={() => navigate(`/explorer?ra=${cand.ra}&dec=${cand.dec}&name=${encodeURIComponent(cand.candidate_id)}`)}
                        className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-200 hover:text-white border border-space-border hover:border-cyan-500/40 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                      >
                        <Compass className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Sky Explorer</span>
                      </button>

                      <button
                        onClick={() => navigate(`/spectral?ra=${cand.ra}&dec=${cand.dec}&name=${encodeURIComponent(cand.candidate_id)}`)}
                        className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-200 hover:text-white border border-space-border hover:border-pink-500/40 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                      >
                        <Activity className="w-3.5 h-3.5 text-pink-400" />
                        <span>Spectral Lab</span>
                      </button>

                      <button
                        onClick={() => navigate(`/dossier?ra=${cand.ra}&dec=${cand.dec}&name=${encodeURIComponent(cand.candidate_id)}`)}
                        className="px-3.5 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/40 text-violet-200 hover:text-white border border-violet-500/50 hover:border-violet-400 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Generate Dossier</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
