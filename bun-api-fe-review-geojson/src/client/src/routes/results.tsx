import { createFileRoute } from "@tanstack/react-router";
import { useLayers } from "../hooks/useLayers";
import { useLayerReviews } from "../hooks/useFeatures";
import { useExportList, useExportLayer } from "../hooks/useExports";
import { useState, useEffect } from "react";
import type {
  GeoJSONFeature,
  GeoJSONFeatureCollection,
} from "../../../types/index.js";
import type { AppInspectResultsAPI } from "../appInspect.js";
import { fetchGeoJSON } from "../lib/fetchGeoJSON.js";
import { isIndexedDbUrl } from "../lib/indexedDb.js";

export const Route = createFileRoute("/results")({
  component: ResultsComponent,
});

function ResultsComponent() {
  const { data: layers = [], isLoading } = useLayers();
  const visibleLayer = layers.find((l) => l.visible);

  if (isLoading) {
    return (
      <div style={{ padding: "2rem" }} data-testid="results-loading">
        Loading...
      </div>
    );
  }

  if (!visibleLayer) {
    return (
      <div
        style={{ padding: "2rem", textAlign: "center" }}
        data-testid="results-empty"
      >
        No visible layers. Please enable a layer from the Map or Table view.
      </div>
    );
  }

  return (
    <LayerResults
      layerId={visibleLayer.id}
      layerName={visibleLayer.name}
      layerUrl={visibleLayer.url}
    />
  );
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
  const [geojsonData, setGeojsonData] =
    useState<GeoJSONFeatureCollection | null>(null);
  const { data: exportsData } = useExportList(layerId);
  const exportLayer = useExportLayer();

  useEffect(() => {
    fetchGeoJSON(layerUrl)
      .then((data) => {
        setGeojsonData(data);
        setFeatures(data.features.map((f, i) => ({ ...f, id: f.id || i })));
      })
      .catch(console.error);
  }, [layerUrl]);

  const flaggedReviews = reviews.filter((r) => r.isFlagged);
  const reviewedCount = reviews.length;
  const flaggedCount = flaggedReviews.length;
  const totalCount = features.length;

  const flaggedFeatures = features.filter((f) =>
    flaggedReviews.some((r) => r.featureId === String(f.id)),
  );

  const handleExport = () => {
    const payload: { layerId: string; geojson?: GeoJSONFeatureCollection } = {
      layerId,
    };
    if (isIndexedDbUrl(layerUrl) && geojsonData) {
      payload.geojson = geojsonData;
    }
    exportLayer.mutate(payload);
  };

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
          const review = flaggedReviews.find(
            (r) => r.featureId === String(f.id),
          );
          return {
            id: f.id!,
            properties: f.properties,
            reviewedAt: review?.reviewedAt || "",
          };
        }),
      }),
    };

    window.__appInspect.results = resultsApi;
    return () => {
      if (window.__appInspect) window.__appInspect.results = null;
    };
  }, [
    features,
    reviews,
    layerName,
    totalCount,
    reviewedCount,
    flaggedCount,
    flaggedFeatures,
    flaggedReviews,
  ]);

  return (
    <div
      style={{ padding: "1.5rem", maxWidth: "800px", margin: "0 auto" }}
      data-testid="results-container"
    >
      <h2 style={{ margin: "0 0 1rem 0" }} data-testid="results-title">
        {layerName} - Review Results
      </h2>

      <div
        style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}
        data-testid="results-summary"
      >
        <StatCard
          label="Total Features"
          value={totalCount}
          testId="stat-total"
        />
        <StatCard
          label="Reviewed"
          value={reviewedCount}
          testId="stat-reviewed"
        />
        <StatCard
          label="Flagged"
          value={flaggedCount}
          testId="stat-flagged"
          color="#dc3545"
        />
        <StatCard
          label="Passed"
          value={reviewedCount - flaggedCount}
          testId="stat-passed"
          color="#28a745"
        />
      </div>

      <button
        onClick={handleExport}
        disabled={exportLayer.isPending}
        data-testid="export-btn"
        aria-label="export-btn"
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          fontWeight: "bold",
          backgroundColor: "#007cbf",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: exportLayer.isPending ? "wait" : "pointer",
          marginBottom: "1.5rem",
          width: "100%",
        }}
      >
        {exportLayer.isPending ? "Exporting..." : "Export Results as CSV"}
      </button>

      <h3 style={{ margin: "0 0 0.75rem 0" }}>
        Flagged Features ({flaggedCount})
      </h3>

      {flaggedCount === 0 ? (
        <div
          style={{ padding: "1rem", color: "#666" }}
          data-testid="results-no-flagged"
        >
          No features have been flagged.
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.875rem",
          }}
          data-testid="results-flagged-table"
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
              <th style={{ padding: "0.5rem" }}>Feature ID</th>
              <th style={{ padding: "0.5rem" }}>Properties</th>
              <th style={{ padding: "0.5rem" }}>Reviewed At</th>
            </tr>
          </thead>
          <tbody>
            {flaggedFeatures.map((feature) => {
              const review = flaggedReviews.find(
                (r) => r.featureId === String(feature.id),
              );
              return (
                <tr
                  key={String(feature.id)}
                  style={{ borderBottom: "1px solid #eee" }}
                  data-testid={`results-row-${feature.id}`}
                >
                  <td style={{ padding: "0.5rem", fontFamily: "monospace" }}>
                    {String(feature.id)}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {Object.entries(feature.properties)
                      .filter(([k]) => k !== "featureId" && k !== "isFlagged")
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                  </td>
                  <td style={{ padding: "0.5rem", color: "#666" }}>
                    {review
                      ? new Date(review.reviewedAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <ExportsSection layerId={layerId} exportsData={exportsData} />
    </div>
  );
}

function ExportsSection({
  layerId,
  exportsData,
}: {
  layerId: string;
  exportsData?: { current: string | null; archive: string[] };
}) {
  if (!exportsData) return null;

  const { current, archive } = exportsData;
  const hasExports = current || archive.length > 0;

  return (
    <div style={{ marginTop: "2rem" }} data-testid="exports-section">
      <h3 style={{ margin: "0 0 0.75rem 0" }}>Exports</h3>

      {!hasExports ? (
        <div
          style={{ padding: "1rem", color: "#666" }}
          data-testid="no-exports"
        >
          No exports yet. Use the button above to generate one.
        </div>
      ) : (
        <>
          {current && (
            <div style={{ marginBottom: "1rem" }}>
              <h4
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "0.875rem",
                  color: "#666",
                }}
              >
                Current Export
              </h4>
              <a
                href={`/api/exports/download/${current}`}
                download
                data-testid="export-current"
                aria-label="export-current"
                style={{
                  color: "#007cbf",
                  textDecoration: "none",
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                }}
              >
                {current}
              </a>
            </div>
          )}

          {archive.length > 0 && (
            <div>
              <h4
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "0.875rem",
                  color: "#666",
                }}
              >
                Archive ({archive.length})
              </h4>
              <ul
                style={{ margin: 0, padding: "0 0 0 1rem", listStyle: "none" }}
              >
                {archive.map((filename) => (
                  <li key={filename} style={{ marginBottom: "0.25rem" }}>
                    <a
                      href={`/api/exports/download/archive/${filename}`}
                      download
                      data-testid={`export-archive-${filename}`}
                      style={{
                        color: "#007cbf",
                        textDecoration: "none",
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                      }}
                    >
                      {filename}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  testId,
  color,
}: {
  label: string;
  value: number;
  testId: string;
  color?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: "1rem",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        textAlign: "center",
        borderTop: color ? `3px solid ${color}` : "3px solid #007cbf",
      }}
      data-testid={testId}
    >
      <div
        style={{
          fontSize: "1.75rem",
          fontWeight: "bold",
          color: color || "#333",
        }}
      >
        {value}
      </div>
      <div
        style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}
      >
        {label}
      </div>
    </div>
  );
}
