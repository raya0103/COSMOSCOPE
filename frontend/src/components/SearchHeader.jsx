import React, { useState } from 'react';
import { Search, Compass, Sparkles, AlertCircle } from 'lucide-react';

const CHALLENGE_PRESETS = [
  { name: "Barnard's Star", ra: "269.45208", dec: "4.69333", badge: "Proper Motion" },
  { name: "Epsilon Indi B", ra: "331.04375", dec: "-56.78278", badge: "Brown Dwarf" },
  { name: "WISE 0855", ra: "133.79513", dec: "-7.24515", badge: "Water Ice" },
  { name: "RW Aurigae", ra: "76.95642", dec: "30.40142", badge: "Variable YSO" },
  { name: "R Draconis", ra: "248.16750", dec: "66.75500", badge: "Mira Giant" },
];

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

  React.useEffect(() => {
    setRa(initialRa);
    setDec(initialDec);
    setTargetName(initialName);
    if (initialFov !== undefined && initialFov !== null) {
      setFov(parseFloat(initialFov));
    }
  }, [initialRa, initialDec, initialName, initialFov]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!ra || !dec) return;
    onSearch({ ra, dec, fov_arcmin: parseFloat(fov), target_name: targetName });
  };

  const handleSelectPreset = (preset) => {
    setRa(preset.ra);
    setDec(preset.dec);
    setTargetName(preset.name);
    onSearch({ ra: preset.ra, dec: preset.dec, fov_arcmin: parseFloat(fov), target_name: preset.name });
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
          {CHALLENGE_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                targetName === p.name
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-space-850 text-slate-300 border-space-border hover:bg-space-800 hover:text-white'
              }`}
            >
              <span>{p.name}</span>
              <span className="text-[10px] text-slate-400 opacity-75">({p.badge})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Coordinate Search Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        
        {/* Target / Object Designation */}
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Target Designation
          </label>
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
