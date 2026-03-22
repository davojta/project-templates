import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { MapShell } from "../components/MapShell";
import { ReviewControls } from "../components/ReviewControls";
import { LayerToggle } from "../components/LayerToggle";
import { useLayers, useUpdateLayer } from "../hooks/useLayers";
import { useUpdateFeatureReview, useLayerReviews } from "../hooks/useFeatures";
import type { GeoJSONFeature } from "../../../types/index.js";
import type { AppInspectMapAPI } from "../appInspect.js";
import { fetchGeoJSON } from "../lib/fetchGeoJSON.js";

export const Route = createFileRoute("/map")({
  component: MapComponent,
});

function MapComponent() {
  const { data: layers = [], isLoading } = useLayers();
  const updateLayer = useUpdateLayer();
  const updateReview = useUpdateFeatureReview();

  const [features, setFeatures] = useState<GeoJSONFeature[]>([]);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteValue, setNoteValue] = useState("");
  const [noteSubmitted, setNoteSubmitted] = useState(false);
  const noteRef = useRef({ value: "", open: false, submitted: false });

  const currentLayer = layers.find((l) => l.visible);
  const { data: reviewsData } = useLayerReviews(currentLayer?.id || "");
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

  useEffect(() => {
    if (!currentLayer) {
      setFeatures([]);
      return;
    }

    setSelectedLayerId(currentLayer.id);

    fetchGeoJSON(currentLayer.url)
      .then((data) => {
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
  const currentReview = reviews.find(
    (r) => r.featureId === String(currentFeature?.id),
  );
  const isFlagged = currentReview?.isFlagged || false;

  const handleFlag = useCallback(() => {
    if (currentFeature && selectedLayerId && !isFlagged) {
      updateReview.mutate({
        layerId: selectedLayerId,
        featureId: String(currentFeature.id),
        isFlagged: true,
      });
    }
  }, [currentFeature, selectedLayerId, isFlagged]);

  const handleUnflag = useCallback(() => {
    if (currentFeature && selectedLayerId && isFlagged) {
      updateReview.mutate({
        layerId: selectedLayerId,
        featureId: String(currentFeature.id),
        isFlagged: false,
      });
    }
  }, [currentFeature, selectedLayerId, isFlagged]);

  const handleToggleFlag = () => {
    if (isFlagged) handleUnflag();
    else handleFlag();
  };

  const submitNote = useCallback(() => {
    if (!noteRef.current.open || noteRef.current.submitted) return;
    if (!currentFeature || !selectedLayerId) return;
    const text = noteRef.current.value.trim();
    if (!text) return;
    updateReview.mutate({
      layerId: selectedLayerId,
      featureId: String(currentFeature.id),
      isFlagged,
      note: text,
    });
    setNoteSubmitted(true);
    noteRef.current.submitted = true;
  }, [currentFeature, selectedLayerId, isFlagged]);

  const resetNote = useCallback(() => {
    setNoteOpen(false);
    setNoteValue("");
    setNoteSubmitted(false);
    noteRef.current = { value: "", open: false, submitted: false };
  }, []);

  const handleNoteChange = useCallback((value: string) => {
    setNoteValue(value);
    noteRef.current.value = value;
  }, []);

  const handleNoteSubmit = useCallback(() => {
    submitNote();
  }, [submitNote]);

  useEffect(() => {
    resetNote();
  }, [currentFeatureIndex]);

  useEffect(() => {
    noteRef.current.open = noteOpen;
  }, [noteOpen]);

  const handleBack = useCallback(() => {
    if (currentFeatureIndex > 0) {
      submitNote();
      setCurrentFeatureIndex((i) => i - 1);
    }
  }, [currentFeatureIndex, submitNote]);

  const handleForward = useCallback(() => {
    if (currentFeatureIndex < features.length - 1) {
      submitNote();
      setCurrentFeatureIndex((i) => i + 1);
    }
  }, [currentFeatureIndex, features.length, submitNote]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          submitNote();
          (e.target as HTMLTextAreaElement).blur();
          if (e.key === "ArrowLeft") handleBack();
          else handleForward();
          return;
        }
        return;
      }
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case "ArrowRight":
          handleForward();
          break;
        case "ArrowLeft":
          handleBack();
          break;
        case "ArrowUp":
          e.preventDefault();
          handleFlag();
          break;
        case "ArrowDown":
          e.preventDefault();
          handleUnflag();
          break;
        case "n": {
          if (!noteOpen) {
            setNoteOpen(true);
            noteRef.current.open = true;
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleForward,
    handleBack,
    handleFlag,
    handleUnflag,
    noteOpen,
    submitNote,
  ]);

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
  }, [
    currentFeatureIndex,
    features,
    currentFeature,
    isFlagged,
    selectedLayerId,
  ]);

  if (isLoading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <div data-testid="map-view">
      <LayerToggle
        layers={layers}
        onToggle={handleToggleLayer}
        featureCounter={
          features.length > 0
            ? `Feature ${currentFeatureIndex + 1} of ${features.length}`
            : undefined
        }
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
            noteOpen={noteOpen}
            noteValue={noteValue}
            noteSubmitted={noteSubmitted}
            onNoteChange={handleNoteChange}
            onNoteSubmit={handleNoteSubmit}
          />
        </>
      ) : (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          No visible layers. Please enable a layer from the toggle above.
        </div>
      )}
    </div>
  );
}
