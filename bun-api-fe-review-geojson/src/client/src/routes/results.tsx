import { createFileRoute } from '@tanstack/react-router';
import { useLayers } from '../hooks/useLayers';
import { useLayerReviews } from '../hooks/useFeatures';
import { useState, useEffect } from 'react';
import type { GeoJSONFeature, GeoJSONFeatureCollection } from '../../../types/index.js';
import type { AppInspectResultsAPI } from '../appInspect.js';

export const Route = createFileRoute('/results')({
  component: ResultsComponent,
});

function ResultsComponent() {
  const { data: layers = [], isLoading } = useLayers();
  const visibleLayer = layers.find((l) => l.visible);

  if (isLoading) {
    return <div style={{ padding: '2rem' }} data-testid="results-loading">Loading...</div>;
  }

  if (!visibleLayer) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }} data-testid="results-empty">
        No visible layers. Please enable a layer from the Map or Table view.
      </div>
    );
  }

  return <LayerResults layerId={visibleLayer.id} layerName={visibleLayer.name} layerUrl={visibleLayer.url} />;
}

interface LayerResultsProps {
  layerId: string;
  layerName: string;
  layerUrl: string;
}

function LayerResults({ layerId, layerName, layerUrl }: LayerResultsProps) {
  const { data: reviewsData } = useLayerReviews(layerId);
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];
  const [features, setFeatures] = useState<GeoJSONFeature[]>([]);

  useEffect(() => {
    fetch(layerUrl)
      .then((res) => res.json())
      .then((data: GeoJSONFeatureCollection) => {
        setFeatures(data.features.map((f, i) => ({ ...f, id: f.id || i })));
      })
      .catch(console.error);
  }, [layerUrl]);

  const flaggedReviews = reviews.filter((r) => r.isFlagged);
  const reviewedCount = reviews.length;
  const flaggedCount = flaggedReviews.length;
  const totalCount = features.length;

  const flaggedFeatures = features.filter((f) =>
    flaggedReviews.some((r) => r.featureId === String(f.id))
  );

  useEffect(() => {
    if (!window.__appInspect) return;

    const resultsApi: AppInspectResultsAPI = {
      getSummary: () => ({
        layerName,
        total: totalCount,
        reviewed: reviewedCount,
        flagged: flaggedCount,
        passed: reviewedCount - flaggedCount,
        flaggedFeatures: flaggedFeatures.map((f) => {
          const review = flaggedReviews.find((r) => r.featureId === String(f.id));
          return {
            id: f.id!,
            properties: f.properties,
            reviewedAt: review?.reviewedAt || '',
          };
        }),
      }),
    };

    window.__appInspect.results = resultsApi;
    return () => {
      if (window.__appInspect) window.__appInspect.results = null;
    };
  }, [features, reviews, layerName, totalCount, reviewedCount, flaggedCount, flaggedFeatures, flaggedReviews]);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }} data-testid="results-container">
      <h2 style={{ margin: '0 0 1rem 0' }} data-testid="results-title">{layerName} - Review Results</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }} data-testid="results-summary">
        <StatCard label="Total Features" value={totalCount} testId="stat-total" />
        <StatCard label="Reviewed" value={reviewedCount} testId="stat-reviewed" />
        <StatCard label="Flagged" value={flaggedCount} testId="stat-flagged" color="#dc3545" />
        <StatCard label="Passed" value={reviewedCount - flaggedCount} testId="stat-passed" color="#28a745" />
      </div>

      <h3 style={{ margin: '0 0 0.75rem 0' }}>Flagged Features ({flaggedCount})</h3>

      {flaggedCount === 0 ? (
        <div style={{ padding: '1rem', color: '#666' }} data-testid="results-no-flagged">
          No features have been flagged.
        </div>
      ) : (
        <table
          style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}
          data-testid="results-flagged-table"
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Feature ID</th>
              <th style={{ padding: '0.5rem' }}>Properties</th>
              <th style={{ padding: '0.5rem' }}>Reviewed At</th>
            </tr>
          </thead>
          <tbody>
            {flaggedFeatures.map((feature) => {
              const review = flaggedReviews.find((r) => r.featureId === String(feature.id));
              return (
                <tr
                  key={String(feature.id)}
                  style={{ borderBottom: '1px solid #eee' }}
                  data-testid={`results-row-${feature.id}`}
                >
                  <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{String(feature.id)}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {Object.entries(feature.properties)
                      .filter(([k]) => k !== 'featureId' && k !== 'isFlagged')
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')}
                  </td>
                  <td style={{ padding: '0.5rem', color: '#666' }}>
                    {review ? new Date(review.reviewedAt).toLocaleString() : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatCard({ label, value, testId, color }: { label: string; value: number; testId: string; color?: string }) {
  return (
    <div
      style={{
        flex: 1,
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        textAlign: 'center',
        borderTop: color ? `3px solid ${color}` : '3px solid #007cbf',
      }}
      data-testid={testId}
    >
      <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: color || '#333' }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
}
