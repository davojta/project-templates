export const MARKER_COLORS = {
  flagged: '#ff0000',
  notFlagged: '#00ff00',
  highlighted: '#ff6b6b',
} as const;

export const BUTTON_COLORS = {
  flag: '#dc3545',
  unflag: '#28a745',
} as const;

export const MAP_CONFIG = {
  defaultZoom: 14,
  padding: 100,
  highlightRadius: 12,
  markerRadius: 8,
  strokeWidth: 2,
  highlightStrokeWidth: 3,
  strokeColor: '#ffffff',
  defaultStyle: 'mapbox://styles/mapbox/streets-v12',
} as const;

export const BASEMAPS = [
  { id: 'streets-v12', name: 'Mapbox Streets', styleUrl: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'satellite-streets-v12', name: 'Satellite Streets', styleUrl: 'mapbox://styles/mapbox/satellite-streets-v12' },
  { id: 'light-v11', name: 'Light', styleUrl: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark-v11', name: 'Dark', styleUrl: 'mapbox://styles/mapbox/dark-v11' },
] as const;
