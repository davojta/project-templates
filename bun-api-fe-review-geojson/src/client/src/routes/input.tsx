import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import {
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import type { GeoJSONFeatureCollection } from "../../../types/index.js";
import {
  parseCsvToGeoJSON,
  parseJsonArrayToGeoJSON,
} from "../lib/csvParser.js";
import { saveLayer, computeHash, INDEXEDDB_PREFIX } from "../lib/indexedDb.js";
import { useCreateLayer } from "../hooks/useLayers.js";

export const Route = createFileRoute("/input")({
  component: InputComponent,
});

interface ParsedFile {
  name: string;
  geojson: GeoJSONFeatureCollection;
  featureCount: number;
  geometryType: string;
  propertyColumns: string[];
  hash: string;
}

function InputComponent() {
  const navigate = useNavigate();
  const createLayer = useCreateLayer();
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setParsed(null);
    setLoading(true);

    try {
      const text = await file.text();
      const ext = file.name.split(".").pop()?.toLowerCase();
      let geojson: GeoJSONFeatureCollection;
      let propertyColumns: string[] = [];

      if (ext === "csv") {
        const result = parseCsvToGeoJSON(text);
        geojson = result.geojson;
        propertyColumns = result.propertyColumns;
      } else if (ext === "geojson" || ext === "json") {
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
          // JSON array of objects with lat/lng fields
          if (parsed.length === 0) throw new Error("JSON array is empty");
          const result = parseJsonArrayToGeoJSON(parsed);
          geojson = result.geojson;
          propertyColumns = result.propertyColumns;
        } else if (
          parsed.type === "FeatureCollection" &&
          Array.isArray(parsed.features)
        ) {
          geojson = parsed;
          if (geojson.features.length === 0) {
            throw new Error("GeoJSON has no features");
          }
          const allKeys = new Set<string>();
          geojson.features.forEach((f) =>
            Object.keys(f.properties || {}).forEach((k) => allKeys.add(k)),
          );
          propertyColumns = Array.from(allKeys);
        } else {
          throw new Error(
            "Invalid JSON: must be a GeoJSON FeatureCollection or an array of objects with lat/lng fields",
          );
        }
      } else {
        throw new Error(
          "Unsupported file type. Please upload .geojson, .json, or .csv",
        );
      }

      geojson.features = geojson.features.map((f, i) => ({
        ...f,
        id: f.id ?? `point-${i}`,
      }));

      const geometryTypes = new Set(
        geojson.features.map((f) => f.geometry.type),
      );
      const hash = await computeHash(text);

      setParsed({
        name: file.name,
        geojson,
        featureCount: geojson.features.length,
        geometryType: Array.from(geometryTypes).join(", "),
        propertyColumns,
        hash,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleStartReview = async () => {
    if (!parsed) return;
    setLoading(true);
    try {
      await saveLayer(parsed.hash, parsed.name, parsed.geojson);

      const layerName = parsed.name.replace(/\.(geojson|json|csv)$/i, "");
      await createLayer.mutateAsync({
        name: layerName,
        url: `${INDEXEDDB_PREFIX}${parsed.hash}`,
        visible: true,
        color: "#007cbf",
        source_hash: parsed.hash,
      });

      navigate({ to: "/map" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save layer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }} data-testid="input-page">
      <Typography variant="h5" sx={{ mb: 2 }}>
        Upload GeoJSON or CSV
      </Typography>

      <Paper
        data-testid="drop-zone"
        aria-label="drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          p: 6,
          textAlign: "center",
          border: "2px dashed",
          borderColor: dragging ? "primary.main" : "#ccc",
          backgroundColor: dragging ? "action.hover" : "background.paper",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
          },
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {dragging
            ? "Drop file here"
            : "Drag & drop a file here, or click to browse"}
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          Accepts .geojson, .json (FeatureCollection or array with lat/lng),
          .csv (with lat/lng columns)
        </Typography>
        <input
          ref={fileInputRef}
          type="file"
          accept=".geojson,.json,.csv"
          onChange={handleFileInput}
          style={{ display: "none" }}
          data-testid="file-input"
          aria-label="file-input"
        />
      </Paper>

      {loading && (
        <Typography sx={{ mt: 2, textAlign: "center" }} color="text.secondary">
          Processing...
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} data-testid="input-error">
          {error}
        </Alert>
      )}

      {parsed && (
        <Paper sx={{ mt: 3, p: 2 }} data-testid="file-preview">
          <Typography variant="h6" sx={{ mb: 1 }}>
            {parsed.name}
          </Typography>

          <Table size="small" sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Property</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Features</TableCell>
                <TableCell data-testid="preview-count">
                  {parsed.featureCount}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Geometry type</TableCell>
                <TableCell data-testid="preview-geometry">
                  {parsed.geometryType}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Properties</TableCell>
                <TableCell data-testid="preview-columns">
                  {parsed.propertyColumns.join(", ")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleStartReview}
            disabled={loading}
            data-testid="start-review-btn"
            aria-label="start-review-btn"
          >
            Start Review
          </Button>
        </Paper>
      )}
    </Box>
  );
}
