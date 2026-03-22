import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { MapShell } from '../components/MapShell';
import { ReviewControls } from '../components/ReviewControls';
import { LayerToggle } from '../components/LayerToggle';
import { useLayers, useUpdateLayer } from '../hooks/useLayers';
import { useUpdateFeatureReview, useLayerReviews } from '../hooks/useFeatures';
import type { GeoJSONFeature, GeoJSONFeatureCollection } from '../../../types/index.js';
import type { AppInspectMapAPI } from '../appInspect.js';

export const Route = createFileRoute('/map')({
  component: MapComponent,
});

function MapComponent() {
  const { data: layers = [], isLoading } = useLayers();
  const updateLayer = useUpdateLayer();
  const updateReview = useUpdateFeatureReview();

  const [features, setFeatures] = useState<GeoJSONFeature[]>([]);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const currentLayer = layers.find((l) => l.visible);
  const { data: reviewsData } = useLayerReviews(currentLayer?.id || '');
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

  useEffect(() => {
    if (!currentLayer) {
      setFeatures([]);
      return;
    }

    setSelectedLayerId(currentLayer.id);

    fetch(currentLayer.url)
      .then((res) => res.json())
      .then((data: GeoJSONFeatureCollection) => {
        const featuresWithIds = data.features.map((f, i) => ({
          ...f,
          id: f.id || i,
        }));
        setFeatures(featuresWithIds);
        setCurrentFeatureIndex(0);
      })
      .catch(console.error);
  }, [currentLayer]);

  const handleToggleLayer = (layerId: string) => {
    const layer = layers.find((l) => l.id === layerId);
    if (layer) {
      updateLayer.mutate({ id: layerId, visible: !layer.visible });
    }
  };

  const currentFeature = features[currentFeatureIndex];
  const currentReview = reviews.find((r) => r.featureId === String(currentFeature?.id));
  const isFlagged = currentReview?.isFlagged || false;

  const handleToggleFlag = () => {
    if (currentFeature && selectedLayerId) {
      updateReview.mutate({
        layerId: selectedLayerId,
        featureId: String(currentFeature.id),
        isFlagged: !isFlagged,
      });
    }
  };

  const handleBack = () => {
    if (currentFeatureIndex > 0) {
      setCurrentFeatureIndex((i) => i - 1);
    }
  };

  const handleForward = () => {
    if (currentFeatureIndex < features.length - 1) {
      setCurrentFeatureIndex((i) => i + 1);
    }
  };

  useEffect(() => {
    if (!window.__appInspect) return;

    const mapApi: AppInspectMapAPI = {
      next: () => {
        if (currentFeatureIndex >= features.length - 1) return false;
        handleForward();
        return true;
      },
      prev: () => {
        if (currentFeatureIndex <= 0) return false;
        handleBack();
        return true;
      },
      flag: () => {
        if (!currentFeature || !selectedLayerId) return false;
        if (isFlagged) return false;
        handleToggleFlag();
        return true;
      },
      unflag: () => {
        if (!currentFeature || !selectedLayerId) return false;
        if (!isFlagged) return false;
        handleToggleFlag();
        return true;
      },
      getFeatureDetails: () => {
        if (!currentFeature) return null;
        return {
          id: currentFeature.id!,
          index: currentFeatureIndex,
          total: features.length,
          isFlagged,
          properties: currentFeature.properties,
          geometry: currentFeature.geometry,
        };
      },
    };

    window.__appInspect.map = mapApi;
    return () => {
      if (window.__appInspect) window.__appInspect.map = null;
    };
  }, [currentFeatureIndex, features, currentFeature, isFlagged, selectedLayerId]);

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div data-testid="map-view">
      <LayerToggle
        layers={layers}
        onToggle={handleToggleLayer}
        featureCounter={features.length > 0 ? `Feature ${currentFeatureIndex + 1} of ${features.length}` : undefined}
      />
      {currentLayer ? (
        <>
          <MapShell
            geojsonUrl={currentLayer.url}
            selectedFeature={currentFeature}
            reviews={reviews}
            currentFeature={currentFeature}
            onFeatureClick={(feature) => {
              const index = features.findIndex((f) => f.id === feature.id);
              if (index !== -1) {
                setCurrentFeatureIndex(index);
              }
            }}
          />
          <ReviewControls
            onBack={handleBack}
            onToggleFlag={handleToggleFlag}
            onForward={handleForward}
            isFlagged={isFlagged}
            canGoBack={currentFeatureIndex > 0}
            canGoForward={currentFeatureIndex < features.length - 1}
          />
        </>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          No visible layers. Please enable a layer from the toggle above.
        </div>
      )}
    </div>
  );
}
