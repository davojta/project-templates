import type {
  GeoJSONFeature,
  GeoJSONFeatureCollection,
} from "../../../types/index.js";

export const LAT_NAMES = ["lat", "latitude", "y"];
export const LNG_NAMES = ["lng", "lon", "longitude", "x"];

const findColumn = (headers: string[], candidates: string[]): number =>
  headers.findIndex((h) => candidates.includes(h.trim().toLowerCase()));

const parseCsvRows = (text: string): string[][] => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.map((line) => line.split(",").map((cell) => cell.trim()));
};

export interface CsvParseResult {
  geojson: GeoJSONFeatureCollection;
  latColumn: string;
  lngColumn: string;
  propertyColumns: string[];
}

export const parseCsvToGeoJSON = (text: string): CsvParseResult => {
  const rows = parseCsvRows(text);
  if (rows.length < 2)
    throw new Error("CSV must have a header row and at least one data row");

  const headers = rows[0];
  const latIdx = findColumn(headers, LAT_NAMES);
  const lngIdx = findColumn(headers, LNG_NAMES);

  if (latIdx === -1)
    throw new Error(
      `No latitude column found. Expected one of: ${LAT_NAMES.join(", ")}`,
    );
  if (lngIdx === -1)
    throw new Error(
      `No longitude column found. Expected one of: ${LNG_NAMES.join(", ")}`,
    );

  const propertyColumns = headers.filter(
    (_, i) => i !== latIdx && i !== lngIdx,
  );

  const features: GeoJSONFeature[] = rows.slice(1).map((row, rowIdx) => {
    const lat = parseFloat(row[latIdx]);
    const lng = parseFloat(row[lngIdx]);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error(
        `Invalid coordinates at row ${rowIdx + 2}: lat=${row[latIdx]}, lng=${row[lngIdx]}`,
      );
    }

    const properties: Record<string, unknown> = {};
    headers.forEach((header, i) => {
      if (i === latIdx || i === lngIdx) return;
      const val = row[i] ?? "";
      const num = Number(val);
      properties[header] = val !== "" && !isNaN(num) ? num : val;
    });

    return {
      type: "Feature" as const,
      id: `point-${rowIdx}`,
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties,
    };
  });

  return {
    geojson: { type: "FeatureCollection", features },
    latColumn: headers[latIdx],
    lngColumn: headers[lngIdx],
    propertyColumns,
  };
};

const findKey = (keys: string[], candidates: string[]): string | undefined =>
  keys.find((k) => candidates.includes(k.toLowerCase()));

export interface JsonArrayParseResult {
  geojson: GeoJSONFeatureCollection;
  latKey: string;
  lngKey: string;
  propertyColumns: string[];
}

export const parseJsonArrayToGeoJSON = (
  items: Record<string, unknown>[],
): JsonArrayParseResult => {
  if (items.length === 0) throw new Error("JSON array is empty");

  const keys = Object.keys(items[0]);
  const latKey = findKey(keys, LAT_NAMES);
  const lngKey = findKey(keys, LNG_NAMES);

  if (!latKey)
    throw new Error(
      `No latitude key found. Expected one of: ${LAT_NAMES.join(", ")}`,
    );
  if (!lngKey)
    throw new Error(
      `No longitude key found. Expected one of: ${LNG_NAMES.join(", ")}`,
    );

  const propertyColumns = keys.filter((k) => k !== latKey && k !== lngKey);

  const features: GeoJSONFeature[] = items.map((item, i) => {
    const lat = Number(item[latKey]);
    const lng = Number(item[lngKey]);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error(
        `Invalid coordinates at item ${i}: ${latKey}=${item[latKey]}, ${lngKey}=${item[lngKey]}`,
      );
    }

    const properties: Record<string, unknown> = {};
    for (const k of propertyColumns) {
      const val = item[k];
      // flatten nested objects to JSON string for display
      properties[k] =
        val !== null && typeof val === "object"
          ? JSON.stringify(val)
          : (val ?? "");
    }

    return {
      type: "Feature" as const,
      id: (item.id as string | number) ?? `point-${i}`,
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties,
    };
  });

  return {
    geojson: { type: "FeatureCollection", features },
    latKey,
    lngKey,
    propertyColumns,
  };
};
