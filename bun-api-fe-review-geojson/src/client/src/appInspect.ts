export interface FeatureDetails {
  id: string | number;
  index: number;
  total: number;
  isFlagged: boolean;
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
}

export interface TableRow {
  id: string | number;
  isFlagged: boolean;
  properties: Record<string, unknown>;
}

export interface ResultsSummary {
  layerName: string;
  total: number;
  reviewed: number;
  flagged: number;
  passed: number;
  flaggedFeatures: {
    id: string | number;
    properties: Record<string, unknown>;
    reviewedAt: string;
  }[];
}

export interface AppInspectMapAPI {
  next: () => boolean;
  prev: () => boolean;
  flag: () => boolean;
  unflag: () => boolean;
  getFeatureDetails: () => FeatureDetails | null;
}

export interface AppInspectTableAPI {
  getData: () => TableRow[];
  toggleFlag: (featureId: string | number) => boolean;
}

export interface AppInspectResultsAPI {
  getSummary: () => ResultsSummary | null;
}

export interface AppInspectAPI {
  getPage: () => string;
  navigate: (page: "map" | "table" | "results") => void;
  map: AppInspectMapAPI | null;
  table: AppInspectTableAPI | null;
  results: AppInspectResultsAPI | null;
}

declare global {
  interface Window {
    __appInspect?: AppInspectAPI;
  }
}

export function initAppInspect(
  navigateFn: (page: "map" | "table" | "results") => void,
  getPage: () => string,
): AppInspectAPI {
  const api: AppInspectAPI = {
    getPage,
    navigate: navigateFn,
    map: null,
    table: null,
    results: null,
  };
  window.__appInspect = api;
  return api;
}
