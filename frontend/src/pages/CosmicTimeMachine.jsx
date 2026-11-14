import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, SkipBack, SkipForward, Clock, Layers, Sparkles, 
  Activity, Compass, ArrowRight, Eye, ShieldCheck, AlertCircle, Info, ExternalLink
} from 'lucide-react';
import SearchHeader from '../components/SearchHeader';
import FITSViewerCanvas from '../visualizations/FITSViewerCanvas';
import PlotlyChart from '../components/PlotlyChart';
import { api } from '../services/api';

export default function CosmicTimeMachine() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialRa = searchParams.get('ra') || '269.45208';
  const initialDec = searchParams.get('dec') || '4.69333';
  const initialName = searchParams.get('name') || "Barnard's Star";
  const initialFov = parseFloat(searchParams.get('fov') || '3.0');

  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ ra: initialRa, dec: initialDec, name: initialName });
  const [fov, setFov] = useState(initialFov);
  
  // Operational Modes: 'spherex' (authentic SPHEREx archive) | 'multimission' (2MASS/WISE/SPHEREx) | 'simulation' (SIMULATED DATA)
  const [activeMode, setActiveMode] = useState('spherex');
  
  // Observations and Epoch series
  const [searchResponse, setSearchResponse] = useState(null);
  const [observations, setObservations] = useState([]);
  const [multiMissionData, setMultiMissionData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeedFps, setPlaybackSpeedFps] = useState(2); // 1, 2, 5 fps
  
  // Blinking mode
  const [isBlinking, setIsBlinking] = useState(false);
  const [blinkSpeedMs, setBlinkSpeedMs] = useState(400);

  // Cached frame images & astrometry
  const [frameDataA, setFrameDataA] = useState(null);
  const [frameDataB, setFrameDataB] = useState(null);
  const [frameMetaA, setFrameMetaA] = useState(null);
  const [frameMetaB, setFrameMetaB] = useState(null);

  // Synchronized Plotly Analytics
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeGraphTab, setActiveGraphTab] = useState('astrometry'); // 'astrometry' | 'displacement' | 'lightcurve'

  // Astrometry overlay toggle
  const [showAstrometryOverlay, setShowAstrometryOverlay] = useState(true);

  // Load observations when mode or coordinates change
  const loadEpochs = async (params, mode = activeMode, targetFov = fov) => {
    setLoading(true);
    const effectiveFov = params.fov_arcmin !== undefined ? parseFloat(params.fov_arcmin) : targetFov;
    setFov(effectiveFov);
    setCoords({ ra: params.ra, dec: params.dec, name: params.target_name || '' });
    try {
      if (mode === 'multimission') {
        const mmRes = await api.getMultiMissionView(params.ra, params.dec, params.target_name);
        setMultiMissionData(mmRes);
        const mappedObs = mmRes.epochs.map(e => ({
          obs_id: e.obs_id,
          energy_bandpassname: e.energy_bandpassname,
          detector: e.is_spherex ? 1 : 0,
          obs_date_iso: e.obs_date_iso,
          t_min_mjd: e.t_min_mjd,
          mission: e.mission,
          survey_facility: e.survey_facility,
          measured_ra_deg: e.measured_ra_deg,
          measured_dec_deg: e.measured_dec_deg,
          displacement_from_t0_arcsec: e.displacement_from_t0_arcsec,
          gaia_predicted_ra_deg: e.gaia_predicted_ra_deg,
          gaia_predicted_dec_deg: e.gaia_predicted_dec_deg,
          residual_arcsec: e.residual_arcsec,
          measured_flux_mjy: e.measured_flux_mjy,
          is_spherex: e.is_spherex,
          provenance_archive: e.provenance_archive
        }));
        setObservations(mappedObs);
        setCurrentIndex(0);
        if (mappedObs.length > 0) {
          loadFrameForEpoch(mappedObs[0], setFrameDataA, setFrameMetaA, params.ra, params.dec, effectiveFov);
          if (mappedObs.length > 1) {
            loadFrameForEpoch(mappedObs[1], setFrameDataB, setFrameMetaB, params.ra, params.dec, effectiveFov);
          }
        }
      } else {
        const res = await api.searchObservations({ ...params, fov_arcmin: effectiveFov });
        setSearchResponse(res);
        if (res.observations && res.observations.length > 0) {
          setObservations(res.observations);
          setCurrentIndex(0);
          loadFrameForEpoch(res.observations[0], setFrameDataA, setFrameMetaA, params.ra, params.dec, effectiveFov);
          if (res.observations.length > 1) {
            loadFrameForEpoch(res.observations[1], setFrameDataB, setFrameMetaB, params.ra, params.dec, effectiveFov);
          }
        } else {
          setObservations([]);
          setFrameDataA(null);
          setFrameDataB(null);
        }
      }

      // Load synchronized Plotly analytics
      const analytics = await api.getTimeMachineAnalytics(params.ra, params.dec, params.target_name, mode);
      setAnalyticsData(analytics);

    } catch (err) {
      console.error("Failed to load time machine data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFrameForEpoch = async (obs, setData, setMeta, ra, dec, currentFov = fov) => {
    try {
      const imgRes = await api.getImageDetails(
        obs.obs_id, 
        ra, 
        dec, 
        currentFov, 
        'asinh', 
        'inferno', 
        obs.detector || 1
      );
      setData(imgRes.raw_grid);
      setMeta(imgRes);
    } catch (err) {
      console.error("Failed to load epoch frame:", err);
    }
  };

  // Handler for explicit FOV change in Time Machine viewport
  const handleFovChange = (newFov) => {
    const parsedFov = parseFloat(newFov);
    setFov(parsedFov);
    if (observations.length > 0 && observations[currentIndex]) {
      loadFrameForEpoch(observations[currentIndex], setFrameDataA, setFrameMetaA, coords.ra, coords.dec, parsedFov);
      const nextIdx = (currentIndex + 1) % observations.length;
      if (observations[nextIdx]) {
        loadFrameForEpoch(observations[nextIdx], setFrameDataB, setFrameMetaB, coords.ra, coords.dec, parsedFov);
      }
    }
  };

  // Initial load
  useEffect(() => {
    loadEpochs({
      ra: initialRa,
      dec: initialDec,
      fov_arcmin: initialFov,
      target_name: initialName
    }, activeMode, initialFov);
  }, [activeMode]);

  // Time-lapse playback effect
  useEffect(() => {
    if (!isPlaying || observations.length === 0 || isBlinking) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % observations.length;
        loadFrameForEpoch(observations[next], setFrameDataA, setFrameMetaA, coords.ra, coords.dec, fov);
        return next;
      });
    }, 1000 / playbackSpeedFps);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeedFps, observations, isBlinking, coords.ra, coords.dec, fov]);

  const currentEpoch = observations[currentIndex];
  const canCompare = activeMode === 'multimission' 
    ? (observations.length > 1) 
    : (searchResponse?.can_compare ?? (observations.length > 1));

  return (
    <div className="space-y-6">
      
      {/* Header Search */}
      <SearchHeader
        onSearch={(p) => loadEpochs(p, activeMode, p.fov_arcmin)}
        loading={loading}
        initialRa={coords.ra}
        initialDec={coords.dec}
        initialName={coords.name}
        initialFov={fov}
      />

      {/* Mode Switcher Banner */}
      <div className="astro-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-cyan-500/20 bg-gradient-to-r from-space-900/90 to-space-850/90">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              COSMOSCOPE Astronomical Time Machine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-semibold border border-cyan-500/30">
                Multi-Epoch Architecture
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive timeline tracking temporal variability, proper motion, and flux changes across survey visits.
            </p>
          </div>
        </div>

        {/* 3 Operational Modes */}
        <div className="flex items-center p-1 rounded-xl bg-space-950 border border-space-border text-xs font-medium">
          <button
            onClick={() => setActiveMode('spherex')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeMode === 'spherex'
                ? 'bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🔭 Authentic SPHEREx</span>
          </button>
          
          <button
            onClick={() => setActiveMode('multimission')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeMode === 'multimission'
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Multi-Mission Historical View (2MASS 1998 → WISE 2010 → SPHEREx 2025)"
          >
            <span>🌐 Multi-Mission (1998-2025)</span>
          </button>

          <button
            onClick={() => setActiveMode('simulation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeMode === 'simulation'
                ? 'bg-amber-600 text-white font-semibold shadow-md shadow-amber-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Scientific Simulation Mode (Clearly labeled SIMULATED DATA)"
          >
            <span>🧪 Simulation Mode</span>
          </button>
        </div>
      </div>

      {/* Comparison Feasibility Notice Banner */}
      {searchResponse?.comparison_note && activeMode === 'spherex' && (
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
          canCompare
            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
            : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
        }`}>
          {canCompare ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="font-bold mr-1">
              {canCompare ? "Multi-Epoch Verification Active:" : "Single-Epoch Coverage Notice:"}
            </span>
            {searchResponse.comparison_note}
            {!canCompare && (
              <button
                onClick={() => setActiveMode('multimission')}
                className="ml-2 font-bold underline hover:text-white transition-colors"
              >
                Switch to Multi-Mission Historical View →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Simulation Watermark Banner when in simulation mode */}
      {activeMode === 'simulation' && (
        <div className="p-3 rounded-xl border border-amber-500/60 bg-amber-500/10 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 font-mono font-bold text-[11px] border border-amber-500/50">
              SIMULATED DATA
            </span>
            <span>Synthesized 6-month survey cadence based on Gaia DR3 astrometric propagation model.</span>
          </div>
          <span className="text-[11px] font-mono text-amber-400">Strictly isolated from NASA Level 2 archive products</span>
        </div>
      )}

      {/* Main Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Canvas Player & Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="astro-card p-5 rounded-2xl flex flex-col min-h-[580px]">
            
            {/* Viewport Status Header with FOV Control */}
            <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-space-border/60 gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  {isBlinking ? "Blink Comparator Mode" : "Interactive Epoch Viewport"}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {/* Dedicated Working FOV Control */}
                <div className="flex items-center gap-1.5 bg-space-950 px-2.5 py-1 rounded-xl border border-cyan-500/30">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] text-slate-400 font-medium">FOV:</span>
                  <select
                    value={fov}
                    onChange={(e) => handleFovChange(e.target.value)}
                    className="bg-transparent text-cyan-300 font-mono text-xs font-semibold focus:outline-none cursor-pointer"
                    title="Change Field of View for Epoch Cutouts"
                  >
                    <option value="1.0" className="bg-space-950 text-slate-200">1.0′ (Deep Core)</option>
                    <option value="3.0" className="bg-space-950 text-slate-200">3.0′ (Standard)</option>
                    <option value="6.0" className="bg-space-950 text-slate-200">6.0′ (Wide Field)</option>
                    <option value="15.0" className="bg-space-950 text-slate-200">15.0′ (Survey Context)</option>
                  </select>
                </div>

                {currentEpoch && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-300 font-semibold">
                      Epoch {currentIndex + 1} of {observations.length}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      • {currentEpoch.obs_date_iso?.split('T')[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative">
              <FITSViewerCanvas
                imageData={frameDataA}
                blinkImage={frameDataB}
                blinkActive={isBlinking}
                blinkSpeedMs={blinkSpeedMs}
                title={currentEpoch ? `${currentEpoch.obs_id} (${currentEpoch.energy_bandpassname})` : "Loading..."}
                detector={currentEpoch?.detector || 1}
                measuredCentroid={frameMetaA?.measured_centroid_px}
                predictedCentroid={frameMetaA?.gaia_predicted_px}
                showAstrometry={showAstrometryOverlay}
                provenanceLabel={
                  activeMode === 'multimission'
                    ? (currentEpoch?.mission || "MULTI-MISSION")
                    : (activeMode === 'simulation' ? "SIMULATED DATA" : "● NASA/IPAC IRSA")
                }
                modeBadge={
                  activeMode === 'simulation' 
                    ? "SIMULATION" 
                    : (currentEpoch?.visit_group ? currentEpoch.visit_group.split(' ')[0] : null)
                }
              />
            </div>

            {/* Playback & Scrubbing Controls */}
            <div className="mt-4 pt-3 border-t border-space-border/60 space-y-3">
              
              {/* Timeline Slider with Active Cursor */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Start: {observations[0]?.obs_date_iso?.split('T')[0] || '--'}</span>
                  <span className="text-cyan-300 font-bold bg-space-950 px-2 py-0.5 rounded border border-cyan-500/30">
                    {currentEpoch?.obs_date_iso?.replace('T', ' ').substring(0, 19) || '--'} UTC
                  </span>
                  <span>End: {observations[observations.length - 1]?.obs_date_iso?.split('T')[0] || '--'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, observations.length - 1)}
                  value={currentIndex}
                  disabled={isBlinking}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setCurrentIndex(idx);
                    loadFrameForEpoch(observations[idx], setFrameDataA, setFrameMetaA, coords.ra, coords.dec, fov);
                  }}
                  className="w-full accent-cyan-400 bg-space-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Action Buttons, Blinking & Speed Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const prev = Math.max(0, currentIndex - 1);
                      setCurrentIndex(prev);
                      loadFrameForEpoch(observations[prev], setFrameDataA, setFrameMetaA, coords.ra, coords.dec, fov);
                    }}
                    className="p-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 border border-space-border transition-colors"
                    title="Previous Epoch"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg transition-all"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? "Pause Time-Lapse" : "Play Sequence"}</span>
                  </button>
                  <button
                    onClick={() => {
                      const next = (currentIndex + 1) % observations.length;
                      setCurrentIndex(next);
                      loadFrameForEpoch(observations[next], setFrameDataA, setFrameMetaA, coords.ra, coords.dec, fov);
                    }}
                    className="p-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 border border-space-border transition-colors"
                    title="Next Epoch"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Blinking & Overlay Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAstrometryOverlay(!showAstrometryOverlay)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      showAstrometryOverlay
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-space-850 text-slate-400 border-space-border'
                    }`}
                    title="Toggle Astrometric Markers (Green: Centroid | Blue: Gaia DR3)"
                  >
                    {showAstrometryOverlay ? "✓ Astrometry Markers" : "Astrometry Markers"}
                  </button>

                  <button
                    onClick={() => setIsBlinking(!isBlinking)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isBlinking 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
                        : 'bg-space-850 text-slate-300 border-space-border hover:bg-space-800'
                    }`}
                  >
                    {isBlinking ? "● Blinking Active" : "Blink Comparator"}
                  </button>

                  {/* Speed Selector */}
                  <select
                    value={isBlinking ? blinkSpeedMs : playbackSpeedFps}
                    onChange={(e) => {
                      if (isBlinking) setBlinkSpeedMs(parseInt(e.target.value));
                      else setPlaybackSpeedFps(parseInt(e.target.value));
                    }}
                    className="px-2 py-1.5 rounded bg-space-950 border border-space-border text-slate-300 text-xs font-mono"
                  >
                    {isBlinking ? (
                      <>
                        <option value="200">200 ms (Fast)</option>
                        <option value="400">400 ms (Standard)</option>
                        <option value="800">800 ms (Slow)</option>
                      </>
                    ) : (
                      <>
                        <option value="1">1 fps</option>
                        <option value="2">2 fps (Standard)</option>
                        <option value="5">5 fps (Fast)</option>
                      </>
                    )}
                  </select>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Epoch Inspector & Science Passport (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Epoch Data Inspector Card */}
          <div className="astro-card p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center justify-between border-b border-space-border pb-2">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                Active Epoch Physical Measurements
              </span>
              <span className="text-cyan-400 font-mono text-[11px]">
                {currentEpoch?.obs_id || 'N/A'}
              </span>
            </h3>

            {currentEpoch ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-space-950/70 border border-space-border/60">
                    <span className="text-slate-400 block text-[10px]">Observation Date:</span>
                    <span className="text-white font-bold">{currentEpoch.obs_date_iso?.substring(0, 19).replace('T', ' ')}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-space-950/70 border border-space-border/60">
                    <span className="text-slate-400 block text-[10px]">MJD (Modified Julian Date):</span>
                    <span className="text-cyan-300 font-bold">{currentEpoch.t_min_mjd ? currentEpoch.t_min_mjd.toFixed(4) : '--'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-space-950/70 border border-space-border/60">
                    <span className="text-slate-400 block text-[10px]">Bandpass & Detector:</span>
                    <span className="text-emerald-300 font-bold">{currentEpoch.energy_bandpassname}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-space-950/70 border border-space-border/60">
                    <span className="text-slate-400 block text-[10px]">Survey Visit / Group:</span>
                    <span className="text-violet-300 font-bold">{currentEpoch.visit_group || currentEpoch.mission || "SPHEREx Survey 1"}</span>
                  </div>
                </div>

                {/* Centroid vs Gaia DR3 */}
                <div className="p-2.5 rounded-xl bg-space-950/90 border border-space-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      Measured Centroid:
                    </span>
                    <span className="text-white">
                      RA: {currentEpoch.measured_ra_deg?.toFixed(5) || coords.ra}°, Dec: {currentEpoch.measured_dec_deg?.toFixed(5) || coords.dec}°
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rotate-45 bg-blue-400 inline-block" />
                      Gaia DR3 Predicted:
                    </span>
                    <span className="text-slate-300">
                      RA: {currentEpoch.gaia_predicted_ra_deg?.toFixed(5) || coords.ra}°, Dec: {currentEpoch.gaia_predicted_dec_deg?.toFixed(5) || coords.dec}°
                    </span>
                  </div>
                  {currentEpoch.displacement_from_t0_arcsec !== undefined && (
                    <div className="flex items-center justify-between pt-1 border-t border-space-border/60 text-[11px]">
                      <span className="text-amber-400 font-bold">Displacement Δθ from t₀:</span>
                      <span className="text-amber-300 font-bold">{currentEpoch.displacement_from_t0_arcsec.toFixed(2)} arcsec</span>
                    </div>
                  )}
                </div>

                {/* Provenance Link */}
                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Data Archive: {currentEpoch.provenance_archive || "NASA/IPAC IRSA"}</span>
                  <a
                    href="https://irsa.ipac.caltech.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                  >
                    <span>IRSA Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>
            ) : (
              <div className="text-slate-400 text-xs py-4 text-center">No observation selected</div>
            )}
          </div>

          {/* Epoch Selector List */}
          <div className="astro-card p-4 rounded-2xl flex flex-col h-[280px]">
            <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
              <span>All Available Observation Epochs</span>
              <span className="text-cyan-400 font-mono text-[11px]">{observations.length} Records</span>
            </h4>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {observations.map((obs, idx) => {
                const isCurrent = currentIndex === idx;
                return (
                  <div
                    key={`${obs.obs_id}_D${obs.detector || 1}_${idx}`}
                    onClick={() => {
                      setCurrentIndex(idx);
                      loadFrameForEpoch(obs, setFrameDataA, setFrameMetaA, coords.ra, coords.dec, fov);
                    }}
                    className={`p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      isCurrent 
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-white font-semibold' 
                        : 'bg-space-850/60 border-space-border hover:bg-space-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-300">
                        #{idx + 1} {obs.mission ? `${obs.mission}: ${obs.obs_id}` : obs.obs_id}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-space-950 text-slate-400 font-mono">
                        {obs.energy_bandpassname}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
                      <span>{obs.obs_date_iso?.replace('T', ' ').substring(0, 19)} UTC</span>
                      {obs.visit_group && (
                        <span className="text-violet-300">{obs.visit_group}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Downstream Actions */}
          <div className="astro-card p-3.5 rounded-2xl flex items-center gap-2">
            <button
              onClick={() => {
                if (observations.length >= 2) {
                  navigate(`/image-lab?obs1=${observations[0].obs_id}&obs2=${observations[1].obs_id}&ra=${coords.ra}&dec=${coords.dec}`);
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-space-850 hover:bg-space-800 border border-space-border text-cyan-300 text-xs font-medium transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Difference Subtraction</span>
            </button>
            <button
              onClick={() => {
                navigate(`/discovery?ra=${coords.ra}&dec=${coords.dec}&name=${encodeURIComponent(coords.name)}`);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-space-850 hover:bg-space-800 border border-space-border text-violet-300 text-xs font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Anomaly Radar</span>
            </button>
          </div>

        </div>

      </div>

      {/* Synchronized Astrometric & Light Curve Scientific Graphs */}
      {analyticsData && (
        <div className="astro-card p-5 rounded-2xl space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-space-border">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Epoch-Linked Astrometric & Photometric Analytics</h3>
                <p className="text-xs text-slate-400">
                  Direct physical measurements tracking coordinates, proper motion displacement, and flux across observation dates.
                </p>
              </div>
            </div>

            {/* Graph Selector Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-space-950 border border-space-border text-xs">
              <button
                onClick={() => setActiveGraphTab('astrometry')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeGraphTab === 'astrometry'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                RA & Dec Coordinates
              </button>
              <button
                onClick={() => setActiveGraphTab('displacement')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeGraphTab === 'displacement'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Displacement Δθ(t)
              </button>
              <button
                onClick={() => setActiveGraphTab('lightcurve')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeGraphTab === 'lightcurve'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Infrared Light Curve
              </button>
            </div>
          </div>

          {/* Active Plotly Chart Display */}
          <div className="h-[360px] w-full">
            {activeGraphTab === 'astrometry' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <PlotlyChart
                  data={analyticsData.charts.ra_vs_time.data}
                  layout={analyticsData.charts.ra_vs_time.layout}
                  className="w-full h-[340px]"
                  title="Right Ascension vs Time"
                  downloadFileName="cosmoscope_ra_vs_time"
                />
                <PlotlyChart
                  data={analyticsData.charts.dec_vs_time.data}
                  layout={analyticsData.charts.dec_vs_time.layout}
                  className="w-full h-[340px]"
                  title="Declination vs Time"
                  downloadFileName="cosmoscope_dec_vs_time"
                />
              </div>
            )}

            {activeGraphTab === 'displacement' && (
              <PlotlyChart
                data={analyticsData.charts.displacement_vs_time.data}
                layout={analyticsData.charts.displacement_vs_time.layout}
                className="w-full h-[340px]"
                title="Cumulative Angular Displacement from Epoch 1"
                downloadFileName="cosmoscope_angular_displacement"
              />
            )}

            {activeGraphTab === 'lightcurve' && (
              <PlotlyChart
                data={analyticsData.charts.light_curve.data}
                layout={analyticsData.charts.light_curve.layout}
                className="w-full h-[340px]"
                title="Multi-Epoch Infrared Light Curve"
                downloadFileName="cosmoscope_light_curve"
              />
            )}
          </div>

        </div>
      )}

    </div>
  );
}
