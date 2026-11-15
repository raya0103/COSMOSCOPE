import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, MinusCircle, PlusCircle, Sparkles, Sliders, ArrowRight } from 'lucide-react';
import SearchHeader from '../components/SearchHeader';
import FITSViewerCanvas from '../visualizations/FITSViewerCanvas';
import ProvenanceBadge from '../components/ProvenanceBadge';
import { api } from '../services/api';

export default function ImageAnalysisLab() {
  const [searchParams] = useSearchParams();
  const initialRa = searchParams.get('ra') || '76.95642'; // RW Aurigae eruptive variable
  const initialDec = searchParams.get('dec') || '30.40142';
  const initialName = searchParams.get('name') || "RW Aurigae";

  const [loading, setLoading] = useState(false);
  const [observations, setObservations] = useState([]);
  const [obsId1, setObsId1] = useState('');
  const [obsId2, setObsId2] = useState('');
  const [coords, setCoords] = useState({ ra: initialRa, dec: initialDec, name: initialName });
  
  const [fov, setFov] = useState(3.0);
  
  // Image Data
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [operationType, setOperationType] = useState('subtraction'); // 'subtraction' or 'stacking'
  const [metrics, setMetrics] = useState(null);
  const [processing, setProcessing] = useState(false);

  const loadObservations = async (params) => {
    setLoading(true);
    const effFov = params.fov_arcmin !== undefined ? params.fov_arcmin : fov;
    setFov(effFov);
    setCoords({ ra: params.ra, dec: params.dec, name: params.target_name || '' });
    try {
      const res = await api.searchObservations({ ...params, fov_arcmin: effFov });
      if (res.observations && res.observations.length >= 2) {
        setObservations(res.observations);
        setObsId1(res.observations[0].obs_id);
        setObsId2(res.observations[1].obs_id);
        loadSingleFrame(res.observations[0].obs_id, params.ra, params.dec, effFov, setData1);
        loadSingleFrame(res.observations[1].obs_id, params.ra, params.dec, effFov, setData2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSingleFrame = async (obsId, ra, dec, effFov, setter) => {
    try {
      const imgRes = await api.getImageDetails(obsId, ra, dec, effFov);
      setter(imgRes.raw_grid);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadObservations({
      ra: initialRa,
      dec: initialDec,
      target_name: initialName,
      fov_arcmin: fov
    });
  }, []);

  const handleFovChange = (newFov) => {
    setFov(newFov);
    if (obsId1) loadSingleFrame(obsId1, coords.ra, coords.dec, newFov, setData1);
    if (obsId2) loadSingleFrame(obsId2, coords.ra, coords.dec, newFov, setData2);
  };

  const runOperation = async () => {
    if (!obsId1 || !obsId2) return;
    setProcessing(true);
    try {
      if (operationType === 'subtraction') {
        const res = await api.subtractImages({
          obs_id_1: obsId1,
          obs_id_2: obsId2,
          ra: parseFloat(coords.ra),
          dec: parseFloat(coords.dec),
          fov_arcmin: fov,
          normalize: true
        });
        setResultData(res.difference_data);
        setMetrics(res);
      } else {
        const res = await api.stackImages({
          obs_ids: [obsId1, obsId2],
          ra: parseFloat(coords.ra),
          dec: parseFloat(coords.dec),
          fov_arcmin: fov
        });
        setResultData(res.stacked_data);
        setMetrics(res);
      }
    } catch (err) {
      alert(`Processing error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <SearchHeader
        onSearch={loadObservations}
        loading={loading}
        initialRa={initialRa}
        initialDec={initialDec}
        initialName={initialName}
        initialFov={fov}
      />

      {/* Control Banner */}
      <div className="astro-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Epoch Selectors & FOV */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Reference (Epoch 1):</span>
            <select
              value={obsId1}
              onChange={(e) => {
                setObsId1(e.target.value);
                loadSingleFrame(e.target.value, coords.ra, coords.dec, fov, setData1);
              }}
              className="px-3 py-1.5 rounded-xl bg-space-950 border border-space-border text-xs text-cyan-300 font-mono"
            >
              {observations.map((o, idx) => (
                <option key={`${o.obs_id}_D${o.detector || 1}_${idx}`} value={o.obs_id}>
                  {o.obs_id} ({o.energy_bandpassname}) • {o.obs_date_iso.split('T')[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Target (Epoch 2):</span>
            <select
              value={obsId2}
              onChange={(e) => {
                setObsId2(e.target.value);
                loadSingleFrame(e.target.value, coords.ra, coords.dec, fov, setData2);
              }}
              className="px-3 py-1.5 rounded-xl bg-space-950 border border-space-border text-xs text-sky-300 font-mono"
            >
              {observations.map((o, idx) => (
                <option key={`${o.obs_id}_D${o.detector || 1}_${idx}`} value={o.obs_id}>
                  {o.obs_id} ({o.energy_bandpassname}) • {o.obs_date_iso.split('T')[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-950 border border-space-border text-xs">
            <span className="font-semibold text-slate-400 font-mono text-[11px]">FOV:</span>
            <select
              value={fov}
              onChange={(e) => handleFovChange(parseFloat(e.target.value))}
              className="bg-transparent text-xs font-mono text-cyan-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value={1.0} className="bg-space-950 text-white">1.0′</option>
              <option value={3.0} className="bg-space-950 text-white">3.0′</option>
              <option value={6.0} className="bg-space-950 text-white">6.0′</option>
              <option value={15.0} className="bg-space-950 text-white">15.0′</option>
            </select>
          </div>
        </div>

        {/* Operation Mode & Run Action */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-space-950 p-1 border border-space-border text-xs">
            <button
              onClick={() => setOperationType('subtraction')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                operationType === 'subtraction'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MinusCircle className="w-3.5 h-3.5" />
              <span>Image Subtraction (I₂ - I₁)</span>
            </button>
            <button
              onClick={() => setOperationType('stacking')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                operationType === 'stacking'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Image Stacking (Co-addition)</span>
            </button>
          </div>

          <button
            onClick={runOperation}
            disabled={processing}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute {operationType === 'subtraction' ? 'Subtraction' : 'Stacking'}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Tri-View Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Frame 1 */}
        <div className="h-[440px]">
          <FITSViewerCanvas
            imageData={data1}
            title={`Epoch 1 (${obsId1 || '--'})`}
            colormap="inferno"
          />
        </div>

        {/* Frame 2 */}
        <div className="h-[440px]">
          <FITSViewerCanvas
            imageData={data2}
            title={`Epoch 2 (${obsId2 || '--'})`}
            colormap="inferno"
          />
        </div>

        {/* Processed Frame */}
        <div className="h-[440px]">
          <FITSViewerCanvas
            imageData={resultData}
            title={operationType === 'subtraction' ? "Difference Residual (I₂ - I₁)" : "Co-added Stack"}
            colormap={operationType === 'subtraction' ? "coolwarm" : "inferno"}
          />
        </div>

      </div>

      {/* Quantitative Scientific Metrics Banner */}
      {metrics && (
        <div className="astro-card p-5 rounded-2xl border-l-4 border-l-cyan-400 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Scientific Processing Findings</span>
              <ProvenanceBadge 
                tier="CALCULATED" 
                method="Astropy WCS Reprojection & Aperture Subtraction"
                uncertainty={metrics.sigma_noise ? `±${metrics.sigma_noise.toFixed(4)} MJy/sr` : undefined}
                size="sm"
              />
            </h3>
            <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
              {metrics.is_wcs_aligned !== undefined && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                  metrics.is_wcs_aligned 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {metrics.is_wcs_aligned ? `✓ WCS Aligned (Δθ: ${metrics.astrometric_offset_arcsec?.toFixed(2) || '0.00'}″)` : '⚠ Geometric Resampling'}
                </span>
              )}
              {metrics.valid_fraction !== undefined && (
                <span className="text-emerald-400">
                  Valid Area: {(metrics.valid_fraction * 100).toFixed(0)}% ({metrics.valid_pixel_count} px)
                </span>
              )}
              <span className="text-cyan-300">
                Noise floor: {metrics.sigma_noise?.toFixed(4) || metrics.stacked_noise?.toFixed(4)} MJy/sr
              </span>
            </div>
          </div>

          {metrics.wcs_warnings && metrics.wcs_warnings.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono space-y-0.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <span>⚠ Astrometric Alignment Notice:</span>
              </div>
              {metrics.wcs_warnings.map((w, idx) => (
                <div key={idx} className="text-[11px] text-amber-200">• {w}</div>
              ))}
            </div>
          )}

          {metrics.compatibility_status && metrics.compatibility_status !== 'COMPATIBLE' && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs font-mono space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>⚠️ {metrics.compatibility_status}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{metrics.compatibility_notes}</p>
            </div>
          )}

          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            {metrics.explanation}
          </p>

          {operationType === 'subtraction' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono pt-2">
              <div className="p-2 rounded-xl bg-space-950 border border-space-border">
                <div className="text-[10px] text-slate-400">Positive Residuals (&gt;3σ)</div>
                <div className="text-emerald-400 font-bold text-sm">{metrics.pos_residual_pixels} px</div>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-space-border">
                <div className="text-[10px] text-slate-400">Negative Residuals (&lt;-3σ)</div>
                <div className="text-rose-400 font-bold text-sm">{metrics.neg_residual_pixels} px</div>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-space-border">
                <div className="text-[10px] text-slate-400">Max Excursion</div>
                <div className="text-cyan-300 font-bold text-sm">+{metrics.max_positive_residual?.toFixed(3)}</div>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-space-border">
                <div className="text-[10px] text-slate-400">Significant Change?</div>
                <div className={`font-bold text-sm ${metrics.has_significant_change ? 'text-amber-400' : 'text-slate-400'}`}>
                  {metrics.has_significant_change ? "CONFIRMED" : "STATIONARY"}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono pt-2">
              <div className="p-2 rounded-xl bg-space-950 border border-space-border">
                <div className="text-[10px] text-slate-400">Frames Combined</div>
                <div className="text-cyan-400 font-bold text-sm">{metrics.n_frames_combined}</div>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-space-border">
                <div className="text-[10px] text-slate-400">Estimated SNR Gain</div>
                <div className="text-emerald-400 font-bold text-sm">{metrics.snr_gain_factor}×</div>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-space-border">
                <div className="text-[10px] text-slate-400">Noise Reduction</div>
                <div className="text-sky-300 font-bold text-sm">{metrics.noise_reduction_pct}%</div>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-space-border">
                <div className="text-[10px] text-slate-400">Stacking Method</div>
                <div className="text-violet-300 font-bold text-sm">{metrics.method?.toUpperCase()}</div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
