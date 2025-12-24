import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { MapShell } from '../components/MapShell';
import { ReviewControls } from '../components/ReviewControls';
import { LayerToggle } from '../components/LayerToggle';
import { useLayers, useUpdateLayer } from '../hooks/useLayers';
import { useUpdateFeatureReview, useLayerReviews } from '../hooks/useFeatures';
import type { GeoJSONFeature, GeoJSONFeatureCollection } from '../../../types/index.js';

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

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <LayerToggle layers={layers} onToggle={handleToggleLayer} />
      {currentLayer ? (
        <>
          <MapShell
            geojsonUrl={currentLayer.url}
            selectedFeature={currentFeature}
            reviews={reviews}
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
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              Feature {currentFeatureIndex + 1} of {features.length}
            </div>
            {currentFeature && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  maxWidth: '600px',
                  margin: '0 auto',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                  Feature Details
                </h3>
                <div style={{ textAlign: 'left' }}>
                  {Object.entries(currentFeature.properties).map(([key, value]) => (
                    <div key={key} style={{ padding: '0.25rem 0' }}>
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          No visible layers. Please enable a layer from the toggle above.
        </div>
      )}
    </div>
  );
}
