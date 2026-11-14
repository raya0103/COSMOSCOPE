import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, ShieldAlert, Award, FileCheck2, Users, ArrowRight, Activity, Clock, BarChart3 } from 'lucide-react';
import SearchHeader from '../components/SearchHeader';
import PlotlyChart from '../components/PlotlyChart';
import { api } from '../services/api';

export default function DiscoveryEngine() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialRa = searchParams.get('ra') || '269.45208';
  const initialDec = searchParams.get('dec') || '4.69333';
  const initialName = searchParams.get('name') || "Barnard's Star";

  const [loading, setLoading] = useState(false);
  const [anomalyData, setAnomalyData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [currentTarget, setCurrentTarget] = useState({
    ra: initialRa,
    dec: initialDec,
    name: initialName,
  });

  const evaluateCandidate = async (params) => {
    setLoading(true);
    setCurrentTarget({
      ra: params.ra,
      dec: params.dec,
      name: params.target_name || "Unknown Target"
    });
    try {
      const res = await api.rankCandidateAnomaly(params);
      setAnomalyData(res);
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    evaluateCandidate({
      ra: initialRa,
      dec: initialDec,
      target_name: initialName
    });
    api.getCandidates().then(setCandidates).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <SearchHeader
        onSearch={evaluateCandidate}
        loading={loading}
        initialRa={initialRa}
        initialDec={initialDec}
        initialName={initialName}
      />

      {/* Main Grid: Score Gauge & Factor Breakdown (8 cols) + Candidate Queue (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Anomaly Evaluation & Reasons (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Anomaly Score Hero Card */}
          <div className="astro-card p-6 rounded-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {anomalyData?.badge || "Evaluating Anomaly..."}
                </span>
                <h2 className="text-2xl font-bold text-white mt-2">
                  {currentTarget.name}
                </h2>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  RA: {currentTarget.ra}° • Dec: {currentTarget.dec}° • Quality Confidence: {((anomalyData?.quality_confidence || 0.94) * 100).toFixed(0)}%
                </div>
              </div>

              {/* Big Score Dial */}
              <div className="flex flex-col items-center justify-center w-28 h-28 rounded-2xl bg-gradient-to-br from-space-950 to-space-850 border border-cyan-500/40 shadow-[0_0_25px_rgba(0,240,255,0.2)]">
                <span className="text-3xl font-black font-mono text-cyan-300">
                  {anomalyData?.overall_score || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">out of 100</span>
              </div>
            </div>

            {/* Factor Score Bars & Polar Radar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-space-border/60">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-space-950 border border-space-border">
                  <div className="text-[10px] text-slate-400">Motion Score (max 30)</div>
                  <div className="text-lg font-bold text-cyan-300 font-mono">
                    {anomalyData?.factor_breakdown?.motion_score || 0} pts
                  </div>
                  <div className="w-full bg-space-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-cyan-400 h-full rounded-full" 
                      style={{ width: `${((anomalyData?.factor_breakdown?.motion_score || 0) / 30) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-space-950 border border-space-border">
                  <div className="text-[10px] text-slate-400">Variability (max 30)</div>
                  <div className="text-lg font-bold text-violet-300 font-mono">
                    {anomalyData?.factor_breakdown?.variability_score || 0} pts
                  </div>
                  <div className="w-full bg-space-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-violet-400 h-full rounded-full" 
                      style={{ width: `${((anomalyData?.factor_breakdown?.variability_score || 0) / 30) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-space-950 border border-space-border">
                  <div className="text-[10px] text-slate-400">Spectral Ice (max 20)</div>
                  <div className="text-lg font-bold text-sky-300 font-mono">
                    {anomalyData?.factor_breakdown?.spectral_score || 0} pts
                  </div>
                  <div className="w-full bg-space-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-sky-400 h-full rounded-full" 
                      style={{ width: `${((anomalyData?.factor_breakdown?.spectral_score || 0) / 20) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-space-950 border border-space-border">
                  <div className="text-[10px] text-slate-400">Catalog Novelty (max 20)</div>
                  <div className="text-lg font-bold text-emerald-300 font-mono">
                    {anomalyData?.factor_breakdown?.catalog_anomaly_score || 0} pts
                  </div>
                  <div className="w-full bg-space-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full rounded-full" 
                      style={{ width: `${((anomalyData?.factor_breakdown?.catalog_anomaly_score || 0) / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Plotly Polar Radar */}
              <div className="h-48 rounded-xl overflow-hidden border border-space-border/60 bg-space-950/60 p-1">
                <PlotlyChart
                  data={[
                    {
                      type: 'scatterpolar',
                      r: [
                        anomalyData?.factor_breakdown?.motion_score || 0,
                        anomalyData?.factor_breakdown?.variability_score || 0,
                        anomalyData?.factor_breakdown?.spectral_score || 0,
                        anomalyData?.factor_breakdown?.catalog_anomaly_score || 0,
                        anomalyData?.factor_breakdown?.motion_score || 0
                      ],
                      theta: ['Motion', 'Variability', 'Spectral Ice', 'Catalog Novelty', 'Motion'],
                      fill: 'toself',
                      fillcolor: 'rgba(0, 240, 255, 0.25)',
                      line: { color: '#00F0FF', width: 2 }
                    }
                  ]}
                  layout={{
                    polar: { radialaxis: { visible: true, range: [0, 32], tickfont: { size: 8 } } },
                    margin: { l: 25, r: 25, t: 15, b: 15 },
                    showlegend: false
                  }}
                  className="w-full h-44"
                />
              </div>
            </div>

          </div>

          {/* Transparent Interpretable Explanations */}
          <div className="astro-card p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Interpretable Physical Rationale</span>
            </h3>
            <div className="space-y-2">
              {anomalyData?.interpretable_reasons?.map((reason, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-space-950/80 border border-space-border flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-space-border/60">
              <div className="text-xs text-slate-400">
                <b>Recommendation:</b> {anomalyData?.recommended_action || "Standard celestial source."}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/passport?ra=${currentTarget.ra}&dec=${currentTarget.dec}&name=${encodeURIComponent(currentTarget.name)}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/50 text-violet-300 text-xs font-semibold"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Evidence Passport</span>
                </button>
                <button
                  onClick={() => navigate(`/citizen?candidate_id=SPX-CAND-269452+004693`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 text-xs font-semibold"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Citizen Review</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Pre-Ranked Candidates Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="astro-card p-4 rounded-2xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-space-border/60">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Discovery Candidates Queue</span>
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono">Ranked by Anomaly Index</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {candidates.map((cand) => (
                <div
                  key={cand.candidate_id}
                  onClick={() => {
                    navigate(`/discovery?ra=${cand.ra_deg}&dec=${cand.dec_deg}&name=${encodeURIComponent(cand.target_name)}`);
                    evaluateCandidate({ ra: cand.ra_deg, dec: cand.dec_deg, target_name: cand.target_name });
                  }}
                  className="p-3 rounded-xl bg-space-850/60 border border-space-border hover:border-cyan-500/50 hover:bg-space-800 cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{cand.target_name}</span>
                    <span className="text-xs font-mono font-black text-cyan-300 px-1.5 py-0.5 rounded bg-space-950 border border-cyan-500/30">
                      {cand.anomaly_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[10px] text-cyan-400 font-medium mb-1">
                    {cand.badge}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    RA: {cand.ra_deg.toFixed(3)}° • Dec: {cand.dec_deg.toFixed(3)}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
