import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { GeoJSONFeature, FeatureReview } from '../../../types/index.js';
import { MARKER_COLORS, MAP_CONFIG, BASEMAPS } from '../config.js';
import { BasemapSelector } from './BasemapSelector.js';
import { FeatureDetails } from './FeatureDetails.js';

interface ViewportQueryOptions {
  layers: string[];
  limit?: number;
}

interface ViewportQueryResult {
  name: string;
  featureCount: number;
  features: Record<string, unknown>[];
}

interface MapInspectResult {
  status: 'ok' | 'error';
  timestamp: string;
  camera: { center: [number, number]; zoom: number; bearing: number; pitch: number };
  layers: { id: string; type: string; visible: boolean }[];
  queries: ViewportQueryResult[];
  error?: string;
}

interface MapInspectAPI {
  verify: (opts: { queries: { name: string; method: string; options: ViewportQueryOptions }[] }) => Promise<MapInspectResult>;
  getCamera: () => { center: [number, number]; zoom: number; bearing: number; pitch: number } | null;
  getLayers: () => { id: string; type: string; visible: boolean }[];
}

declare global {
  interface Window {
    __mapInspect?: MapInspectAPI;
  }
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

interface MapShellProps {
  geojsonUrl?: string;
  selectedFeature?: GeoJSONFeature | null;
  onFeatureClick?: (feature: GeoJSONFeature) => void;
  reviews?: FeatureReview[];
  currentFeature?: GeoJSONFeature | null;
}

export function MapShell({ geojsonUrl, selectedFeature, onFeatureClick, reviews = [], currentFeature }: MapShellProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [currentBasemapId, setCurrentBasemapId] = useState<string>(BASEMAPS[0].id);
  const initialBoundsSet = useRef(false);
  const currentGeojsonUrl = useRef<string | null>(null);

  const addGeoJSONLayers = useCallback((data: any, flaggedIds: string[]) => {
    if (!map.current) return;

    const sourceId = 'geojson-data';
    const layerId = 'geojson-layer';
    const highlightLayerId = 'geojson-layer-highlight';

    if (map.current.getSource(sourceId)) return;

    map.current.addSource(sourceId, {
      type: 'geojson',
      data,
    });

    map.current.addLayer({
      id: layerId,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': MAP_CONFIG.markerRadius,
        'circle-color': [
          'match',
          ['get', 'featureId'],
          flaggedIds,
          MARKER_COLORS.flagged,
          MARKER_COLORS.notFlagged
        ],
        'circle-stroke-width': MAP_CONFIG.strokeWidth,
        'circle-stroke-color': MAP_CONFIG.strokeColor,
      },
    });

    map.current.addLayer({
      id: highlightLayerId,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': MAP_CONFIG.highlightRadius,
        'circle-color': MARKER_COLORS.highlighted,
        'circle-stroke-width': MAP_CONFIG.highlightStrokeWidth,
        'circle-stroke-color': MAP_CONFIG.strokeColor,
      },
      filter: ['==', ['id'], ''],
    });
  }, []);

  const handleBasemapChange = useCallback((styleUrl: string) => {
    if (!map.current) return;

    const basemap = BASEMAPS.find((b) => b.styleUrl === styleUrl);
    if (!basemap) return;

    setCurrentBasemapId(basemap.id);
    map.current.setStyle(styleUrl);

    map.current.once('style.load', () => {
      if (geojsonData) {
        const flaggedIds = reviews.filter((r) => r.isFlagged).map((r) => r.featureId);
        addGeoJSONLayers(geojsonData, flaggedIds);
      }
    });
  }, [geojsonData, reviews, addGeoJSONLayers]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0],
      zoom: 2,
    });

    map.current.on('load', () => setLoaded(true));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !loaded) return;

    const m = map.current;

    const getCamera = () => {
      const center = m.getCenter();
      return {
        center: [center.lng, center.lat] as [number, number],
        zoom: m.getZoom(),
        bearing: m.getBearing(),
        pitch: m.getPitch(),
      };
    };

    const getLayers = () => {
      const style = m.getStyle();
      if (!style?.layers) return [];
      return style.layers.map((l) => ({
        id: l.id,
        type: l.type,
        visible: m.getLayoutProperty(l.id, 'visibility') !== 'none',
      }));
    };

    window.__mapInspect = {
      getCamera,
      getLayers,
      verify: async ({ queries }) => {
        try {
          const camera = getCamera();
          const layers = getLayers();
          const results: ViewportQueryResult[] = [];

          for (const q of queries) {
            if (q.method === 'viewport') {
              const limit = q.options.limit ?? 100;
              const renderedFeatures = m.queryRenderedFeatures({
                layers: q.options.layers,
              });
              const limited = renderedFeatures.slice(0, limit);
              results.push({
                name: q.name,
                featureCount: renderedFeatures.length,
                features: limited.map((f) => ({
                  id: f.id,
                  properties: f.properties,
                  geometry: f.geometry,
                })),
              });
            }
          }

          return { status: 'ok', timestamp: new Date().toISOString(), camera, layers, queries: results };
        } catch (err) {
          return {
            status: 'error',
            timestamp: new Date().toISOString(),
            camera: getCamera(),
            layers: getLayers(),
            queries: [],
            error: err instanceof Error ? err.message : String(err),
          };
        }
      },
    };

    return () => {
      delete window.__mapInspect;
    };
  }, [loaded]);

  useEffect(() => {
    if (!map.current || !loaded || !geojsonUrl) return;

    const sourceId = 'geojson-data';
    const layerId = 'geojson-layer';
    const highlightLayerId = 'geojson-layer-highlight';

    if (currentGeojsonUrl.current === geojsonUrl) {
      const flaggedIds = reviews
        .filter((r) => r.isFlagged)
        .map((r) => r.featureId);

      if (map.current.getLayer(layerId)) {
        map.current.setPaintProperty(layerId, 'circle-color', [
          'match',
          ['get', 'featureId'],
          flaggedIds,
          MARKER_COLORS.flagged,
          MARKER_COLORS.notFlagged
        ]);
      }
      return;
    }

    currentGeojsonUrl.current = geojsonUrl;
    initialBoundsSet.current = false;

    if (map.current.getLayer(highlightLayerId)) {
      map.current.removeLayer(highlightLayerId);
    }
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (e.features && e.features[0] && onFeatureClick) {
        onFeatureClick(e.features[0] as unknown as GeoJSONFeature);
      }
    };

    const handleMouseEnter = () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    };

    fetch(geojsonUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!map.current) return;

        const dataWithIds = {
          ...data,
          features: data.features.map((f: any) => ({
            ...f,
            properties: {
              ...f.properties,
              featureId: f.id,
            },
          })),
        };

        setGeojsonData(dataWithIds);

        const flaggedIds = reviews
          .filter((r) => r.isFlagged)
          .map((r) => r.featureId);

        map.current.addSource(sourceId, {
          type: 'geojson',
          data: dataWithIds,
        });

        map.current.addLayer({
          id: layerId,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': MAP_CONFIG.markerRadius,
            'circle-color': [
              'match',
              ['get', 'featureId'],
              flaggedIds,
              MARKER_COLORS.flagged,
              MARKER_COLORS.notFlagged
            ],
            'circle-stroke-width': MAP_CONFIG.strokeWidth,
            'circle-stroke-color': MAP_CONFIG.strokeColor,
          },
        });

        map.current.addLayer({
          id: highlightLayerId,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': MAP_CONFIG.highlightRadius,
            'circle-color': MARKER_COLORS.highlighted,
            'circle-stroke-width': MAP_CONFIG.highlightStrokeWidth,
            'circle-stroke-color': MAP_CONFIG.strokeColor,
          },
          filter: ['==', ['id'], ''],
        });

        map.current.on('click', layerId, handleClick);
        map.current.on('mouseenter', layerId, handleMouseEnter);
        map.current.on('mouseleave', layerId, handleMouseLeave);
      });

    return () => {
      if (map.current) {
        map.current.off('click', layerId, handleClick);
        map.current.off('mouseenter', layerId, handleMouseEnter);
        map.current.off('mouseleave', layerId, handleMouseLeave);
      }
    };
  }, [geojsonUrl, loaded, reviews]);

  useEffect(() => {
    if (!map.current || !loaded) return;

    const layerId = 'geojson-layer';
    if (!map.current.getLayer(layerId)) return;

    const flaggedIds = reviews
      .filter((r) => r.isFlagged)
      .map((r) => r.featureId);

    map.current.setPaintProperty(layerId, 'circle-color', [
      'match',
      ['get', 'featureId'],
      flaggedIds,
      MARKER_COLORS.flagged,
      MARKER_COLORS.notFlagged
    ]);
  }, [reviews, loaded]);

  useEffect(() => {
    if (!map.current || !loaded || !selectedFeature) return;

    const highlightLayerId = 'geojson-layer-highlight';

    if (map.current.getLayer(highlightLayerId)) {
      map.current.setFilter(highlightLayerId, ['==', ['id'], selectedFeature.id]);
    }

    if (selectedFeature.geometry.type === 'Point') {
      const coords = selectedFeature.geometry.coordinates as [number, number];
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(coords);

      map.current.fitBounds(bounds, {
        padding: MAP_CONFIG.padding,
        maxZoom: MAP_CONFIG.defaultZoom,
        duration: 0
      });
    }
  }, [selectedFeature, loaded]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }} data-testid="map-shell" aria-label="map-shell">
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} data-testid="map-container" role="application" aria-label="map-container" />
      <BasemapSelector currentBasemap={currentBasemapId} onBasemapChange={handleBasemapChange} />
      {currentFeature && <FeatureDetails feature={currentFeature} />}
    </div>
  );
}
