import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Download, RefreshCw, BarChart2 } from 'lucide-react';

export default function PlotlyChart({
  data = [],
  layout = {},
  config = {},
  className = "",
  title = "",
  height = 260,
  downloadFileName = "cosmoscope_scientific_plot"
}) {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [plotlyLoaded, setPlotlyLoaded] = useState(typeof window !== 'undefined' && !!window.Plotly);

  // Check if Plotly is loaded on window
  useEffect(() => {
    if (window.Plotly) {
      setPlotlyLoaded(true);
      return;
    }

    const interval = setInterval(() => {
      if (window.Plotly) {
        setPlotlyLoaded(true);
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Render or Update Plotly
  useEffect(() => {
    if (!plotlyLoaded || !containerRef.current || !window.Plotly) return;

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#070D1E' : '#ffffff';
    const paperColor = isDark ? '#0b132b' : '#f8fafc';
    const textColor = isDark ? '#e2e8f0' : '#1e293b';
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(203, 213, 225, 0.6)';

    // Enforce explicit height so Plotly NEVER defaults to 450px and overflows
    const effectiveHeight = height || (layout && layout.height) || 260;

    const defaultLayout = {
      autosize: true,
      paper_bgcolor: paperColor,
      plot_bgcolor: bgColor,
      font: {
        family: 'Inter, system-ui, sans-serif',
        color: textColor,
        size: 11
      },
      margin: { l: 55, r: 25, t: 20, b: 40 },
      xaxis: {
        gridcolor: gridColor,
        zerolinecolor: gridColor,
        tickfont: { color: textColor, size: 10 },
        title: { font: { color: textColor, size: 11 } }
      },
      yaxis: {
        gridcolor: gridColor,
        zerolinecolor: gridColor,
        tickfont: { color: textColor, size: 10 },
        title: { font: { color: textColor, size: 11 } }
      },
      hoverlabel: {
        bgcolor: isDark ? '#020617' : '#ffffff',
        bordercolor: '#00F0FF',
        font: { family: 'JetBrains Mono, monospace', color: isDark ? '#ffffff' : '#020617', size: 11 }
      },
      ...layout,
      height: effectiveHeight // Explicitly lock height to prevent 450px overflow
    };

    const defaultConfig = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: downloadFileName,
        height: 600,
        width: 1000,
        scale: 2
      },
      ...config
    };

    window.Plotly.newPlot(containerRef.current, data, defaultLayout, defaultConfig)
      .then(() => setIsReady(true))
      .catch(console.error);

    const handleResize = () => {
      if (containerRef.current && window.Plotly) {
        try {
          window.Plotly.Plots.resize(containerRef.current);
        } catch (e) {}
      }
    };

    window.addEventListener('resize', handleResize);

    // ResizeObserver ensures Plotly resizes when accordion or container expands
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerRef.current);
    }

    // Trigger an additional resize after initial render to catch expansion animation finishes
    const timer = setTimeout(() => {
      handleResize();
    }, 150);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearTimeout(timer);
    };
  }, [plotlyLoaded, data, layout, config, theme, title, height]);

  const handleManualDownload = () => {
    if (containerRef.current && window.Plotly) {
      window.Plotly.downloadImage(containerRef.current, {
        format: 'png',
        width: 1200,
        height: 700,
        filename: downloadFileName
      });
    }
  };

  const effectiveHeight = height || (layout && layout.height) || 260;

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-space-border/70 bg-space-900/60 shadow-lg flex flex-col">
      {/* Header bar with title and quick download */}
      {title && (
        <div className="flex-shrink-0 flex items-center justify-between px-3.5 py-2 bg-space-850/90 border-b border-space-border/60 h-[36px]">
          <div className="flex items-center gap-2 overflow-hidden">
            <BarChart2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <h4 className="text-xs font-bold tracking-wide text-slate-200 truncate">{title}</h4>
          </div>
          <button
            onClick={handleManualDownload}
            className="flex-shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded bg-space-800 hover:bg-space-700 text-[10px] font-mono text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all opacity-80 group-hover:opacity-100"
            title="Export high-resolution PNG chart"
          >
            <Download className="w-3 h-3" />
            <span>Export PNG</span>
          </button>
        </div>
      )}

      {/* Plotly Canvas Container with strict bounded height and overflow hidden */}
      <div
        ref={containerRef}
        className={`w-full overflow-hidden ${className || ''}`}
        style={{ height: `${effectiveHeight}px`, minHeight: `${effectiveHeight}px`, maxHeight: `${effectiveHeight}px` }}
      />

      {/* Loading state before Plotly script attaches */}
      {!plotlyLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-space-950/80 p-6 text-center">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
          <span className="text-xs text-slate-300 font-mono">Initializing Scientific Plotly Engine...</span>
        </div>
      )}
    </div>
  );
}

