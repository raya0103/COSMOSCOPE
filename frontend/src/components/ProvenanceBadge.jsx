import React, { useState } from 'react';
import { 
  CheckCircle2, 
  BookOpen, 
  Calculator, 
  GitCommit, 
  Cpu, 
  HelpCircle, 
  Info,
  ExternalLink 
} from 'lucide-react';

const TIER_CONFIG = {
  MEASURED: {
    label: 'MEASURED',
    icon: CheckCircle2,
    badgeClasses: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25',
    dotColor: 'bg-emerald-400',
    title: 'Authentic Observational Data',
    defaultSource: 'NASA/IPAC IRSA SPHEREx Archive (QR2 Level 2)',
    description: 'Direct detector counts, calibrated surface brightness (MJy/sr), or raw observational timestamps extracted without parametric modeling.'
  },
  CATALOGUED: {
    label: 'CATALOGUED',
    icon: BookOpen,
    badgeClasses: 'bg-blue-500/15 text-blue-400 border-blue-500/40 hover:bg-blue-500/25',
    dotColor: 'bg-blue-400',
    title: 'Astronomical Catalogue Crossmatch',
    defaultSource: 'Gaia DR3 / AllWISE / SIMBAD Database',
    description: 'Astrometric positions, proper motions, parallax distances, or legacy multi-band magnitudes retrieved from authoritative external surveys.'
  },
  CALCULATED: {
    label: 'CALCULATED',
    icon: Calculator,
    badgeClasses: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/25',
    dotColor: 'bg-cyan-400',
    title: 'Mathematically Derived Data',
    defaultSource: 'Astropy Astrometric & Photometric Analysis',
    description: 'Derived via mathematical transformation from measured or catalogue inputs (e.g. synthetic aperture flux integration, WCS reprojection, background MAD noise).'
  },
  INTERPOLATED: {
    label: 'INTERPOLATED',
    icon: GitCommit,
    badgeClasses: 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25',
    dotColor: 'bg-amber-400',
    title: 'Estimated Continuum Interpolation',
    defaultSource: 'Multi-Band Spline Continuum Approximation',
    description: 'Estimated between discrete measured wavelength channels or temporal visits where direct detector coverage is absent.'
  },
  SIMULATED: {
    label: 'SIMULATED',
    icon: Cpu,
    badgeClasses: 'bg-purple-500/15 text-purple-400 border-purple-500/40 hover:bg-purple-500/25',
    dotColor: 'bg-purple-400',
    title: 'Scientific Model / Synthetic Baseline',
    defaultSource: 'Theoretical Stellar / Atmospheric Physics Model',
    description: 'Generated using parametric light curve formulations, synthetic SED templates, or simulated SPHEREx detector response curves.'
  },
  UNAVAILABLE: {
    label: 'UNAVAILABLE',
    icon: HelpCircle,
    badgeClasses: 'bg-slate-700/40 text-slate-400 border-slate-600/40 hover:bg-slate-700/60',
    dotColor: 'bg-slate-500',
    title: 'Data Unavailable',
    defaultSource: 'Archive Coverage Gap',
    description: 'Target falls outside the instantaneous survey footprint or lacks calibrated products in the queried data release.'
  }
};

export default function ProvenanceBadge({
  tier = 'MEASURED',
  source,
  method,
  uncertainty,
  className = '',
  size = 'sm',
  showDetails = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const normalizedTier = (tier || 'MEASURED').toUpperCase();
  const config = TIER_CONFIG[normalizedTier] || TIER_CONFIG.MEASURED;
  const IconComponent = config.icon;

  const sizeClasses = size === 'xs' 
    ? 'text-[9px] px-1.5 py-0.5 gap-1' 
    : size === 'md'
    ? 'text-xs px-2.5 py-1 gap-1.5 font-medium'
    : 'text-[10px] px-2 py-0.5 gap-1.2 font-medium';

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (showDetails) setIsOpen(!isOpen);
        }}
        onMouseEnter={() => showDetails && setIsOpen(true)}
        onMouseLeave={() => showDetails && setIsOpen(false)}
        className={`inline-flex items-center rounded-full border transition-all duration-150 uppercase tracking-wider font-mono select-none cursor-pointer ${config.badgeClasses} ${sizeClasses}`}
        title={`Provenance: ${config.title}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
        <IconComponent className="w-3 h-3 stroke-[2.2]" />
        <span>{config.label}</span>
        {showDetails && (
          <Info className="w-2.5 h-2.5 opacity-60 ml-0.5" />
        )}
      </button>

      {/* Popover / Tooltip */}
      {showDetails && isOpen && (
        <div 
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 rounded-lg bg-[#071225]/95 backdrop-blur-md border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 text-left normal-case pointer-events-auto"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
              <span className="text-[11px] font-bold text-slate-100 tracking-wide font-mono uppercase">
                [{config.label}] {config.title}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
            {config.description}
          </p>

          <div className="space-y-1 text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
            <div>
              <span className="text-cyan-400 font-semibold">Source: </span>
              <span className="text-slate-200">{source || config.defaultSource}</span>
            </div>
            {method && (
              <div>
                <span className="text-purple-400 font-semibold">Method: </span>
                <span className="text-slate-200">{method}</span>
              </div>
            )}
            {uncertainty && (
              <div>
                <span className="text-amber-400 font-semibold">Uncertainty: </span>
                <span className="text-slate-200 font-mono">{uncertainty}</span>
              </div>
            )}
          </div>

          <div className="mt-2 text-[9px] text-slate-500 flex items-center justify-between">
            <span>NASA/SPHEREx Data Integrity Standard</span>
            <span className="text-cyan-400/80">Tier 1-6</span>
          </div>
        </div>
      )}
    </div>
  );
}
