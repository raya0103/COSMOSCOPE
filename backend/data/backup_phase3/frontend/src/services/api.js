/**
 * REST API client for SPHEREx EXPLORER Backend.
 */

const BASE_URL = '/api';

async function fetchJson(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errMessage = `HTTP error ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.detail) errMessage = errData.detail;
    } catch (_) {}
    throw new Error(errMessage);
  }

  return response.json();
}

export const api = {
  getHealth: () => fetchJson('/health'),
  
  getTargets: () => fetchJson('/targets'),
  
  searchObservations: (params) => 
    fetchJson('/observations/search', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    
  getImageDetails: (obsId, ra, dec, fovArcmin = 3.0, stretch = 'asinh', colormap = 'inferno', detector = null) => {
    let url = `/images/${encodeURIComponent(obsId)}?ra=${ra}&dec=${dec}&fov_arcmin=${fovArcmin}&stretch=${stretch}&colormap=${colormap}`;
    if (detector) url += `&detector=${detector}`;
    return fetchJson(url);
  },
    
  subtractImages: (params) =>
    fetchJson('/images/subtract', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    
  stackImages: (params) =>
    fetchJson('/images/stack', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    
  extractSpectrum: (params) =>
    fetchJson('/spectra/extract', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    
  detectMotion: (params) =>
    fetchJson('/detection/motion', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    
  rankCandidateAnomaly: (params) =>
    fetchJson('/discovery/rank', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    
  crossmatchCatalogues: (params) =>
    fetchJson('/catalogue/crossmatch', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    
  getCandidates: () => fetchJson('/candidates'),
  
  getCandidateDetails: (id) => fetchJson(`/candidates/${encodeURIComponent(id)}`),
  
  submitClassification: (id, data) =>
    fetchJson(`/candidates/${encodeURIComponent(id)}/classifications`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  exportPassportPdfUrl: (ra, dec, targetName = '') =>
    `${BASE_URL}/reports/export?format=pdf&ra=${ra}&dec=${dec}&target_name=${encodeURIComponent(targetName)}`,

  // Scientific Analytics & Plotly Visualization Endpoints
  getLightCurve: (params) =>
    fetchJson('/analytics/lightcurve', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getMotionTrajectory: (params) =>
    fetchJson('/analytics/motion', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getSpectralAnalytics: (params) =>
    fetchJson('/analytics/spectrum', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getAnomalyRadar: (params) =>
    fetchJson('/analytics/radar', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // Multi-Mission Historical & Time Machine Analytics
  getMultiMissionView: (ra, dec, targetName = '') =>
    fetchJson(`/time-machine/multimission?ra=${ra}&dec=${dec}&target_name=${encodeURIComponent(targetName)}`),

  getTimeMachineAnalytics: (ra, dec, targetName = '', mode = 'spherex') =>
    fetchJson(`/time-machine/analytics?ra=${ra}&dec=${dec}&target_name=${encodeURIComponent(targetName)}&mode=${mode}`)
};
