import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Compass, Activity, FileCheck2, ExternalLink, ShieldCheck, 
  Sparkles, Layers, TrendingUp, Navigation
} from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge';
import PlotlyChart from './PlotlyChart';

export default function SourceInvestigationModal({
  candidate = null,
  onClose = () => {},
  targetName = "Source"
}) {
  const navigate = useNavigate();
  if (!candidate) return null;

  // Build light curve chart data if available
  const lightCurveData = candidate.light_curve && candidate.light_curve.length > 0 ? {
    data: [
      {
        x: candidate.light_curve.map((p, idx) => {
          if (p.date_obs) {
            return p.date_obs.includes('T') ? p.date_obs.split('T')[0] : p.date_obs;
          }
          return `Epoch ${p.epoch_index !== undefined ? p.epoch_index + 1 : idx + 1}`;
        }),
        y: candidate.light_curve.map(p => p.flux),
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
  } : null;

  // Build astrometric trajectory chart if available
  const trajectoryData = candidate.trajectory && candidate.trajectory.length > 0 ? {
    data: [
      {
        x: candidate.trajectory.map(p => p.ra),
        y: candidate.trajectory.map(p => p.dec),
        mode: 'lines+markers+text',
        name: 'Sky Trajectory',
        text: candidate.trajectory.map((p, idx) => `Ep #${p.epoch_index !== undefined ? p.epoch_index + 1 : idx + 1}`),
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
  } : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="astro-card w-full max-w-4xl my-auto rounded-2xl border border-cyan-500/40 p-6 space-y-5 bg-gradient-to-b from-space-900 to-space-950 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-space-border/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">
                  {candidate.candidate_id} Source Investigation
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold text-xs border border-cyan-500/40">
                  {candidate.classification}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical astrometry, light curve time series, and catalogue cross-identifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ProvenanceBadge tier="MEASURED" source="SPHEREx QR2 & Astrometry Engine" size="sm" />
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-400 hover:text-white border border-space-border transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Essential Properties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-space-950 border border-space-border/80">
            <span className="text-[10px] text-slate-500 block">Equatorial (J2000):</span>
            <span className="text-white font-bold block">{candidate.ra?.toFixed(5)}°</span>
            <span className="text-slate-400 text-[10px] block">{candidate.ra_hms}</span>
          </div>
          <div className="p-3 rounded-xl bg-space-950 border border-space-border/80">
            <span className="text-[10px] text-slate-500 block">Declination (J2000):</span>
            <span className="text-white font-bold block">{candidate.dec?.toFixed(5)}°</span>
            <span className="text-slate-400 text-[10px] block">{candidate.dec_dms}</span>
          </div>
          <div className="p-3 rounded-xl bg-space-950 border border-space-border/80">
            <span className="text-[10px] text-slate-500 block">Net Displacement:</span>
            <span className="text-amber-300 font-bold block">{candidate.measured_displacement_arcsec} arcsec</span>
            <span className="text-slate-400 text-[10px] block">{candidate.displacement_px} detector px</span>
          </div>
          <div className="p-3 rounded-xl bg-space-950 border border-space-border/80">
            <span className="text-[10px] text-slate-500 block">Proper Motion Vector:</span>
            <span className="text-cyan-300 font-bold block">{candidate.proper_motion_mas_yr} mas/yr</span>
            <span className="text-slate-400 text-[10px] block">PA {candidate.position_angle_deg}°</span>
          </div>
        </div>

        {/* Cutouts Strip */}
        {candidate.epoch_stamps && candidate.epoch_stamps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Observation Epoch Alignments:
            </h4>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {candidate.epoch_stamps.map((stamp, idx) => (
                <div
                  key={`modal_stamp_${idx}`}
                  className="flex flex-col items-center p-2 rounded-xl bg-space-950 border border-space-border min-w-[110px]"
                >
                  <div className="w-16 h-16 rounded overflow-hidden border border-space-border bg-black mb-1.5 relative">
                    <img
                      src={stamp.thumbnail_base64}
                      alt={`Epoch ${stamp.epoch_index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {stamp.is_detected && (
                      <div className="absolute inset-0 border border-cyan-400/70 rounded" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-300">
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

        {/* Charts: Light Curve & Astrometry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <div className="w-full min-h-[310px] h-[320px] rounded-xl overflow-hidden bg-space-950 border border-space-border/80 flex flex-col">
            {lightCurveData ? (
              <PlotlyChart
                data={lightCurveData.data}
                layout={lightCurveData.layout}
                height={270}
                title="Light Curve — Multi-Epoch Flux Evolution"
                downloadFileName={`cosmoscope_lightcurve_${candidate.candidate_id}`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 font-mono text-xs">
                <Activity className="w-8 h-8 text-pink-400/40 mb-2" />
                <span className="font-semibold text-slate-300">Single-Epoch Transient</span>
                <span className="text-[11px] text-slate-500 mt-1">Multi-epoch flux evolution requires ≥2 observation detections.</span>
              </div>
            )}
          </div>

          <div className="w-full min-h-[310px] h-[320px] rounded-xl overflow-hidden bg-space-950 border border-space-border/80 flex flex-col">
            {trajectoryData ? (
              <PlotlyChart
                data={trajectoryData.data}
                layout={trajectoryData.layout}
                height={270}
                title="Astrometric Trajectory — Sky Coordinate Track"
                downloadFileName={`cosmoscope_trajectory_${candidate.candidate_id}`}
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

        {/* Catalog Identification Information */}
        <div className="p-3.5 rounded-xl bg-space-950 border border-space-border space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-space-border pb-1.5">
            <span className="text-slate-400 font-bold">External Catalogue Cross-Matches:</span>
            <span className="text-cyan-400">Tolerance &lt;4.0″</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <span className="text-[11px] text-emerald-400 font-semibold block">Gaia DR3 (Optical Astrometry):</span>
              {candidate.gaia_match ? (
                <div className="text-slate-300 space-y-0.5">
                  <div>Source ID: <span className="text-white font-bold">{candidate.gaia_match.source_id}</span></div>
                  <div>Offset: {candidate.gaia_match.dist_arcsec}″ | Mag G: {candidate.gaia_match.phot_g_mean_mag || 'N/A'}</div>
                  <div>pmRA: {candidate.gaia_match.pmra?.toFixed(1) || '--'} mas/yr | pmDec: {candidate.gaia_match.pmdec?.toFixed(1) || '--'} mas/yr</div>
                </div>
              ) : (
                <span className="text-slate-500">No Gaia DR3 counterpart within 4.0″ search radius.</span>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-violet-400 font-semibold block">AllWISE (Mid-Infrared):</span>
              {candidate.allwise_match ? (
                <div className="text-slate-300 space-y-0.5">
                  <div>Designation: <span className="text-white font-bold">{candidate.allwise_match.designation}</span></div>
                  <div>Offset: {candidate.allwise_match.dist_arcsec}″</div>
                  <div>W1 (3.4µm): {candidate.allwise_match.w1mag || 'N/A'} mag | W2 (4.6µm): {candidate.allwise_match.w2mag || 'N/A'} mag</div>
                </div>
              ) : (
                <span className="text-slate-500">No AllWISE counterpart within 4.0″ search radius.</span>
              )}
            </div>
          </div>
        </div>

        {/* Scientific Limitation & Caveat */}
        <div className="p-3 rounded-xl bg-space-900/80 border border-space-border text-xs text-slate-400">
          <span className="font-bold text-slate-300">Scientific Caution: </span>
          {candidate.scientific_caveat}
        </div>

        {/* Quick Downstream Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-space-border/60">
          <div className="text-[11px] font-mono text-slate-400">
            Confidence: <span className="text-cyan-300 font-bold">{Math.round((candidate.confidence_score || 0.8) * 100)}%</span> ({candidate.confidence_level})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                navigate(`/explorer?ra=${candidate.ra}&dec=${candidate.dec}&name=${encodeURIComponent(candidate.candidate_id)}`);
              }}
              className="px-3 py-1.5 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 hover:text-white border border-space-border text-xs flex items-center gap-1.5 transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sky Explorer</span>
            </button>

            <button
              onClick={() => {
                onClose();
                navigate(`/spectral?ra=${candidate.ra}&dec=${candidate.dec}&name=${encodeURIComponent(candidate.candidate_id)}`);
              }}
              className="px-3 py-1.5 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 hover:text-white border border-space-border text-xs flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-pink-400" />
              <span>Spectral Lab</span>
            </button>

            <button
              onClick={() => {
                onClose();
                navigate(`/dossier?ra=${candidate.ra}&dec=${candidate.dec}&name=${encodeURIComponent(candidate.candidate_id)}`);
              }}
              className="px-3 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/40 text-violet-200 border border-violet-500/50 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scientific Dossier</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
