import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Globe2, Layers, Compass, ExternalLink, Sparkles, Activity } from 'lucide-react';
import SearchHeader from '../components/SearchHeader';
import { api } from '../services/api';

export default function MultiMissionExplorer() {
  const [searchParams] = useSearchParams();
  const initialRa = searchParams.get('ra') || '269.45208';
  const initialDec = searchParams.get('dec') || '4.69333';
  const initialName = searchParams.get('name') || "Barnard's Star";

  const [loading, setLoading] = useState(false);
  const [crossmatch, setCrossmatch] = useState(null);
  const [spherexObs, setSpherexObs] = useState([]);

  const loadMultiMission = async (params) => {
    setLoading(true);
    try {
      const [xres, sres] = await Promise.all([
        api.crossmatchCatalogues(params),
        api.searchObservations(params)
      ]);
      setCrossmatch(xres);
      setSpherexObs(sres.observations || []);
    } catch (err) {
      console.error("Multi-mission error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMultiMission({
      ra: initialRa,
      dec: initialDec,
      target_name: initialName,
      fov_arcmin: 3.0
    });
  }, []);

  const primaryGaia = crossmatch?.gaia_sources?.[0];
  const primaryWise = crossmatch?.allwise_sources?.[0];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <SearchHeader
        onSearch={loadMultiMission}
        loading={loading}
        initialRa={initialRa}
        initialDec={initialDec}
      />

      {/* Side-by-Side Multi-Mission Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: NASA SPHEREx */}
        <div className="astro-card p-5 rounded-2xl border-t-4 border-t-cyan-400 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 font-mono">NASA SPHEREx</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              0.75 – 5.0 µm
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Near-Infrared Spectrophotometry</h3>
            <p className="text-xs text-slate-300 mt-1">
              Linear Variable Filters (LVF) delivering continuous 102-channel spectroscopy across 6 detector arrays.
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono bg-space-950 p-3 rounded-xl border border-space-border">
            <div className="flex justify-between text-slate-400">
              <span>Coverage:</span>
              <span className="text-cyan-300 font-bold">{spherexObs.length} Verified Obs</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Resolution:</span>
              <span className="text-slate-200">R = 35 to 128</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pixel Scale:</span>
              <span className="text-slate-200">6.2″ per pixel</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Archive:</span>
              <span className="text-slate-200">NASA/IPAC IRSA</span>
            </div>
          </div>
        </div>

        {/* Card 2: ESA Gaia DR3 */}
        <div className="astro-card p-5 rounded-2xl border-t-4 border-t-violet-400 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-300 font-mono">ESA Gaia DR3</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/30">
              0.33 – 1.05 µm
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Optical Astrometry & Proper Motion</h3>
            <p className="text-xs text-slate-300 mt-1">
              Micro-arcsecond precision positions, proper motions, and optical G/BP/RP photometry.
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono bg-space-950 p-3 rounded-xl border border-space-border">
            <div className="flex justify-between text-slate-400">
              <span>Source ID:</span>
              <span className="text-violet-300 font-bold truncate max-w-[120px]">{primaryGaia?.source_id || 'No match'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Proper Motion (RA):</span>
              <span className="text-slate-200">{primaryGaia?.pmra?.toFixed(1) || '--'} mas/yr</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Proper Motion (Dec):</span>
              <span className="text-slate-200">{primaryGaia?.pmdec?.toFixed(1) || '--'} mas/yr</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Optical G Magnitude:</span>
              <span className="text-slate-200">{primaryGaia?.g_mag?.toFixed(2) || 'Undetected'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: NASA AllWISE */}
        <div className="astro-card p-5 rounded-2xl border-t-4 border-t-amber-400 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 font-mono">NASA AllWISE</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              3.4, 4.6, 12, 22 µm
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Mid-Infrared Photometry</h3>
            <p className="text-xs text-slate-300 mt-1">
              All-sky mid-infrared mapping sensitive to circumstellar dust, brown dwarfs, and planetary bodies.
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono bg-space-950 p-3 rounded-xl border border-space-border">
            <div className="flex justify-between text-slate-400">
              <span>Designation:</span>
              <span className="text-amber-300 font-bold truncate max-w-[120px]">{primaryWise?.designation || 'No match'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>W1 (3.4 µm):</span>
              <span className="text-slate-200">{primaryWise?.w1_mag?.toFixed(2) || '--'} mag</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>W2 (4.6 µm):</span>
              <span className="text-slate-200">{primaryWise?.w2_mag?.toFixed(2) || '--'} mag</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>W1 - W2 Color:</span>
              <span className="text-slate-200">
                {primaryWise?.w1_mag && primaryWise?.w2_mag ? (primaryWise.w1_mag - primaryWise.w2_mag).toFixed(2) : '--'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Cross-Mission Insights Banner */}
      <div className="astro-card p-5 rounded-2xl border-l-4 border-l-cyan-400 space-y-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Multi-Wavelength Astrometric & Spectral Insights</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          Comparing SPHEREx's 102 continuous bands with optical Gaia DR3 and mid-infrared AllWISE resolves degeneracies in stellar temperature and circumstellar dust. 
          Sources that are faint or invisible in Gaia DR3 (G &gt; 21 mag) but bright in SPHEREx Detector 5/6 (3.8–5.0 µm) represent cold brown dwarfs (such as WISE 0855) or heavily extincted protostars.
        </p>
      </div>

    </div>
  );
}
