import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Telescope, 
  Layers, 
  Clock, 
  Activity, 
  ExternalLink, 
  Database, 
  Compass, 
  Globe2, 
  Sparkles, 
  FileCheck2, 
  Eye, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';
import SearchHeader from '../components/SearchHeader';
import FITSViewerCanvas from '../visualizations/FITSViewerCanvas';
import GalaxyMapCanvas from '../visualizations/GalaxyMapCanvas';
import { api } from '../services/api';

export default function SkyExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialRa = searchParams.get('ra') || '269.45208';
  const initialDec = searchParams.get('dec') || '4.69333';
  const initialFov = parseFloat(searchParams.get('fov') || '3.0');
  const initialName = searchParams.get('name') || "Barnard's Star";

  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchData, setSearchData] = useState(null);
  const [selectedObs, setSelectedObs] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [crossmatch, setCrossmatch] = useState(null);

  // View Mode: 'cutout' (Deep 29x29 SPHEREx MEF cutout) or 'galaxy' (Interactive All-Sky Celestial Map)
  const [viewMode, setViewMode] = useState('cutout');

  // Colormap & Stretch states
  const [colormap, setColormap] = useState('inferno');
  const [stretch, setStretch] = useState('asinh');

  const executeSearch = async (params) => {
    setLoading(true);
    setSearchError(null);
    try {
      setSearchParams({
        ra: params.ra,
        dec: params.dec,
        fov: params.fov_arcmin,
        name: params.target_name || ''
      });

      const res = await api.searchObservations(params);
      setSearchData(res);
      setLoading(false);

      if (res.observations && res.observations.length > 0) {
        setSelectedObs(res.observations[0]);
        loadImage(res.observations[0].obs_id, res.target.ra_deg, res.target.dec_deg, params.fov_arcmin);
      } else {
        setImageData(null);
        setImageMeta(null);
      }

      // Query crossmatches in parallel without blocking image cutout
      api.crossmatchCatalogues(params).then(setCrossmatch).catch(console.warn);
    } catch (err) {
      console.error("Search error:", err);
      setSearchError(err.message || "Failed to connect to backend server");
      setImageLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const loadImage = async (obsId, ra, dec, fov) => {
    setImageLoading(true);
    try {
      const imgRes = await api.getImageDetails(obsId, ra, dec, fov, stretch, colormap);
      setImageData(imgRes.raw_grid);
      setImageMeta(imgRes);
    } catch (err) {
      console.error("Failed to load image:", err);
      setImageData(null);
      setImageMeta(null);
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    executeSearch({
      ra: initialRa,
      dec: initialDec,
      fov_arcmin: initialFov,
      target_name: initialName
    });
  }, []);

  const currentRa = parseFloat(searchParams.get('ra') || initialRa);
  const currentDec = parseFloat(searchParams.get('dec') || initialDec);
  const currentName = searchParams.get('name') || initialName;

  return (
    <div className="space-y-6">
      
      {/* 1. Search Header (Pillar 1: Search by sky coordinates) */}
      <SearchHeader
        onSearch={executeSearch}
        loading={loading}
        initialRa={initialRa}
        initialDec={initialDec}
        initialName={initialName}
      />

      {/* 2. Interactive Astronomy Research Laboratory: 6 Pillars Workflow Ribbon */}
      <div className="astro-card p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Research Lab:</span>
          </span>
          <span className="text-slate-400 hidden sm:inline">6 Core Astronomical Capabilities</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pillar 3: Compare observations from different dates */}
          <button
            onClick={() => navigate(`/time-machine?ra=${currentRa}&dec=${currentDec}&name=${encodeURIComponent(currentName)}`)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-space-850 hover:bg-space-800 text-cyan-300 border border-space-border hover:border-cyan-500/40 text-[11px] font-semibold transition-all"
            title="3. Compare observations from different dates (Cosmic Time Machine)"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>3. Compare Epochs</span>
          </button>

          {/* Pillar 4: Explore infrared spectral information */}
          <button
            onClick={() => navigate(`/spectral-lab?ra=${currentRa}&dec=${currentDec}&name=${encodeURIComponent(currentName)}`)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-space-850 hover:bg-space-800 text-violet-300 border border-space-border hover:border-violet-500/40 text-[11px] font-semibold transition-all"
            title="4. Explore infrared spectral information across 102 bands"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>4. 102-Band Spectrum</span>
          </button>

          {/* Pillar 5: Detect changes in brightness & variability */}
          <button
            onClick={() => navigate(`/image-lab?ra=${currentRa}&dec=${currentDec}&name=${encodeURIComponent(currentName)}`)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-space-850 hover:bg-space-800 text-amber-300 border border-space-border hover:border-amber-500/40 text-[11px] font-semibold transition-all"
            title="5. Detect changes in brightness, image subtraction (I2 - I1) & variability"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>5. Detect Variability</span>
          </button>

          {/* Pillar 6: Compare with other astronomical datasets */}
          <button
            onClick={() => navigate(`/multi-mission?ra=${currentRa}&dec=${currentDec}&name=${encodeURIComponent(currentName)}`)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-space-850 hover:bg-space-800 text-sky-300 border border-space-border hover:border-sky-500/40 text-[11px] font-semibold transition-all"
            title="6. Compare observations with other astronomical datasets (Gaia DR3 & AllWISE)"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>6. Multi-Mission (Gaia/WISE)</span>
          </button>

          {/* Export Passport */}
          <button
            onClick={() => navigate(`/passport?ra=${currentRa}&dec=${currentDec}&name=${encodeURIComponent(currentName)}`)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-[11px] font-bold shadow-sm transition-all"
            title="Export Cryptographic Evidence Passport"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Evidence Passport</span>
          </button>
        </div>
      </div>

      {/* 3. Main Grid: FITS Viewer & Observations List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="astro-card p-4 rounded-2xl flex flex-col h-[570px]">
            
            {/* View Mode Toggle: [🔭 SPHEREx Cutout] | [🌌 All-Sky Galaxy Map] */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-space-border/60">
              <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-space-950 border border-space-border text-xs">
                <button
                  onClick={() => setViewMode('cutout')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                    viewMode === 'cutout'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Telescope className="w-3.5 h-3.5" />
                  <span>SPHEREx Cutout</span>
                </button>
                <button
                  onClick={() => setViewMode('galaxy')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                    viewMode === 'galaxy'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>All-Sky Galaxy Map (Find in Whole Galaxy)</span>
                </button>
              </div>

              {/* Colormap & Stretch Controls (shown in cutout view) */}
              {viewMode === 'cutout' && (
                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={colormap}
                    onChange={(e) => setColormap(e.target.value)}
                    className="px-2 py-1 rounded bg-space-950 border border-space-border text-slate-300 text-xs font-mono"
                  >
                    <option value="inferno">Inferno</option>
                    <option value="viridis">Viridis</option>
                    <option value="coolwarm">Coolwarm</option>
                    <option value="greyscale">Greyscale</option>
                  </select>

                  <select
                    value={stretch}
                    onChange={(e) => setStretch(e.target.value)}
                    className="px-2 py-1 rounded bg-space-950 border border-space-border text-slate-300 text-xs font-mono"
                  >
                    <option value="asinh">Asinh (ZScale)</option>
                    <option value="log">Logarithmic</option>
                    <option value="sqrt">Square Root</option>
                    <option value="linear">Linear</option>
                  </select>
                </div>
              )}
            </div>

            {/* Backend Connection / Search Error Notice */}
            {searchError && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  <span><strong>Connection Notice:</strong> {searchError}. Please ensure the FastAPI backend is running on <code className="bg-black/30 px-1.5 py-0.5 rounded font-mono">http://localhost:8000</code>.</span>
                </div>
                <button 
                  onClick={() => executeSearch({ ra: currentRa.toString(), dec: currentDec.toString(), fov_arcmin: initialFov, target_name: currentName })}
                  className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium text-[11px] whitespace-nowrap ml-2"
                >
                  Retry Search
                </button>
              </div>
            )}

            {/* Interactive Canvas Area */}
            <div className="flex-1 relative overflow-hidden">
              {viewMode === 'galaxy' ? (
                /* All-Sky Galaxy Map */
                <GalaxyMapCanvas
                  selectedRa={currentRa}
                  selectedDec={currentDec}
                  selectedName={currentName}
                  onSelectTarget={(ra, dec, name) => {
                    executeSearch({
                      ra: ra.toString(),
                      dec: dec.toString(),
                      fov_arcmin: initialFov,
                      target_name: name
                    });
                  }}
                  onSwitchToCutout={() => setViewMode('cutout')}
                />
              ) : (
                /* Deep SPHEREx Level 2 Cutout */
                imageLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                    <div className="flex flex-col items-center gap-2">
                      <span className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-cyan-300 font-mono">Fetching FITS Cutout from IRSA...</span>
                    </div>
                  </div>
                ) : (
                  <FITSViewerCanvas
                    imageData={imageData}
                    title={selectedObs ? `${selectedObs.energy_bandpassname} (${selectedObs.obs_date_iso.split('T')[0]})` : "Cutout"}
                    detector={selectedObs ? selectedObs.detector : 1}
                    colormap={colormap}
                    stretch={stretch}
                    bunit={imageMeta ? imageMeta.bunit : "MJy / sr"}
                    irsaUrl={imageMeta?.irsa_source_url || null}
                    imageShape={imageMeta?.shape || null}
                    fluxRange={imageMeta ? { min: imageMeta.min_flux, max: imageMeta.max_flux, median: imageMeta.median_flux } : null}
                  />
                )
              )}
            </div>

            {/* Photometry Quick Readout (shown when cutout is active) */}
            {viewMode === 'cutout' && imageMeta?.photometry && (
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-space-border/60 text-center font-mono text-xs">
                <div className="p-1.5 rounded bg-space-950 border border-space-border">
                  <div className="text-[10px] text-slate-400">Peak Flux</div>
                  <div className="text-cyan-300 font-semibold">{imageMeta.photometry.peak_surface_brightness.toFixed(3)} MJy/sr</div>
                </div>
                <div className="p-1.5 rounded bg-space-950 border border-space-border">
                  <div className="text-[10px] text-slate-400">Integrated Flux</div>
                  <div className="text-emerald-400 font-semibold">{imageMeta.photometry.flux_density_ujy.toFixed(1)} µJy</div>
                </div>
                <div className="p-1.5 rounded bg-space-950 border border-space-border">
                  <div className="text-[10px] text-slate-400">Signal-to-Noise</div>
                  <div className="text-sky-300 font-semibold">{imageMeta.photometry.signal_to_noise_ratio}σ</div>
                </div>
                <div className="p-1.5 rounded bg-space-950 border border-space-border">
                  <div className="text-[10px] text-slate-400">AB Magnitude</div>
                  <div className="text-amber-300 font-semibold">{imageMeta.photometry.ab_magnitude || '--'}</div>
                </div>
              </div>
            )}

          </div>

          {/* Quick Action Navigation Bar */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/time-machine?ra=${searchData?.target.ra_deg}&dec=${searchData?.target.dec_deg}&name=${encodeURIComponent(searchData?.target.target_name || '')}`)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-space-850 hover:bg-space-800 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all shadow-md"
            >
              <Clock className="w-4 h-4" />
              <span>Animate in Cosmic Time Machine</span>
            </button>
            <button
              onClick={() => navigate(`/spectral-lab?ra=${searchData?.target.ra_deg}&dec=${searchData?.target.dec_deg}&name=${encodeURIComponent(searchData?.target.target_name || '')}`)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-space-850 hover:bg-space-800 border border-violet-500/30 text-violet-300 text-xs font-semibold transition-all shadow-md"
            >
              <Activity className="w-4 h-4" />
              <span>Analyze in 102-Band Spectral Lab</span>
            </button>
          </div>
        </div>

        {/* Right Column: Multi-Epoch Observations Table & Overlays (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Observations List (Pillar 2: View actual SPHEREx observations) */}
          <div className="astro-card p-4 rounded-2xl flex flex-col h-[570px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-space-border/60">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Observation Epochs ({searchData?.total_observations || 0})</span>
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[10px] text-slate-400">
                    Chronological SPHEREx Pointings
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/40 font-mono font-semibold">
                    ● NASA IRSA
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-space-950 border border-space-border">
                {searchData?.time_span_days || 0} days baseline
              </span>
            </div>

            {/* Scrollable Observation Rows */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {searchData?.observations?.map((obs) => {
                const isSelected = selectedObs?.obs_id === obs.obs_id;
                return (
                  <div
                    key={obs.obs_id}
                    onClick={() => {
                      setSelectedObs(obs);
                      setViewMode('cutout');
                      loadImage(obs.obs_id, searchData.target.ra_deg, searchData.target.dec_deg, initialFov);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.15)] text-white' 
                        : 'bg-space-850/60 border-space-border hover:bg-space-800 text-slate-300'
                    }`}
                  >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-cyan-300 text-[10px]" title={obs.obs_id}>
                      {obs.obs_id.substring(0, 8)}…
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-space-950 font-mono text-slate-300 border border-space-border">
                        {obs.energy_bandpassname}
                      </span>
                      {obs.cutout_url && (
                        <a
                          href={obs.cutout_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-400 hover:text-blue-200 p-0.5"
                          title="Open FITS file at NASA/IPAC IRSA"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{obs.obs_date_iso.replace('T', ' ').substring(0, 19)} UTC</span>
                    <span>Exp: {obs.t_exptime_sec.toFixed(0)}s</span>
                  </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* External Catalog Overlays (Pillar 6: Compare with Gaia DR3 & AllWISE) */}
          <div className="astro-card p-4 rounded-2xl">
            <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Catalog Crossmatch (Gaia DR3 & AllWISE)</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-space-950 border border-space-border">
                <div className="text-[10px] text-slate-400">Gaia DR3 Sources</div>
                <div className="text-cyan-400 font-bold text-sm">{crossmatch?.gaia_dr3_count || 0} matches</div>
                {crossmatch?.gaia_sources?.[0] && (
                  <div className="text-[10px] text-slate-300 mt-1">
                    PM: {Math.sqrt(crossmatch.gaia_sources[0].pmra**2 + crossmatch.gaia_sources[0].pmdec**2).toFixed(1)} mas/yr
                  </div>
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-space-950 border border-space-border">
                <div className="text-[10px] text-slate-400">AllWISE Sources</div>
                <div className="text-violet-400 font-bold text-sm">{crossmatch?.allwise_count || 0} matches</div>
                {crossmatch?.allwise_sources?.[0] && (
                  <div className="text-[10px] text-slate-300 mt-1">
                    W1: {crossmatch.allwise_sources[0].w1_mag?.toFixed(2) || '--'} mag
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
