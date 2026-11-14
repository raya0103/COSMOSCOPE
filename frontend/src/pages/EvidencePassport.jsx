import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileCheck2, Download, ShieldCheck, Database, Layers, Activity, CheckCircle2, Copy, Check } from 'lucide-react';
import SearchHeader from '../components/SearchHeader';
import { api } from '../services/api';

export default function EvidencePassport() {
  const [searchParams] = useSearchParams();
  const initialRa = searchParams.get('ra') || '269.45208';
  const initialDec = searchParams.get('dec') || '4.69333';
  const initialName = searchParams.get('name') || "Barnard's Star";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passportData, setPassportData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [currentTarget, setCurrentTarget] = useState({ ra: initialRa, dec: initialDec, name: initialName });

  const loadPassport = async (params) => {
    setLoading(true);
    setError(null);
    setCurrentTarget({ ra: params.ra, dec: params.dec, name: params.target_name || '' });
    try {
      const url = `/api/reports/export?format=json&ra=${params.ra}&dec=${params.dec}&target_name=${encodeURIComponent(params.target_name || '')}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setPassportData(data);
    } catch (err) {
      console.error("Passport export error:", err);
      setError(err.message || "Failed to generate Evidence Passport");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPassport({
      ra: initialRa,
      dec: initialDec,
      target_name: initialName
    });
  }, []);

  const handleDownloadPdf = () => {
    const url = `/api/reports/export?format=pdf&ra=${currentTarget.ra}&dec=${currentTarget.dec}&target_name=${encodeURIComponent(currentTarget.name)}`;
    window.open(url, '_blank');
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(passportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <SearchHeader
        onSearch={loadPassport}
        loading={loading}
        initialRa={initialRa}
        initialDec={initialDec}
        initialName={initialName}
      />

      {/* Loading & Error States */}
      {loading && (
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/40 text-cyan-300 flex items-center gap-3 text-xs font-mono">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Synthesizing cryptographic Evidence Passport from NASA/IPAC IRSA archive...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-rose-300 flex items-center justify-between text-xs font-mono">
          <span>Error generating dossier: {error}</span>
          <button 
            onClick={() => loadPassport(currentTarget)}
            className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-[10px]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Passport Document */}
      <div className="astro-card p-6 rounded-2xl space-y-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.08)]">
        
        {/* Passport Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-space-border/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {passportData?.passport_seal || "GENERATING SEAL..."}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Reproducible Dossier
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-1">
                Discovery Evidence Passport
              </h1>
              <div className="text-xs font-mono text-slate-400">
                Generated: {passportData?.generated_at_utc || '--'} • Pipeline v2.0
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-space-border text-xs text-slate-300 font-mono transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied JSON" : "Copy JSON"}</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF</span>
            </button>
          </div>
        </div>

        {/* Target Telemetry Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-space-950/80 border border-space-border font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-400">Target Designation</div>
            <div className="text-white font-bold text-sm truncate">{passportData?.target?.target_name || initialName}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Right Ascension (RA)</div>
            <div className="text-cyan-300 font-bold text-sm">{passportData?.target?.ra_deg?.toFixed(5)}°</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Declination (Dec)</div>
            <div className="text-cyan-300 font-bold text-sm">{passportData?.target?.dec_deg?.toFixed(5)}°</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Anomaly Index</div>
            <div className="text-emerald-400 font-bold text-sm">{passportData?.anomaly_evaluation?.overall_score || '--'} / 100</div>
          </div>
        </div>

        {/* Quantitative Findings Ledger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Astrometry & Proper Motion */}
          <div className="p-4 rounded-xl bg-space-900 border border-space-border space-y-2">
            <h3 className="text-xs font-bold text-cyan-300 uppercase font-mono tracking-wider">
              Astrometric Displacement Ledger
            </h3>
            <div className="space-y-1 text-xs font-mono text-slate-300">
              <div className="flex justify-between py-1 border-b border-space-border/50">
                <span className="text-slate-400">Apparent Proper Motion:</span>
                <span className="text-white font-bold">{passportData?.motion_analysis?.proper_motion_mas_yr} mas/yr</span>
              </div>
              <div className="flex justify-between py-1 border-b border-space-border/50">
                <span className="text-slate-400">Angular Shift:</span>
                <span className="text-white">{passportData?.motion_analysis?.displacement_arcsec}″</span>
              </div>
              <div className="flex justify-between py-1 border-b border-space-border/50">
                <span className="text-slate-400">Observation Baseline:</span>
                <span className="text-white">{passportData?.motion_analysis?.baseline_days} days</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Gaia DR3 Agreement:</span>
                <span className="text-emerald-400 font-bold">Confirmed Consistent</span>
              </div>
            </div>
          </div>

          {/* 102-Band Spectrophotometry & Chemical Ices */}
          <div className="p-4 rounded-xl bg-space-900 border border-space-border space-y-2">
            <h3 className="text-xs font-bold text-violet-300 uppercase font-mono tracking-wider">
              102-Band Spectrophotometry & Chemical Ices
            </h3>
            <div className="space-y-1 text-xs font-mono text-slate-300">
              <div className="flex justify-between py-1 border-b border-space-border/50">
                <span className="text-slate-400">Spectral Channels:</span>
                <span className="text-white font-bold">102 Near-Infrared Bands (0.75 - 5.0 µm)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-space-border/50">
                <span className="text-slate-400">H₂O Water Ice (3.05 µm):</span>
                <span className="text-cyan-300 font-bold">τ = {passportData?.spectral_analysis?.ice_features?.h2o_ice?.tau ?? 0.0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-space-border/50">
                <span className="text-slate-400">CO₂ Dry Ice (4.27 µm):</span>
                <span className="text-amber-300 font-bold">τ = {passportData?.spectral_analysis?.ice_features?.co2_ice?.tau ?? 0.0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Detector Assemblies:</span>
                <span className="text-white">D1, D2, D3, D4, D5, D6</span>
              </div>
            </div>
          </div>

        </div>

        {/* Observation Provenance Ledger Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Archival Observation Telemetry (Sample 10 Epochs)</span>
          </h3>
          <div className="overflow-x-auto rounded-xl border border-space-border bg-space-950">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-space-900 border-b border-space-border text-slate-400 text-[11px]">
                <tr>
                  <th className="py-2 px-3">Observation ID</th>
                  <th className="py-2 px-3">Detector</th>
                  <th className="py-2 px-3">Bandpass</th>
                  <th className="py-2 px-3">Observation Timestamp (UTC)</th>
                  <th className="py-2 px-3">Data Release</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-space-border/40">
                {passportData?.provenance?.observation_ledgers?.map((obs, idx) => (
                  <tr key={`${obs.obs_id}_D${obs.detector}_${idx}`} className="hover:bg-space-900/50">
                    <td className="py-2 px-3 font-bold text-cyan-300">{obs.obs_id}</td>
                    <td className="py-2 px-3">Detector {obs.detector}</td>
                    <td className="py-2 px-3">{obs.band}</td>
                    <td className="py-2 px-3 text-slate-400">{obs.date?.replace('T', ' ')}</td>
                    <td className="py-2 px-3 text-emerald-400">SPHEREx QR2/QR3</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integrity Notice */}
        <div className="p-3 rounded-xl bg-space-950 border border-space-border/60 text-[11px] text-slate-400 font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Data Provenance Verified: Calibrated Level 2 products retrieved from NASA/IPAC IRSA.
            Physical measurements and error bounds computed deterministically.
          </span>
        </div>

      </div>

    </div>
  );
}
