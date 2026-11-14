import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SkyExplorer from './pages/SkyExplorer';
import CosmicTimeMachine from './pages/CosmicTimeMachine';
import SpectralLab from './pages/SpectralLab';
import ImageAnalysisLab from './pages/ImageAnalysisLab';
import DiscoveryEngine from './pages/DiscoveryEngine';
import MultiMissionExplorer from './pages/MultiMissionExplorer';
import ResearchLibrary from './pages/ResearchLibrary';
import ScientificEvidenceDossier from './pages/ScientificEvidenceDossier';
import ScientificAnalytics from './pages/ScientificAnalytics';

function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen text-slate-100 transition-colors duration-300">
      {/* On application dashboard routes, render the dashboard Navbar */}
      {!isLandingPage && <Navbar />}
      
      {/* Landing page is full-width for cinematic experience; dashboard routes have standard container constraints */}
      <main className={isLandingPage ? "flex-1 w-full" : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explorer" element={<SkyExplorer />} />
          <Route path="/time-machine" element={<CosmicTimeMachine />} />
          <Route path="/spectral-lab" element={<SpectralLab />} />
          <Route path="/image-lab" element={<ImageAnalysisLab />} />
          <Route path="/discovery" element={<DiscoveryEngine />} />
          <Route path="/analytics" element={<ScientificAnalytics />} />
          <Route path="/multi-mission" element={<MultiMissionExplorer />} />
          <Route path="/research" element={<ResearchLibrary />} />
          <Route path="/dossier" element={<ScientificEvidenceDossier />} />
          <Route path="/passport" element={<ScientificEvidenceDossier />} />
        </Routes>
      </main>

      {/* Global Footer for dashboard routes */}
      {!isLandingPage && (
        <footer className="border-t border-space-border/60 bg-space-950/90 py-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-cyan-400 text-sm tracking-wide">COSMOSCOPE</span>
              <span className="text-slate-500">•</span>
              <span>Explore the changing universe</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Data retrieved from NASA/IPAC Infrared Science Archive (IRSA), Caltech/JPL.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppLayout />
      </Router>
    </ThemeProvider>
  );
}
