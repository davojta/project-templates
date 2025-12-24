export interface Layer {
  id: string;
  name: string;
  url: string;
  visible: boolean;
  color?: string;
}

export interface FeatureReview {
  featureId: string;
  layerId: string;
  isFlagged: boolean;
  reviewedAt: string;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, unknown>;
  id?: string | number;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface BasemapConfig {
  id: string;
  name: string;
  styleUrl: string;
}
