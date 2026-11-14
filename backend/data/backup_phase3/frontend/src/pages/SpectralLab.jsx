import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Download, Layers, Sparkles, Filter, Droplets } from 'lucide-react';
import SearchHeader from '../components/SearchHeader';
import SpectralPlot from '../visualizations/SpectralPlot';
import { api } from '../services/api';

export default function SpectralLab() {
  const [searchParams] = useSearchParams();
  const initialRa = searchParams.get('ra') || '133.79513'; // WISE 0855 cold brown dwarf default
  const initialDec = searchParams.get('dec') || '-7.24515';
  const initialName = searchParams.get('name') || "WISE 0855";

  const [loading, setLoading] = useState(false);
  const [spectralData, setSpectralData] = useState(null);
  const [selectedDetector, setSelectedDetector] = useState("all");
  const [currentTarget, setCurrentTarget] = useState({ ra: initialRa, dec: initialDec, name: initialName });

  const loadSpectrum = async (params) => {
    setLoading(true);
    setCurrentTarget({ ra: params.ra, dec: params.dec, name: params.target_name || '' });
    try {
      const res = await api.extractSpectrum(params);
      setSpectralData(res);
    } catch (err) {
      console.error("Spectral extraction error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpectrum({
      ra: initialRa,
      dec: initialDec,
      target_name: initialName
    });
  }, []);

  const filteredChannels = spectralData?.spectrum?.filter(c => 
    selectedDetector === "all" ? true : c.detector === parseInt(selectedDetector)
  ) || [];

  const handleExportCsv = () => {
    if (!spectralData?.spectrum) return;
    const header = "channel_id,detector,wavelength_um,bandwidth_um,flux_density_ujy,flux_density_mjy_sr\n";
    const rows = spectralData.spectrum.map(c => 
      `${c.channel_id},${c.detector},${c.wavelength_um},${c.bandwidth_um},${c.flux_density_ujy},${c.flux_density_mjy_sr}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SPHEREx_102Band_Spectrum_${(currentTarget.name || 'target').replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <SearchHeader
        onSearch={loadSpectrum}
        loading={loading}
        initialRa={initialRa}
        initialDec={initialDec}
        initialName={initialName}
      />

      {/* Main 102-Band Chart */}
      <div className="space-y-4">
        <SpectralPlot
          spectrum={spectralData?.spectrum}
          iceFeatures={spectralData?.ice_features}
          title={`102-Channel Near-Infrared Spectrophotometry — ${initialName}`}
        />

        {/* Ice Absorption Feature Cards */}
        {spectralData?.ice_features && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="astro-card p-4 rounded-xl border-l-4 border-l-cyan-400">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>Water Ice (H₂O)</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${spectralData.ice_features.h2o_ice.detected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-space-950 text-slate-400'}`}>
                  {spectralData.ice_features.h2o_ice.detected ? "DETECTED" : "CONTINUUM"}
                </span>
              </div>
              <div className="mt-2 text-2xl font-mono font-extrabold text-cyan-300">
                τ = {spectralData.ice_features.h2o_ice.tau}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Central band at 3.05 µm in Detector 4. Diagnostic of interstellar grain mantles & cold planetary atmospheres.
              </p>
            </div>

            <div className="astro-card p-4 rounded-xl border-l-4 border-l-amber-400">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Carbon Dioxide Ice (CO₂)</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${spectralData.ice_features.co2_ice.detected ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-space-950 text-slate-400'}`}>
                  {spectralData.ice_features.co2_ice.detected ? "DETECTED" : "CONTINUUM"}
                </span>
              </div>
              <div className="mt-2 text-2xl font-mono font-extrabold text-amber-300">
                τ = {spectralData.ice_features.co2_ice.tau}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Central band at 4.27 µm in Detector 5. Sensitive tracer of molecular cloud chemistry and protostellar envelopes.
              </p>
            </div>

            <div className="astro-card p-4 rounded-xl border-l-4 border-l-rose-400">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span>Carbon Monoxide Ice (CO)</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${spectralData.ice_features.co_ice.detected ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-space-950 text-slate-400'}`}>
                  {spectralData.ice_features.co_ice.detected ? "DETECTED" : "CONTINUUM"}
                </span>
              </div>
              <div className="mt-2 text-2xl font-mono font-extrabold text-rose-300">
                τ = {spectralData.ice_features.co_ice.tau}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Central band at 4.67 µm in Detector 6. Ultra-volatile ice freezing out in the coldest stellar nurseries (&lt;20 K).
              </p>
            </div>

          </div>
        )}

        {/* 6 Detectors Filter Bar & Tabular Inspector */}
        <div className="astro-card p-4 rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-space-border/60">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Filter by Detector Array:</span>
              <div className="flex flex-wrap gap-1">
                {["all", "1", "2", "3", "4", "5", "6"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDetector(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      selectedDetector === d
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                        : 'bg-space-950 text-slate-400 border border-space-border hover:bg-space-850'
                    }`}
                  >
                    {d === "all" ? "All Detectors (102)" : `Detector ${d}`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 border border-space-border text-cyan-300 text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="sticky top-0 bg-space-950 text-slate-400 border-b border-space-border text-[11px]">
                <tr>
                  <th className="py-2 px-3">Channel #</th>
                  <th className="py-2 px-3">Detector</th>
                  <th className="py-2 px-3">Central λ (µm)</th>
                  <th className="py-2 px-3">Bandwidth Δλ</th>
                  <th className="py-2 px-3">Flux Density (µJy)</th>
                  <th className="py-2 px-3">Surface Brightness</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-space-border/40">
                {filteredChannels.map((c) => (
                  <tr key={c.channel_id} className="hover:bg-space-850/50 transition-colors">
                    <td className="py-2 px-3 font-bold text-cyan-400">#{c.channel_id}</td>
                    <td className="py-2 px-3">Detector {c.detector}</td>
                    <td className="py-2 px-3 text-white font-bold">{c.wavelength_um.toFixed(3)} µm</td>
                    <td className="py-2 px-3 text-slate-400">{c.bandwidth_um.toFixed(3)} µm</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">{c.flux_density_ujy.toFixed(2)} µJy</td>
                    <td className="py-2 px-3 text-slate-300">{c.flux_density_mjy_sr.toFixed(4)} MJy/sr</td>
                    <td className="py-2 px-3">
                      {c.is_direct_observation ? (
                        <span className="text-cyan-400 text-[10px]">● Observed</span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">○ Continuum</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}
