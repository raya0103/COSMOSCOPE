import React, { useState, useEffect, useMemo } from 'react';
import { Search, Compass, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import { api } from '../services/api';

const CHALLENGE_PRESETS = [
  { id: "barnards-star", name: "Barnard's Star", ra: 269.45208, dec: 4.69333, badge: "Proper Motion" },
  { id: "epsilon-indi-b", name: "Epsilon Indi B", ra: 331.04375, dec: -56.78278, badge: "Brown Dwarf" },
  { id: "wise-0855", name: "WISE 0855", ra: 133.79513, dec: -7.24515, badge: "Water Ice" },
  { id: "rw-aurigae", name: "RW Aurigae", ra: 76.95642, dec: 30.40142, badge: "Variable YSO" },
  { id: "r-draconis", name: "R Draconis", ra: 248.16750, dec: 66.75500, badge: "Mira Giant" },
];

function computeAngularSeparationDeg(ra1, dec1, ra2, dec2) {
  const rad = Math.PI / 180;
  const d1 = dec1 * rad;
  const d2 = dec2 * rad;
  const da = (ra2 - ra1) * rad;
  const dd = (dec2 - dec1) * rad;
  const a = Math.sin(dd / 2) ** 2 + Math.cos(d1) * Math.cos(d2) * (Math.sin(da / 2) ** 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  return c / rad;
}

export default function SearchHeader({ 
  onSearch, 
  loading = false, 
  initialRa = "269.45208", 
  initialDec = "4.69333", 
  initialName = "Barnard's Star",
  initialFov = 3.0
}) {
  const [ra, setRa] = useState(initialRa);
  const [dec, setDec] = useState(initialDec);
  const [fov, setFov] = useState(initialFov);
  const [targetName, setTargetName] = useState(initialName);
  const [identSource, setIdentSource] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Synchronize state when initial props change
  useEffect(() => {
    setRa(initialRa);
    setDec(initialDec);
    setTargetName(initialName);
    if (initialFov !== undefined && initialFov !== null) {
      setFov(parseFloat(initialFov));
    }
  }, [initialRa, initialDec, initialName, initialFov]);

  // Real-time Challenge Target Recognition from coordinates
  const matchedChallenge = useMemo(() => {
    const numRa = parseFloat(ra);
    const numDec = parseFloat(dec);
    if (isNaN(numRa) || isNaN(numDec)) return null;

    for (const p of CHALLENGE_PRESETS) {
      const sepDeg = computeAngularSeparationDeg(numRa, numDec, p.ra, p.dec);
      // Tolerance: 0.08° (~4.8 arcminutes / 288 arcseconds)
      if (sepDeg <= 0.08) {
        return {
          ...p,
          sepArcsec: (sepDeg * 3600).toFixed(1),
          sepArcmin: (sepDeg * 60).toFixed(2)
        };
      }
    }
    return null;
  }, [ra, dec]);

  // If coordinates match a challenge target, synchronize target name
  useEffect(() => {
    if (matchedChallenge) {
      setTargetName(matchedChallenge.name);
      setIdentSource(`NASA Challenge Target (within ${matchedChallenge.sepArcmin}′ tolerance)`);
    } else {
      if (CHALLENGE_PRESETS.some(p => p.name === targetName)) {
        // If moved away from the challenge target, mark as uncatalogued or coordinate field
        const numRa = parseFloat(ra);
        const numDec = parseFloat(dec);
        if (!isNaN(numRa) && !isNaN(numDec)) {
          setTargetName(`RA ${numRa.toFixed(4)}°, Dec ${numDec.toFixed(4)}°`);
          setIdentSource('Coordinate search (outside challenge tolerance)');
        }
      }
    }
  }, [matchedChallenge]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setValidationError(null);

    const numRa = parseFloat(ra);
    const numDec = parseFloat(dec);

    if (isNaN(numRa) || numRa < 0 || numRa > 360) {
      setValidationError("Right Ascension must be between 0.0° and 360.0°");
      return;
    }
    if (isNaN(numDec) || numDec < -90 || numDec > 90) {
      setValidationError("Declination must be between -90.0° and +90.0°");
      return;
    }

    let finalName = targetName;
    if (matchedChallenge) {
      finalName = matchedChallenge.name;
    } else if (!finalName || finalName.trim() === "" || finalName.startsWith("RA ")) {
      // Query coordinate identification endpoint
      try {
        const ident = await api.identifyCoordinates(numRa, numDec, 60.0);
        if (ident && ident.matched) {
          finalName = ident.designation;
          setTargetName(finalName);
          setIdentSource(`${ident.identification_source} (within ${(ident.separation_arcsec || 0).toFixed(1)}″)`);
        } else {
          finalName = `RA ${numRa.toFixed(4)}°, Dec ${numDec.toFixed(4)}°`;
          setTargetName(finalName);
          setIdentSource('Uncatalogued Field Position');
        }
      } catch (err) {
        console.warn("Coordinate identification lookup failed:", err);
      }
    }

    onSearch({
      ra: numRa.toString(),
      dec: numDec.toString(),
      fov_arcmin: parseFloat(fov),
      target_name: finalName
    });
  };

  const handleSelectPreset = (preset) => {
    setRa(preset.ra.toString());
    setDec(preset.dec.toString());
    setTargetName(preset.name);
    setIdentSource(`NASA Challenge Target: ${preset.name}`);
    setValidationError(null);
    onSearch({
      ra: preset.ra.toString(),
      dec: preset.dec.toString(),
      fov_arcmin: parseFloat(fov),
      target_name: preset.name
    });
  };

  return (
    <div className="bg-space-900/90 rounded-2xl border border-space-border p-5 backdrop-blur-md shadow-2xl">
      
      {/* Challenge Target Quick Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Challenge Targets:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {CHALLENGE_PRESETS.map((p) => {
            const isSelected = matchedChallenge?.name === p.name || targetName === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)] font-semibold'
                    : 'bg-space-850 text-slate-300 border-space-border hover:bg-space-800 hover:text-white'
                }`}
              >
                <span>{p.name}</span>
                <span className="text-[10px] text-slate-400 opacity-75">({p.badge})</span>
              </button>
            );
          })}
        </div>
      </div>

      {validationError && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Coordinate Search Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        
        {/* Target / Object Designation */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-300">
              Target Designation
            </label>
            {identSource && (
              <span className="text-[10px] text-cyan-400 font-mono truncate max-w-[150px]" title={identSource}>
                {identSource}
              </span>
            )}
          </div>
          <input
            type="text"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            placeholder="e.g. Barnard's Star, M101"
            className="w-full px-3 py-2 rounded-xl bg-space-950 border border-space-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
          />
        </div>

        {/* Right Ascension */}
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Right Ascension (RA)
          </label>
          <input
            type="text"
            value={ra}
            onChange={(e) => setRa(e.target.value)}
            placeholder="269.45208 or 17h57m48.5s"
            className="w-full px-3 py-2 rounded-xl bg-space-950 border border-space-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
            required
          />
        </div>

        {/* Declination */}
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Declination (Dec)
          </label>
          <input
            type="text"
            value={dec}
            onChange={(e) => setDec(e.target.value)}
            placeholder="+04.69333 or +04d41m36s"
            className="w-full px-3 py-2 rounded-xl bg-space-950 border border-space-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
            required
          />
        </div>

        {/* Field of View (FOV) */}
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            FOV
          </label>
          <select
            value={fov}
            onChange={(e) => setFov(parseFloat(e.target.value))}
            className="w-full px-2 py-2 rounded-xl bg-space-950 border border-space-border text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="1.0">1.0′</option>
            <option value="3.0">3.0′</option>
            <option value="6.0">6.0′</option>
            <option value="15.0">15.0′</option>
          </select>
        </div>

        {/* Search Action */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Querying IRSA...
              </span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search SPHEREx</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
