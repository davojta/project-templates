import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { FeatureTableMUI } from '../components/FeatureTableMUI';
import { LayerToggle } from '../components/LayerToggle';
import { useLayers, useUpdateLayer, useApplyLayerFlags } from '../hooks/useLayers';
import { useLayerReviews, useUpdateFeatureReview } from '../hooks/useFeatures';
import type { GeoJSONFeature, GeoJSONFeatureCollection } from '../../../types/index.js';

export const Route = createFileRoute('/table')({
  component: TableComponent,
});

function TableComponent() {
  const { data: layers = [], isLoading } = useLayers();
  const updateLayer = useUpdateLayer();
  const updateReview = useUpdateFeatureReview();
  const applyFlags = useApplyLayerFlags();

  const [features, setFeatures] = useState<GeoJSONFeature[]>([]);
  const currentLayer = layers.find((l) => l.visible);
  const { data: reviewsData } = useLayerReviews(currentLayer?.id || '');
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

  useEffect(() => {
    if (!currentLayer) {
      setFeatures([]);
      return;
    }

    fetch(currentLayer.url)
      .then((res) => res.json())
      .then((data: GeoJSONFeatureCollection) => {
        const featuresWithIds = data.features.map((f, i) => ({
          ...f,
          id: f.id || i,
        }));
        setFeatures(featuresWithIds);
      })
      .catch(console.error);
  }, [currentLayer]);

  const handleToggleLayer = (layerId: string) => {
    const layer = layers.find((l) => l.id === layerId);
    if (layer) {
      updateLayer.mutate({ id: layerId, visible: !layer.visible });
    }
  };

  const handleToggleFlag = (featureId: string | number, currentFlag: boolean) => {
    if (currentLayer) {
      updateReview.mutate({
        layerId: currentLayer.id,
        featureId: String(featureId),
        isFlagged: !currentFlag,
      });
    }
  };

  const handleApplyFlags = (layerId: string) => {
    applyFlags.mutate(layerId, {
      onSuccess: (data) => {
        alert(`Success! ${data.message}\nUpdated ${data.updatedFeatures} features.`);
      },
      onError: (error) => {
        alert(`Error: ${error.message}`);
      },
    });
  };

  const reviewsMap = new Map<string | number, boolean>(
    reviews.map((r) => [r.featureId, r.isFlagged])
  );

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <LayerToggle
        layers={layers}
        onToggle={handleToggleLayer}
        onApplyFlags={handleApplyFlags}
        isApplying={applyFlags.isPending}
      />
      {currentLayer ? (
        <>
          <div style={{ padding: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{currentLayer.name}</h2>
            <p style={{ color: '#666', marginTop: '0.25rem' }}>
              {features.length} features total
            </p>
          </div>
          <FeatureTableMUI
            features={features}
            reviews={reviewsMap}
            onToggleFlag={handleToggleFlag}
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
