import type { GeoJSONFeatureCollection } from "../../../types/index.js";
import { isIndexedDbUrl, hashFromUrl, loadLayer } from "./indexedDb.js";

export const fetchGeoJSON = async (
  url: string,
): Promise<GeoJSONFeatureCollection> => {
  if (isIndexedDbUrl(url)) {
    const hash = hashFromUrl(url);
    const stored = await loadLayer(hash);
    if (!stored)
      throw new Error(`Layer not found in IndexedDB for hash: ${hash}`);
    return stored.geojson;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch GeoJSON: ${res.statusText}`);
  return res.json();
};
