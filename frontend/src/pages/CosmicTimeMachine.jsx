import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, SkipBack, SkipForward, Clock, Layers, Sparkles, 
  Activity, Compass, ArrowRight, Eye, ShieldCheck, AlertCircle, Info, 
  ExternalLink, FileCheck2, Video, Download, Repeat, RotateCcw, 
  Filter, Calendar, Camera
} from 'lucide-react';
import SearchHeader from '../components/SearchHeader';
import FITSViewerCanvas from '../visualizations/FITSViewerCanvas';
import PlotlyChart from '../components/PlotlyChart';
import ProvenanceBadge from '../components/ProvenanceBadge';
import ChangesDetectedPanel from '../components/ChangesDetectedPanel';
import SourceInvestigationModal from '../components/SourceInvestigationModal';
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

  // 4 Astronomical Image Comparison Modes:
  // 'timelapse' (single frame sequential) | 'blink' | 'difference' | 'stack' | 'motion'
  const [comparisonMode, setComparisonMode] = useState('timelapse');
  
  // Observations and Epoch series
  const [searchResponse, setSearchResponse] = useState(null);
  const [observations, setObservations] = useState([]);
  const [multiMissionData, setMultiMissionData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeedFps, setPlaybackSpeedFps] = useState(2); // 1, 2, 5, 10 fps
  const [isLooping, setIsLooping] = useState(true);
  
  // Blinking mode speed
  const [blinkSpeedMs, setBlinkSpeedMs] = useState(400);

  // Cached frame images & astrometry
  const [frameDataA, setFrameDataA] = useState(null);
  const [frameDataB, setFrameDataB] = useState(null);
  const [frameMetaA, setFrameMetaA] = useState(null);
  const [frameMetaB, setFrameMetaB] = useState(null);

  // Difference and Stack mode results
  const [differenceResult, setDifferenceResult] = useState(null);
  const [stackResult, setStackResult] = useState(null);
  const [diffStackLoading, setDiffStackLoading] = useState(false);

  // Automatic Change Detection state
  const [changeDetectionResult, setChangeDetectionResult] = useState(null);
  const [changeDetectionLoading, setChangeDetectionLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [investigatingCandidate, setInvestigatingCandidate] = useState(null);

  // Video recording state
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const canvasDomRef = useRef(null);

  // Synchronized Plotly Analytics
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeGraphTab, setActiveGraphTab] = useState('astrometry'); // 'astrometry' | 'displacement' | 'lightcurve'

  // Astrometry overlay toggle
  const [showAstrometryOverlay, setShowAstrometryOverlay] = useState(true);

  // Load frame for an epoch
  const loadFrameForEpoch = useCallback(async (obs, setData, setMeta, ra, dec, currentFov = fov) => {
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
  }, [fov]);

  // Load observations when mode or coordinates change
  const loadEpochs = async (params, mode = activeMode, targetFov = fov) => {
    setLoading(true);
    const effectiveFov = params.fov_arcmin !== undefined ? parseFloat(params.fov_arcmin) : targetFov;
    setFov(effectiveFov);
    setCoords({ ra: params.ra, dec: params.dec, name: params.target_name || '' });
    setSelectedCandidate(null);
    setDifferenceResult(null);
    setStackResult(null);

    try {
      let loadedObs = [];

      if (mode === 'multimission') {
        const mmRes = await api.getMultiMissionView(params.ra, params.dec, params.target_name);
        setMultiMissionData(mmRes);
        loadedObs = mmRes.epochs.map(e => ({
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
        setObservations(loadedObs);
        setCurrentIndex(0);
        if (loadedObs.length > 0) {
          loadFrameForEpoch(loadedObs[0], setFrameDataA, setFrameMetaA, params.ra, params.dec, effectiveFov);
          if (loadedObs.length > 1) {
            loadFrameForEpoch(loadedObs[1], setFrameDataB, setFrameMetaB, params.ra, params.dec, effectiveFov);
          }
        }
      } else {
        const res = await api.searchObservations({ ...params, fov_arcmin: effectiveFov });
        setSearchResponse(res);
        if (res.observations && res.observations.length > 0) {
          loadedObs = res.observations;
          setObservations(loadedObs);
          setCurrentIndex(0);
          loadFrameForEpoch(loadedObs[0], setFrameDataA, setFrameMetaA, params.ra, params.dec, effectiveFov);
          if (loadedObs.length > 1) {
            loadFrameForEpoch(loadedObs[1], setFrameDataB, setFrameMetaB, params.ra, params.dec, effectiveFov);
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

      // Trigger Automated Multi-Epoch Change Detection
      triggerChangeDetection(loadedObs, params.ra, params.dec, effectiveFov, params.target_name);

    } catch (err) {
      console.error("Failed to load time machine data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Run change detection
  const triggerChangeDetection = async (obsList, ra, dec, currentFov, targetName) => {
    if (!obsList || obsList.length < 2) return;
    setChangeDetectionLoading(true);
    try {
      const result = await api.detectEpochChanges({
        obs_ids: obsList.map(o => o.obs_id),
        ra: parseFloat(ra),
        dec: parseFloat(dec),
        fov_arcmin: currentFov,
        target_name: targetName
      });
      setChangeDetectionResult(result);
      if (result.candidates && result.candidates.length > 0) {
        setSelectedCandidate(result.candidates[0]);
      }
    } catch (err) {
      console.error("Change detection scan failed:", err);
    } finally {
      setChangeDetectionLoading(false);
    }
  };

  // Handler for explicit FOV change
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
    triggerChangeDetection(observations, coords.ra, coords.dec, parsedFov, coords.name);
  };

  // Execute Image Subtraction (Difference Mode)
  const executeDifferenceMode = async () => {
    if (observations.length < 2) return;
    setDiffStackLoading(true);
    try {
      const refIdx = 0;
      const targetIdx = currentIndex === 0 ? 1 : currentIndex;
      const res = await api.subtractImages({
        obs_id_1: observations[refIdx].obs_id,
        obs_id_2: observations[targetIdx].obs_id,
        ra: parseFloat(coords.ra),
        dec: parseFloat(coords.dec),
        fov_arcmin: fov,
        normalize: true,
        color_map: 'coolwarm',
        stretch: 'asinh'
      });
      setDifferenceResult(res);
    } catch (err) {
      console.error("Difference subtraction failed:", err);
    } finally {
      setDiffStackLoading(false);
    }
  };

  // Execute Image Coaddition (Stack Mode)
  const executeStackMode = async () => {
    if (observations.length < 2) return;
    setDiffStackLoading(true);
    try {
      const res = await api.stackImages({
        obs_ids: observations.slice(0, 10).map(o => o.obs_id),
        ra: parseFloat(coords.ra),
        dec: parseFloat(coords.dec),
        fov_arcmin: fov,
        normalize: true,
        color_map: 'inferno',
        stretch: 'asinh'
      });
      setStackResult(res);
    } catch (err) {
      console.error("Stack co-addition failed:", err);
    } finally {
      setDiffStackLoading(false);
    }
  };

  // Effect when switching comparison modes
  useEffect(() => {
    if (comparisonMode === 'difference' && !differenceResult) {
      executeDifferenceMode();
    } else if (comparisonMode === 'stack' && !stackResult) {
      executeStackMode();
    }
  }, [comparisonMode, currentIndex, observations]);

  // Initial load
  useEffect(() => {
    loadEpochs({
      ra: initialRa,
      dec: initialDec,
      fov_arcmin: initialFov,
      target_name: initialName
    }, activeMode, initialFov);
  }, [activeMode]);

  // Navigation helpers
  const handlePrevEpoch = () => {
    if (observations.length === 0) return;
    const prev = currentIndex === 0 ? (isLooping ? observations.length - 1 : 0) : currentIndex - 1;
    setCurrentIndex(prev);
    loadFrameForEpoch(observations[prev], setFrameDataA, setFrameMetaA, coords.ra, coords.dec, fov);
  };

  const handleNextEpoch = () => {
    if (observations.length === 0) return;
    const next = (currentIndex + 1) % observations.length;
    if (next === 0 && !isLooping) {
      setIsPlaying(false);
      return;
    }
    setCurrentIndex(next);
    loadFrameForEpoch(observations[next], setFrameDataA, setFrameMetaA, coords.ra, coords.dec, fov);
  };

  const handleGoToEpoch = (idx) => {
    if (idx < 0 || idx >= observations.length) return;
    setCurrentIndex(idx);
    loadFrameForEpoch(observations[idx], setFrameDataA, setFrameMetaA, coords.ra, coords.dec, fov);
  };

  // Time-lapse playback loop
  useEffect(() => {
    if (!isPlaying || observations.length === 0 || comparisonMode === 'blink') return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % observations.length;
        if (next === 0 && !isLooping) {
          setIsPlaying(false);
          return prev;
        }
        loadFrameForEpoch(observations[next], setFrameDataA, setFrameMetaA, coords.ra, coords.dec, fov);
        return next;
      });
    }, 1000 / playbackSpeedFps);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeedFps, observations, comparisonMode, isLooping, coords.ra, coords.dec, fov, loadFrameForEpoch]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevEpoch();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextEpoch();
      } else if (e.code === 'Home') {
        e.preventDefault();
        handleGoToEpoch(0);
      } else if (e.code === 'End') {
        e.preventDefault();
        handleGoToEpoch(observations.length - 1);
      } else if (e.key === 'b' || e.key === 'B') {
        setComparisonMode(prev => prev === 'blink' ? 'timelapse' : 'blink');
      } else if (e.key === 'd' || e.key === 'D') {
        setComparisonMode(prev => prev === 'difference' ? 'timelapse' : 'difference');
      } else if (e.key === 's' || e.key === 'S') {
        setComparisonMode(prev => prev === 'stack' ? 'timelapse' : 'stack');
      } else if (e.key === 'm' || e.key === 'M') {
        setComparisonMode(prev => prev === 'motion' ? 'timelapse' : 'motion');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [observations.length, isLooping, currentIndex]);

  // Client-Side Time-Lapse Video Recording via MediaRecorder
  const handleRecordVideo = async () => {
    if (!canvasDomRef.current || observations.length === 0) return;
    setIsRecordingVideo(true);
    try {
      const stream = canvasDomRef.current.captureStream(playbackSpeedFps);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const recordedChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cosmoscope_timelapse_${(coords.name || 'target').replace(/\s+/g, '_')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecordingVideo(false);
      };

      mediaRecorder.start();

      // Step sequentially through each epoch for the recording
      let frameIndex = 0;
      const stepDurationMs = 1000 / playbackSpeedFps;
      const recordTimer = setInterval(() => {
        if (frameIndex >= observations.length) {
          clearInterval(recordTimer);
          setTimeout(() => mediaRecorder.stop(), stepDurationMs);
          return;
        }
        handleGoToEpoch(frameIndex);
        frameIndex++;
      }, stepDurationMs);

    } catch (err) {
      console.error("Video recording failed:", err);
      setIsRecordingVideo(false);
    }
  };

  // Export current canvas frame as PNG
  const handleExportPNG = () => {
    if (!canvasDomRef.current) return;
    const dataUrl = canvasDomRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `cosmoscope_${comparisonMode}_${(coords.name || 'frame').replace(/\s+/g, '_')}_epoch${currentIndex + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const currentEpoch = observations[currentIndex];
  const canCompare = activeMode === 'multimission' 
    ? (observations.length > 1) 
    : (searchResponse?.can_compare ?? (observations.length > 1));

  // Determine what image data to render based on active comparison mode
  let displayImage = frameDataA;
  let displayColormap = 'inferno';
  let displayTitle = currentEpoch ? `${currentEpoch.obs_id} (${currentEpoch.energy_bandpassname})` : "Loading...";
  let diffStats = null;
  let stckStats = null;

  if (comparisonMode === 'difference' && differenceResult) {
    displayImage = differenceResult.difference_data;
    displayColormap = 'coolwarm';
    displayTitle = `Subtracted Difference: ${observations[0]?.obs_id} vs ${currentEpoch?.obs_id}`;
    diffStats = {
      sigma_diff: differenceResult.sigma_diff,
      pos_excursions: differenceResult.pos_excursions_count,
      neg_excursions: differenceResult.neg_excursions_count,
      max_pos: differenceResult.max_pos_residual,
      min_neg: differenceResult.min_neg_residual
    };
  } else if (comparisonMode === 'stack' && stackResult) {
    displayImage = stackResult.stacked_data;
    displayColormap = 'inferno';
    displayTitle = `Deep Coadded Stack (${stackResult.num_stacked_images} Frames)`;
    stckStats = {
      snr_gain: stackResult.snr_improvement_factor,
      noise_reduction_pct: stackResult.noise_reduction_percent,
      n_stacked: stackResult.num_stacked_images
    };
  }

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
              COSMOSCOPE Astronomical Time-Lapse & Change Detection
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-semibold border border-cyan-500/30">
                Scientific Multi-Epoch Pipeline
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive temporal player tracking astrometric proper motion, transient excursions, and flux variability.
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

        <div className="flex items-center gap-3">
          <ProvenanceBadge 
            tier={
              activeMode === 'spherex' 
                ? 'MEASURED' 
                : activeMode === 'multimission' 
                ? 'CATALOGUED' 
                : 'SIMULATED'
            }
            source={
              activeMode === 'spherex' 
                ? 'NASA/IPAC IRSA SPHEREx QR2' 
                : activeMode === 'multimission' 
                ? '2MASS / AllWISE / SPHEREx' 
                : 'Gaia Astrometry Model Propagation'
            }
            size="sm"
          />

          <button
            onClick={() => navigate(`/dossier?ra=${coords.ra}&dec=${coords.dec}&name=${encodeURIComponent(coords.name || '')}&fov=${fov}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/50 text-violet-200 text-xs font-semibold shadow-sm transition-all"
            title="Open Scientific Evidence Dossier for current coordinates"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scientific Evidence Dossier</span>
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

      {/* 4 Astronomical Image Comparison Modes Toolbar */}
      <div className="astro-card p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-space-border/80 bg-space-950/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mr-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Comparison Mode:
          </span>

          <div className="flex items-center p-1 rounded-xl bg-space-900 border border-space-border text-xs font-medium">
            <button
              onClick={() => setComparisonMode('timelapse')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                comparisonMode === 'timelapse'
                  ? 'bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sequential chronological time-lapse playback"
            >
              Time-Lapse Player
            </button>

            <button
              onClick={() => setComparisonMode('blink')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                comparisonMode === 'blink'
                  ? 'bg-amber-500 text-white font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Blink comparator rapidly alternating between Epoch 1 and Epoch i"
            >
              Blink Mode
            </button>

            <button
              onClick={() => {
                setComparisonMode('difference');
                executeDifferenceMode();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                comparisonMode === 'difference'
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Flux-matched, WCS-reprojected difference imaging (Itarget - Iref)"
            >
              Difference Subtraction
            </button>

            <button
              onClick={() => {
                setComparisonMode('stack');
                executeStackMode();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                comparisonMode === 'stack'
                  ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Coadded stack across aligned observations (√N SNR gain)"
            >
              Stack Coaddition
            </button>

            <button
              onClick={() => setComparisonMode('motion')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                comparisonMode === 'motion'
                  ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Multi-epoch centroid motion tracks and trajectory vectors"
            >
              Motion Trail Mode
            </button>
          </div>
        </div>

        {/* Quick Export Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 hover:text-white border border-space-border text-xs font-medium transition-all"
            title="Download active canvas viewport as PNG"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Frame PNG</span>
          </button>

          <button
            onClick={handleRecordVideo}
            disabled={isRecordingVideo || observations.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isRecordingVideo
                ? 'bg-red-500/20 text-red-300 border-red-500/60 animate-pulse'
                : 'bg-space-850 hover:bg-space-800 text-purple-300 border-space-border'
            }`}
            title="Record full time-lapse video sequence directly from canvas"
          >
            <Video className="w-3.5 h-3.5" />
            <span>{isRecordingVideo ? "Recording Video..." : "Record Video (.webm)"}</span>
          </button>
        </div>
      </div>

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
                  {comparisonMode === 'blink' ? "Blink Comparator Mode" :
                   comparisonMode === 'difference' ? "Flux-Matched Difference Subtraction" :
                   comparisonMode === 'stack' ? "Astrometric Coaddition Deep Stack" :
                   comparisonMode === 'motion' ? "Multi-Epoch Motion Vector Tracking" :
                   "Interactive Epoch Viewport"}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {/* FOV Control */}
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
              {diffStackLoading ? (
                <div className="h-[440px] flex items-center justify-center bg-black rounded border border-space-border/50 text-cyan-400 font-mono text-xs animate-pulse">
                  Computing WCS-aligned {comparisonMode} image matrix...
                </div>
              ) : (
                <FITSViewerCanvas
                  imageData={displayImage}
                  blinkImage={frameDataB}
                  blinkActive={comparisonMode === 'blink'}
                  blinkSpeedMs={blinkSpeedMs}
                  colormap={displayColormap}
                  title={displayTitle}
                  detector={currentEpoch?.detector || 1}
                  measuredCentroid={frameMetaA?.measured_centroid_px}
                  predictedCentroid={frameMetaA?.gaia_predicted_px}
                  showAstrometry={showAstrometryOverlay}
                  motionTrails={comparisonMode === 'motion' ? changeDetectionResult?.motion_tracks : null}
                  activeCandidates={changeDetectionResult?.candidates}
                  selectedCandidateId={selectedCandidate?.candidate_id}
                  onSelectCandidate={(cand) => {
                    setSelectedCandidate(cand);
                  }}
                  differenceStats={diffStats}
                  stackStats={stckStats}
                  onCanvasRef={(ref) => { canvasDomRef.current = ref; }}
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
              )}
            </div>

            {/* Playback & Scrubbing Controls */}
            <div className="mt-4 pt-3 border-t border-space-border/60 space-y-3">
              
              {/* Timeline Slider with Active Cursor */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Start: {observations[0]?.obs_date_iso?.split('T')[0] || '--'}</span>
                  <span className="text-cyan-300 font-bold bg-space-950 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    {currentEpoch?.obs_date_iso?.replace('T', ' ').substring(0, 19) || '--'} UTC
                  </span>
                  <span>End: {observations[observations.length - 1]?.obs_date_iso?.split('T')[0] || '--'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, observations.length - 1)}
                  value={currentIndex}
                  disabled={comparisonMode === 'blink'}
                  onChange={(e) => handleGoToEpoch(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-space-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Action Buttons, Blinking & Speed Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevEpoch}
                    className="p-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 border border-space-border transition-colors"
                    title="Previous Epoch (Left Arrow)"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg transition-all"
                    title="Play / Pause Time-Lapse (Spacebar)"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? "Pause Sequence" : "Play Time-Lapse"}</span>
                  </button>
                  <button
                    onClick={handleNextEpoch}
                    className="p-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 border border-space-border transition-colors"
                    title="Next Epoch (Right Arrow)"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-2 rounded-xl border transition-all ${
                      isLooping 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                        : 'bg-space-850 text-slate-400 border-space-border'
                    }`}
                    title={isLooping ? "Continuous Loop Active" : "Play Once (Loop Off)"}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed and Overlay Controls */}
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

                  {/* Playback / Blink Speed Selector */}
                  <div className="flex items-center gap-1.5 bg-space-950 px-2 py-1 rounded-xl border border-space-border text-xs font-mono">
                    <span className="text-slate-400 text-[10px]">Speed:</span>
                    <select
                      value={comparisonMode === 'blink' ? blinkSpeedMs : playbackSpeedFps}
                      onChange={(e) => {
                        if (comparisonMode === 'blink') setBlinkSpeedMs(parseInt(e.target.value));
                        else setPlaybackSpeedFps(parseInt(e.target.value));
                      }}
                      className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none cursor-pointer"
                    >
                      {comparisonMode === 'blink' ? (
                        <>
                          <option value="200" className="bg-space-950 text-slate-200">200 ms (Fast)</option>
                          <option value="400" className="bg-space-950 text-slate-200">400 ms (Standard)</option>
                          <option value="800" className="bg-space-950 text-slate-200">800 ms (Slow)</option>
                        </>
                      ) : (
                        <>
                          <option value="1" className="bg-space-950 text-slate-200">1 fps</option>
                          <option value="2" className="bg-space-950 text-slate-200">2 fps (Standard)</option>
                          <option value="5" className="bg-space-950 text-slate-200">5 fps (Fast)</option>
                          <option value="10" className="bg-space-950 text-slate-200">10 fps (Ultra)</option>
                        </>
                      )}
                    </select>
                  </div>
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

          {/* Quick Action Navigation */}
          <div className="astro-card p-3.5 rounded-2xl flex items-center gap-2">
            <button
              onClick={() => {
                navigate(`/image-lab?ra=${coords.ra}&dec=${coords.dec}`);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-space-850 hover:bg-space-800 border border-space-border text-cyan-300 text-xs font-medium transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Image Lab</span>
            </button>
            <button
              onClick={() => {
                navigate(`/discovery?ra=${coords.ra}&dec=${coords.dec}&name=${encodeURIComponent(coords.name)}`);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-space-850 hover:bg-space-800 border border-space-border text-violet-300 text-xs font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discovery Engine</span>
            </button>
          </div>

        </div>

      </div>

      {/* Horizontal Observation Timeline & Thumbnail Strip */}
      <div className="astro-card p-4 rounded-2xl space-y-2">
        <div className="flex items-center justify-between border-b border-space-border pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white">
              Authentic Observation Timeline Strip
            </h4>
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              {observations.length} Epochs Loaded
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Click any epoch to scrub directly
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
          {observations.map((obs, idx) => {
            const isCurrent = currentIndex === idx;
            return (
              <div
                key={`timeline_strip_${obs.obs_id}_${idx}`}
                onClick={() => handleGoToEpoch(idx)}
                className={`flex flex-col items-center p-2 rounded-xl border text-xs cursor-pointer transition-all min-w-[130px] flex-shrink-0 ${
                  isCurrent 
                    ? 'bg-cyan-500/20 border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                    : 'bg-space-950/80 border-space-border hover:bg-space-850'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-cyan-300' : 'text-slate-400'}`}>
                    #{idx + 1}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-space-900 border border-space-border text-emerald-300 font-mono">
                    {obs.energy_bandpassname}
                  </span>
                </div>

                <div className="w-full text-center py-1 font-mono text-[11px] text-white font-semibold truncate">
                  {obs.obs_date_iso?.split('T')[0] || '--'}
                </div>

                <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">
                  {obs.visit_group || obs.mission || `Det ${obs.detector || 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Changes Detected Panel */}
      <ChangesDetectedPanel
        candidates={changeDetectionResult?.candidates || []}
        categoryCounts={changeDetectionResult?.category_counts || {}}
        selectedCandidate={selectedCandidate}
        onSelectCandidate={(cand) => {
          setSelectedCandidate(cand);
        }}
        onInvestigate={(cand) => {
          setSelectedCandidate(cand);
          setInvestigatingCandidate(cand);
        }}
        loading={changeDetectionLoading}
        targetName={coords.name}
      />

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

      {/* Source Investigation Modal */}
      {investigatingCandidate && (
        <SourceInvestigationModal
          candidate={investigatingCandidate}
          onClose={() => setInvestigatingCandidate(null)}
          targetName={coords.name}
        />
      )}

    </div>
  );
}
