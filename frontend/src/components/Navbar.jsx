import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Telescope, 
  Clock, 
  Activity, 
  Layers, 
  Sparkles, 
  Globe2, 
  BookOpen, 
  FileCheck2, 
  Users, 
  Radio,
  Sun,
  Moon,
  AlertTriangle,
  Server,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

const navItems = [
  { name: 'Mission Control', path: '/', icon: Radio },
  { name: 'Sky Explorer', path: '/explorer', icon: Telescope },
  { name: 'Time Machine', path: '/time-machine', icon: Clock },
  { name: 'Spectral Lab', path: '/spectral-lab', icon: Activity },
  { name: 'Image Lab', path: '/image-lab', icon: Layers },
  { name: 'Discovery Engine', path: '/discovery', icon: Sparkles },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Multi-Mission', path: '/multi-mission', icon: Globe2 },
  { name: 'Research Library', path: '/research', icon: BookOpen },
  { name: 'Evidence Passport', path: '/passport', icon: FileCheck2 },
  { name: 'Citizen Science', path: '/citizen', icon: Users },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    const checkStatus = () => {
      api.getHealth()
        .then(() => { if (mounted) setBackendOnline(true); })
        .catch(() => { if (mounted) setBackendOnline(false); });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-space-950/85 backdrop-blur-md border-b border-space-border/80 transition-colors duration-300">
      {/* Backend Offline Warning Banner */}
      {!backendOnline && (
        <div className="bg-rose-500/90 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
            <span>
              <strong>FastAPI Backend Offline:</strong> Port 8000 is not reachable. In a new terminal run: <code className="bg-black/30 px-2 py-0.5 rounded font-mono">cd backend; python -m uvicorn app.main:app --reload --port 8000</code> or launch <code className="bg-black/30 px-2 py-0.5 rounded font-mono">start.bat</code>.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-600/30 border border-cyan-500/40 group-hover:border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all">
              <Telescope className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-black tracking-wider text-base bg-gradient-to-r from-slate-950 via-cyan-800 to-blue-900 dark:from-cyan-400 dark:via-sky-300 dark:to-violet-400 bg-clip-text text-transparent">
                  COSMOSCOPE
                </span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-tight">
                Explore the changing universe • 0.75 – 5.0 µm All-Sky Platform
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${isActive 
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)] font-semibold' 
                      : 'text-slate-300 hover:text-white hover:bg-space-850 border border-transparent'}
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Controls: Theme Toggle & IRSA Badge */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-xl bg-space-900 border border-space-border text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center justify-center shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-violet-500" />
              )}
            </button>

            {/* Backend & IRSA Live Connection Pill */}
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-mono transition-colors ${
              backendOnline 
                ? 'bg-space-900 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-950/40 border-rose-500/40 text-rose-400 animate-pulse'
            }`}>
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="hidden sm:inline">{backendOnline ? 'IRSA & API LIVE' : 'BACKEND OFFLINE'}</span>
              <span className="text-slate-400">{backendOnline ? 'QR2/QR3' : 'PORT 8000'}</span>
            </div>
          </div>

        </div>

        {/* Mobile/Tablet Secondary Bar */}
        <div className="xl:hidden flex overflow-x-auto py-2 space-x-2 border-t border-space-border/50 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap
                  ${isActive 
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40' 
                    : 'text-slate-300 hover:bg-space-850'}
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

      </div>
    </header>
  );
}
