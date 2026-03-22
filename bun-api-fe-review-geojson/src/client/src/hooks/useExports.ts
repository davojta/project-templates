import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ExportInfo,
  GeoJSONFeatureCollection,
} from "../../../types/index.js";

export function useExportList(layerId: string) {
  return useQuery({
    queryKey: ["exports", layerId],
    queryFn: async (): Promise<ExportInfo> => {
      const res = await fetch(`/api/exports/layers/${layerId}`);
      if (!res.ok) throw new Error("Failed to fetch exports");
      return res.json();
    },
    enabled: !!layerId,
  });
}

export function useExportLayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      layerId,
      geojson,
    }: {
      layerId: string;
      geojson?: GeoJSONFeatureCollection;
    }) => {
      const res = await fetch(`/api/exports/layers/${layerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: geojson ? JSON.stringify({ geojson }) : "{}",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }));
        throw new Error(err.error || "Export failed");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+?)"/);
      const filename = match?.[1] || "export.csv";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exports", variables.layerId],
      });
    },
  });
}
