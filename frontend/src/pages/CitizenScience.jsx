import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, CheckCircle2, AlertTriangle, Send, ThumbsUp, Sparkles, MessageSquare, Star } from 'lucide-react';
import FITSViewerCanvas from '../visualizations/FITSViewerCanvas';
import { api } from '../services/api';

export default function CitizenScience() {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [isRealMotion, setIsRealMotion] = useState(true);
  const [motionDirection, setMotionDirection] = useState('North-West');
  const [isVariableBrightness, setIsVariableBrightness] = useState(false);
  const [isImageArtifact, setIsImageArtifact] = useState(false);
  const [artifactType, setArtifactType] = useState('None');
  const [confidenceRating, setConfidenceRating] = useState(4);
  const [notes, setNotes] = useState('');
  const [userIdentifier, setUserIdentifier] = useState('citizen_astronomer');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Frame data for visual inspection
  const [frameData, setFrameData] = useState(null);

  useEffect(() => {
    api.getCandidates().then((data) => {
      setCandidates(data);
      if (data && data.length > 0) {
        selectCandidate(data[0]);
      }
    }).catch(console.error);
  }, []);

  const selectCandidate = async (cand) => {
    setSelectedCandidate(cand);
    setSubmittedSuccess(false);
    setLoading(true);
    try {
      const statsRes = await api.getCandidateDetails(cand.candidate_id);
      setStats(statsRes);

      // Load sample image
      const imgRes = await api.getImageDetails("default", cand.ra_deg, cand.dec_deg, 3.0);
      setFrameData(imgRes.raw_grid);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setSubmitting(true);
    try {
      await api.submitClassification(selectedCandidate.candidate_id, {
        candidate_id: selectedCandidate.candidate_id,
        user_identifier: userIdentifier,
        is_real_motion: isRealMotion,
        motion_direction: motionDirection,
        is_variable_brightness: isVariableBrightness,
        is_image_artifact: isImageArtifact,
        artifact_type: artifactType,
        confidence_rating: confidenceRating,
        notes: notes
      });
      setSubmittedSuccess(true);
      // Reload stats
      const updated = await api.getCandidateDetails(selectedCandidate.candidate_id);
      setStats(updated);
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="border-b border-space-border/60 pb-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">
            Citizen Discovery Network
          </h1>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Review machine-flagged SPHEREx candidates, classify physical movement vs. image artifacts, and build consensus discoveries.
        </p>
      </div>

      {/* Main Grid: Candidate Queue (4 cols) & Review Workspace (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Review Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="astro-card p-4 rounded-2xl flex flex-col h-[640px]">
            <h2 className="text-xs font-bold text-white mb-2 pb-2 border-b border-space-border/60 flex items-center justify-between">
              <span>Active Review Queue</span>
              <span className="text-emerald-400 font-mono text-[11px]">{candidates.length} Available</span>
            </h2>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {candidates.map((cand) => {
                const isSelected = selectedCandidate?.candidate_id === cand.candidate_id;
                return (
                  <div
                    key={cand.candidate_id}
                    onClick={() => selectCandidate(cand)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                        : 'bg-space-850/60 border-space-border hover:bg-space-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{cand.target_name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-950 text-cyan-300 border border-space-border">
                        Index: {cand.anomaly_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium">
                      {cand.badge}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      RA: {cand.ra_deg.toFixed(3)}° • Dec: {cand.dec_deg.toFixed(3)}°
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Review Card & Form (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {selectedCandidate && (
            <div className="astro-card p-6 rounded-2xl space-y-5">
              
              {/* Candidate Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-space-border/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {selectedCandidate.candidate_id}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      RA: {selectedCandidate.ra_deg}° • Dec: {selectedCandidate.dec_deg}°
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {selectedCandidate.target_name}
                  </h3>
                </div>

                {/* Consensus Stats Pill */}
                <div className="flex items-center gap-4 text-xs font-mono bg-space-950 p-3 rounded-xl border border-space-border">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400">Total Votes</div>
                    <div className="text-white font-bold">{stats?.total_votes || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400">Motion Consensus</div>
                    <div className="text-emerald-400 font-bold">
                      {stats?.total_votes ? `${Math.round((stats.motion_votes / stats.total_votes) * 100)}%` : '--'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400">Rating</div>
                    <div className="text-amber-400 font-bold">★ {stats?.consensus_rating || 0}/5</div>
                  </div>
                </div>
              </div>

              {/* FITS Visual Inspection Window */}
              <div className="h-64 rounded-xl overflow-hidden border border-space-border">
                <FITSViewerCanvas
                  imageData={frameData}
                  title={`Visual Inspection: ${selectedCandidate.target_name}`}
                  colormap="inferno"
                />
              </div>

              {/* Interactive Citizen Review Form */}
              <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
                
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Your Scientific Classification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Motion Assessment */}
                  <div className="p-3.5 rounded-xl bg-space-950 border border-space-border space-y-2">
                    <label className="block text-xs font-semibold text-slate-200">
                      1. Physical Movement?
                    </label>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsRealMotion(true)}
                        className={`flex-1 py-1.5 rounded-lg border font-medium ${isRealMotion ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-space-850 text-slate-400 border-space-border'}`}
                      >
                        Yes, Moving
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRealMotion(false)}
                        className={`flex-1 py-1.5 rounded-lg border font-medium ${!isRealMotion ? 'bg-space-800 text-slate-200 border-space-border' : 'bg-space-850 text-slate-400 border-space-border'}`}
                      >
                        Stationary
                      </button>
                    </div>
                  </div>

                  {/* Brightness Variation */}
                  <div className="p-3.5 rounded-xl bg-space-950 border border-space-border space-y-2">
                    <label className="block text-xs font-semibold text-slate-200">
                      2. Flux Variation?
                    </label>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsVariableBrightness(true)}
                        className={`flex-1 py-1.5 rounded-lg border font-medium ${isVariableBrightness ? 'bg-violet-500/20 text-violet-300 border-violet-500/50' : 'bg-space-850 text-slate-400 border-space-border'}`}
                      >
                        Variable
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsVariableBrightness(false)}
                        className={`flex-1 py-1.5 rounded-lg border font-medium ${!isVariableBrightness ? 'bg-space-800 text-slate-200 border-space-border' : 'bg-space-850 text-slate-400 border-space-border'}`}
                      >
                        Constant
                      </button>
                    </div>
                  </div>

                  {/* Image Artifact */}
                  <div className="p-3.5 rounded-xl bg-space-950 border border-space-border space-y-2">
                    <label className="block text-xs font-semibold text-slate-200">
                      3. False Alarm Artifact?
                    </label>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsImageArtifact(true)}
                        className={`flex-1 py-1.5 rounded-lg border font-medium ${isImageArtifact ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' : 'bg-space-850 text-slate-400 border-space-border'}`}
                      >
                        Artifact
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsImageArtifact(false)}
                        className={`flex-1 py-1.5 rounded-lg border font-medium ${!isImageArtifact ? 'bg-space-800 text-slate-200 border-space-border' : 'bg-space-850 text-slate-400 border-space-border'}`}
                      >
                        Clean Data
                      </button>
                    </div>
                  </div>

                </div>

                {/* Observer Notes & Confidence */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Observer Notes & Physical Explanation
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Consistent displacement across epochs; matches Gaia high proper motion."
                      className="w-full px-3 py-2 rounded-xl bg-space-950 border border-space-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Confidence (1-5)
                    </label>
                    <select
                      value={confidenceRating}
                      onChange={(e) => setConfidenceRating(parseInt(e.target.value))}
                      className="w-full px-2 py-2 rounded-xl bg-space-950 border border-space-border text-xs text-white font-mono"
                    >
                      <option value="5">5 (Certain)</option>
                      <option value="4">4 (High)</option>
                      <option value="3">3 (Moderate)</option>
                      <option value="2">2 (Uncertain)</option>
                      <option value="1">1 (Speculative)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-lg disabled:opacity-50 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? "Saving..." : "Submit"}</span>
                    </button>
                  </div>

                </div>

                {submittedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Classification recorded in persistent database! Community consensus updated.</span>
                  </div>
                )}

              </form>

              {/* Recent Community Submissions Feed */}
              <div className="pt-4 border-t border-space-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Recent Community Submissions ({stats?.classifications?.length || 0})</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Database: SQLite (spherex.db)
                  </span>
                </div>

                {stats?.classifications && stats.classifications.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {stats.classifications.slice().reverse().map((rev) => (
                      <div key={rev.id} className="p-3 rounded-xl bg-space-950/80 border border-space-border/70 text-xs space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-bold text-cyan-300">@{rev.user_identifier}</span>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="text-[10px] text-slate-400">{rev.submitted_at_utc ? new Date(rev.submitted_at_utc).toLocaleString() : 'Just now'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            <span className="text-amber-400 font-bold">★ {rev.confidence_rating}/5</span>
                            {rev.is_real_motion === 1 && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                Motion: {rev.motion_direction || 'Detected'}
                              </span>
                            )}
                            {rev.is_variable_brightness === 1 && (
                              <span className="px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/30">
                                Variable
                              </span>
                            )}
                            {rev.is_image_artifact === 1 && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                Artifact
                              </span>
                            )}
                          </div>
                        </div>
                        {rev.notes && (
                          <p className="text-slate-300 text-xs italic pl-2 border-l-2 border-cyan-500/30">
                            "{rev.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-space-950/50 border border-space-border text-center text-xs text-slate-400 font-mono">
                    No community reviews submitted yet for this target. Be the first to classify!
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
