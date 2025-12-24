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
} as const;
