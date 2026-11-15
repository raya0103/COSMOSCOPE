import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Filter, ChevronDown, ChevronUp, Compass, ArrowRight,
  ExternalLink, Download, AlertTriangle, CheckCircle2, Search,
  Eye, Activity, Layers, FileCheck2
} from 'lucide-react';

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
  const [expandedId, setExpandedId] = useState(null);

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
            const isExpanded = expandedId === cand.candidate_id;
            const isSelected = selectedCandidate?.candidate_id === cand.candidate_id;

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
                      onClick={() => onInvestigate && onInvestigate(cand)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium flex items-center gap-1 transition-all"
                      title="Open full interactive investigation drawer for this source"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Investigate</span>
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : cand.candidate_id)}
                      className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-slate-400 hover:text-white border border-space-border transition-all"
                      title={isExpanded ? "Collapse Details" : "Expand Details & Cutouts"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-space-border/60 space-y-3">
                    
                    {/* Scientific Caveat / Note */}
                    <div className="p-2.5 rounded-lg bg-space-900/90 border border-space-border text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-300 font-semibold">Astrometric Assessment: </span>
                        <span className="text-slate-400">{cand.scientific_caveat}</span>
                      </div>
                    </div>

                    {/* Side-by-Side Epoch Cutouts Strip */}
                    {cand.epoch_stamps && cand.epoch_stamps.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          Multi-Epoch Visual Cutouts (Aligned Centroid Verification):
                        </span>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
                          {cand.epoch_stamps.map((stamp, sIdx) => (
                            <div
                              key={`stamp_${cand.candidate_id}_${sIdx}`}
                              className="flex flex-col items-center p-2 rounded-xl bg-space-900 border border-space-border min-w-[100px]"
                            >
                              <div className="w-16 h-16 rounded overflow-hidden border border-space-border/80 bg-black mb-1.5 relative shadow-inner">
                                <img
                                  src={stamp.thumbnail_base64}
                                  alt={`Epoch ${stamp.epoch_index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {stamp.is_detected && (
                                  <div className="absolute inset-0 border border-cyan-400/60 rounded pointer-events-none" />
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

                    {/* Detailed Properties Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-space-900/60 border border-space-border/60">
                        <span className="text-slate-500 text-[10px] block">Motion Rate:</span>
                        <span className="text-white font-bold">{cand.proper_motion_mas_yr} mas/yr</span>
                        <span className="text-slate-400 text-[10px] block">({cand.angular_motion_rate_arcsec_hr}″/hr)</span>
                      </div>

                      <div className="p-2 rounded-lg bg-space-900/60 border border-space-border/60">
                        <span className="text-slate-500 text-[10px] block">Position Angle:</span>
                        <span className="text-cyan-300 font-bold">{cand.position_angle_deg}°</span>
                        <span className="text-slate-400 text-[10px] block">East of North</span>
                      </div>

                      <div className="p-2 rounded-lg bg-space-900/60 border border-space-border/60">
                        <span className="text-slate-500 text-[10px] block">Gaia DR3 Match:</span>
                        <span className="text-emerald-400 font-bold">
                          {cand.gaia_match ? `${cand.gaia_match.dist_arcsec}″ away` : "No Match (<4″)"}
                        </span>
                        <span className="text-slate-400 text-[10px] block truncate">
                          {cand.gaia_match ? `ID: ${cand.gaia_match.source_id}` : "Uncatalogued Optical"}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-space-900/60 border border-space-border/60">
                        <span className="text-slate-500 text-[10px] block">AllWISE Match:</span>
                        <span className="text-violet-400 font-bold">
                          {cand.allwise_match ? `${cand.allwise_match.dist_arcsec}″ away` : "No Match (<4″)"}
                        </span>
                        <span className="text-slate-400 text-[10px] block truncate">
                          {cand.allwise_match ? cand.allwise_match.designation : "Uncatalogued Infrared"}
                        </span>
                      </div>
                    </div>

                    {/* Quick Downstream Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => navigate(`/explorer?ra=${cand.ra}&dec=${cand.dec}&name=${encodeURIComponent(cand.candidate_id)}`)}
                        className="px-3 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-slate-300 hover:text-white border border-space-border text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Compass className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Open in Sky Explorer</span>
                      </button>

                      <button
                        onClick={() => navigate(`/spectral?ra=${cand.ra}&dec=${cand.dec}&name=${encodeURIComponent(cand.candidate_id)}`)}
                        className="px-3 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-slate-300 hover:text-white border border-space-border text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Activity className="w-3.5 h-3.5 text-pink-400" />
                        <span>Open in Spectral Lab</span>
                      </button>

                      <button
                        onClick={() => navigate(`/dossier?ra=${cand.ra}&dec=${cand.dec}&name=${encodeURIComponent(cand.candidate_id)}`)}
                        className="px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
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
