import React, { useState } from 'react';
import { 
  FileDown, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  Layers, 
  ExternalLink, 
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';

export default function TutorialGuideSection() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);

    try {
      // First attempt: API endpoint which dynamically builds or streams the verified PDF
      let response;
      try {
        response = await fetch('/api/tutorial/download');
      } catch (err) {
        console.warn('API endpoint unavailable, falling back to static guide asset...', err);
      }

      // If API fails or is not ok, fallback gracefully to static asset
      if (!response || !response.ok) {
        response = await fetch('/COSMOSCOPE_Complete_User_Guide.pdf');
      }

      if (!response.ok) {
        throw new Error(`Failed to download tutorial guide (HTTP ${response.status})`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'COSMOSCOPE_Complete_User_Guide.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 6000);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadError(err.message || 'Unable to download tutorial PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div id="tutorial" className="mt-16 pt-12 border-t border-cyan-500/20">
      <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#071225]/90 via-[#0B1730]/85 to-[#071225]/90 backdrop-blur-xl border border-cyan-500/30 shadow-[0_12px_45px_rgba(0,0,0,0.45)] overflow-hidden">
        
        {/* Subtle Ambient Glow Elements */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
          
          {/* Left Column: Heading, Description, and Badges */}
          <div className="space-y-5 text-center lg:text-left max-w-2xl">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B1730] border border-cyan-500/40 text-[#36DDF5] text-xs font-semibold tracking-widest uppercase shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-[#36DDF5]" />
              Complete User Guide · PDF
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#F5F8FF] tracking-tight">
              Your Guide to <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">Exploring the Universe</span>
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#C4D0E0] font-light leading-relaxed">
              New to COSMOSCOPE? Learn how to navigate the platform, explore astronomical observations, analyze cosmic changes, and understand every scientific tool with our complete beginner-friendly guide.
            </p>

            {/* Feature Highlights Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
              <span className="px-3 py-1 rounded-xl bg-[#0B1730]/90 border border-cyan-500/30 text-[#C4D0E0] flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                16 Comprehensive Chapters
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#0B1730]/90 border border-violet-500/30 text-[#C4D0E0] flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                Step-by-Step Workflows
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#0B1730]/90 border border-emerald-500/30 text-[#C4D0E0] flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Beginner Glossary
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#0B1730]/90 border border-sky-500/30 text-[#C4D0E0] flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                6-Tier Provenance System
              </span>
            </div>
          </div>

          {/* Right Column: Download Card & Action */}
          <div className="flex flex-col items-center sm:items-end justify-center w-full lg:w-auto flex-shrink-0 space-y-4">
            
            {/* Primary Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold tracking-wide uppercase transition-all duration-300 shadow-xl ${
                isDownloading
                  ? 'bg-slate-700 text-slate-300 cursor-wait opacity-80'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 text-slate-950 shadow-[0_0_30px_rgba(0,240,255,0.35)] hover:shadow-[0_0_45px_rgba(0,240,255,0.6)] hover:scale-105 active:scale-95'
              }`}
              title="Download Complete Tutorial PDF"
              aria-label="Download Complete Tutorial PDF"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
                  <span>Preparing & Downloading PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5 text-slate-950" />
                  <span>Download Complete Tutorial PDF</span>
                </>
              )}
            </button>

            {/* Secondary Direct Link & Document Specifications */}
            <div className="text-center sm:text-right space-y-1">
              <div className="text-xs font-mono text-[#91A3BA] flex items-center justify-center sm:justify-end gap-2">
                <span>PDF Format · A4 Edition · 9 Pages</span>
                <span>•</span>
                <a
                  href="/COSMOSCOPE_Complete_User_Guide.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#36DDF5] hover:underline flex items-center gap-1"
                >
                  <span>Open in Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-[#91A3BA]/80 font-light">
                Standard publication manual with bookmarks, tables, and glossaries.
              </p>
            </div>

            {/* Success Feedback Banner */}
            {downloadSuccess && (
              <div className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Downloaded <code>COSMOSCOPE_Complete_User_Guide.pdf</code> successfully!</span>
              </div>
            )}

            {/* Error Feedback Banner */}
            {downloadError && (
              <div className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
