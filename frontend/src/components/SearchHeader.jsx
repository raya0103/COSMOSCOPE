import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Compass, Sparkles, CheckCircle2, HelpCircle, Layers, Filter } from 'lucide-react';
import { api } from '../services/api';
import { 
  CELESTIAL_CATALOG, 
  CHALLENGE_TARGETS, 
  CELESTIAL_CATEGORIES, 
  findTargetByCoords, 
  getTargetsByCategory 
} from '../data/celestialCatalog';

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
  const [activeCategory, setActiveCategory] = useState("challenge");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Synchronize state when initial props change
  useEffect(() => {
    setRa(initialRa);
    setDec(initialDec);
    setTargetName(initialName);
    if (initialFov !== undefined && initialFov !== null) {
      setFov(parseFloat(initialFov));
    }
  }, [initialRa, initialDec, initialName, initialFov]);

  // Click outside suggestions listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time Celestial Target Recognition from coordinates
  const matchedTarget = useMemo(() => {
    return findTargetByCoords(ra, dec, 0.08);
  }, [ra, dec]);

  // If coordinates match a known catalog target, synchronize target name
  useEffect(() => {
    if (matchedTarget) {
      setTargetName(matchedTarget.name);
      const prefix = matchedTarget.isChallengeTarget ? "NASA Challenge Target" : "Verified Catalog Object";
      setIdentSource(`${prefix} (${matchedTarget.badge}, within ${matchedTarget.sepArcmin}′)`);
    } else {
      if (CELESTIAL_CATALOG.some(p => p.name === targetName)) {
        const numRa = parseFloat(ra);
        const numDec = parseFloat(dec);
        if (!isNaN(numRa) && !isNaN(numDec)) {
          setTargetName(`RA ${numRa.toFixed(4)}°, Dec ${numDec.toFixed(4)}°`);
          setIdentSource('Coordinate search (outside catalog tolerance)');
        }
      }
    }
  }, [matchedTarget]);

  // Filtered target presets based on selected category tab
  const displayedPresets = useMemo(() => {
    return getTargetsByCategory(activeCategory);
  }, [activeCategory]);

  // Autocomplete suggestions based on input text
  const suggestions = useMemo(() => {
    if (!targetName || targetName.length < 2 || targetName.startsWith("RA ")) return [];
    const q = targetName.toLowerCase();
    return CELESTIAL_CATALOG.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.id.toLowerCase().includes(q) || 
      t.designations.some(d => d.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [targetName]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setShowSuggestions(false);
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
    if (matchedTarget) {
      finalName = matchedTarget.name;
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
    setShowSuggestions(false);
    setRa(preset.ra.toString());
    setDec(preset.dec.toString());
    setTargetName(preset.name);
    const tag = preset.isChallengeTarget ? "NASA Challenge Target" : "Catalog Target";
    setIdentSource(`${tag}: ${preset.name} (${preset.badge})`);
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
      
      {/* Category Tabs & Quick Target Selector */}
      <div className="mb-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-space-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Catalog:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {CELESTIAL_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-space-800'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="text-[10px] opacity-70">({cat.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Pick Target Chips */}
        <div className="flex flex-wrap gap-1.5 max-h-[96px] overflow-y-auto pr-1">
          {displayedPresets.map((p) => {
            const isSelected = matchedTarget?.name === p.name || targetName === p.name;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)] font-semibold'
                    : 'bg-space-850 text-slate-300 border-space-border hover:bg-space-800 hover:text-white'
                }`}
                title={`${p.name} (${p.type}) in ${p.constell}`}
              >
                {p.isChallengeTarget && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" title="NASA Challenge Target" />
                )}
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
        
        {/* Target / Object Designation with Autocomplete */}
        <div className="md:col-span-3 relative" ref={suggestionsRef}>
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
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setTargetName(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="e.g. Barnard's Star, Proxima, HL Tau"
            className="w-full px-3 py-2 rounded-xl bg-space-950 border border-space-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
          />

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-space-900 border border-space-border rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-space-800">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectPreset(item)}
                  className="p-2.5 hover:bg-space-800/80 cursor-pointer transition-colors flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      {item.isChallengeTarget && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                          NASA Challenge
                        </span>
                      )}
                      <span>{item.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{item.type} • {item.constell}</div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-space-950 px-2 py-0.5 rounded border border-space-800">
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          )}
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
