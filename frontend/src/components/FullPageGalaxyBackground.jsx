import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function FullPageGalaxyBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isVisible = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Pause animation when tab is inactive to preserve CPU / GPU
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const isDark = theme === 'dark';

    // Generate ~260 realistic stars with realistic spectral types & varying depths
    const starCount = 260;
    const stars = Array.from({ length: starCount }, () => {
      const mag = Math.random();
      const depth = 0.2 + Math.random() * 0.8; // Parallax depth layer
      
      let radius;
      if (mag > 0.93) radius = 1.8 + Math.random() * 0.6; // O/B supergiant
      else if (mag > 0.75) radius = 1.2 + Math.random() * 0.4; // A/F bright star
      else if (mag > 0.4) radius = 0.8 + Math.random() * 0.3; // G/K dwarf
      else radius = 0.5 + Math.random() * 0.3; // M dwarf / faint star

      let color;
      if (isDark) {
        if (mag > 0.9) color = '#00f0ff'; // Hot cyan star
        else if (mag > 0.75) color = '#bae6fd'; // Bright sky star
        else if (mag > 0.6) color = '#ddd6fe'; // Interstellar violet
        else if (mag > 0.45) color = '#fef08a'; // Warm dwarf
        else color = '#f8fafc'; // Crisp stellar white
      } else {
        if (mag > 0.85) color = '#0284c7'; // Deep celestial cerulean
        else if (mag > 0.65) color = '#0369a1'; // Deep oceanic sky
        else if (mag > 0.45) color = '#6d28d9'; // Royal violet
        else color = '#4338ca'; // Twilight indigo
      }

      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius,
        depth,
        alpha: 0.15 + Math.random() * 0.75,
        speed: 0.005 + Math.random() * 0.015,
        color,
        hasGlow: mag > 0.88,
        driftX: (Math.random() - 0.5) * 0.04,
        driftY: (Math.random() - 0.5) * 0.03
      };
    });

    let lastScrollY = window.scrollY;

    const render = () => {
      if (isVisible) {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
          // Subtle twinkle oscillation
          star.alpha += star.speed;
          if (star.alpha > 0.95 || star.alpha < 0.15) {
            star.speed = -star.speed;
          }

          // Very subtle intrinsic drift
          star.x += star.driftX;
          star.y += star.driftY;

          // Parallax displacement on scroll based on celestial depth
          star.y -= scrollDelta * star.depth * 0.12;

          // Wrap-around screen bounds
          if (star.x < 0) star.x = canvas.width;
          if (star.x > canvas.width) star.x = 0;
          if (star.y < 0) star.y = canvas.height;
          if (star.y > canvas.height) star.y = 0;

          // Render star
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha));

          if (star.hasGlow) {
            ctx.shadowBlur = isDark ? 6 : 4;
            ctx.shadowColor = star.color;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fill();
        });

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Deep Cosmic Void Background Mesh */}
      <div className="absolute inset-0 bg-[#030712] dark:bg-[#030712] transition-colors duration-500" />

      {/* 2. Layered Milky Way Galactic Band & Interstellar Dust (Angled Cosmic Structure) */}
      {/* Dark Mode Galaxy Textures */}
      <div className="hidden dark:block absolute inset-0">
        {/* Core diagonal galactic plane */}
        <div 
          className="absolute -inset-[30%] opacity-45 bg-[radial-gradient(ellipse_at_45%_50%,rgba(0,240,255,0.12)_0%,rgba(15,23,64,0.7)_35%,rgba(20,15,48,0.5)_55%,transparent_75%)] blur-3xl transform -rotate-12 transition-opacity duration-700" 
        />
        {/* Secondary diffuse nebular dust cloud */}
        <div 
          className="absolute -inset-[20%] opacity-35 bg-[radial-gradient(ellipse_at_70%_35%,rgba(168,85,247,0.12)_0%,rgba(56,189,248,0.08)_35%,transparent_65%)] blur-2xl transform rotate-6 transition-opacity duration-700" 
        />
        {/* Ambient deep celestial indigo gradient */}
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(14,165,233,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.08)_0%,transparent_50%)]" 
        />
      </div>

      {/* Light Mode Galaxy Textures: Soft Pale Sky & Lavender Astronomical Atlas */}
      <div className="dark:hidden absolute inset-0 bg-[#f4f7fb] transition-colors duration-500">
        {/* Subtle pale sky celestial wash */}
        <div 
          className="absolute -inset-[25%] opacity-70 bg-[radial-gradient(ellipse_at_35%_45%,rgba(2,132,199,0.08)_0%,rgba(224,242,254,0.6)_35%,transparent_70%)] blur-3xl transform -rotate-12" 
        />
        {/* Subtle soft lavender galactic veil */}
        <div 
          className="absolute -inset-[20%] opacity-60 bg-[radial-gradient(ellipse_at_75%_55%,rgba(124,58,237,0.06)_0%,rgba(243,232,255,0.5)_40%,transparent_65%)] blur-2xl transform rotate-6" 
        />
        {/* Soft atmospheric gradient mesh */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[#f4f7fb]/90 via-[#edf2f8]/85 to-[#f4f7fb]/95" 
        />
      </div>

      {/* 3. Full-Page Interactive Twinkling & Parallax Starfield Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
}
