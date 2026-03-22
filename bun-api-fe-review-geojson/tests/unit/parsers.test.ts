import { describe, it, expect } from "vitest";
import {
  parseCsvToGeoJSON,
  parseJsonArrayToGeoJSON,
} from "../../src/client/src/lib/csvParser";
import sampleLocations from "./fixtures/sample-locations.json";

describe("parseCsvToGeoJSON", () => {
  it("should parse CSV with lat/lng columns", () => {
    const csv = `name,lat,lng,category
Library,60.17,24.94,education
Station,60.18,24.95,transit`;

    const result = parseCsvToGeoJSON(csv);

    expect(result.latColumn).toBe("lat");
    expect(result.lngColumn).toBe("lng");
    expect(result.propertyColumns).toEqual(["name", "category"]);
    expect(result.geojson.features).toHaveLength(2);
    expect(result.geojson.features[0].geometry.coordinates).toEqual([
      24.94, 60.17,
    ]);
    expect(result.geojson.features[0].properties).toEqual({
      name: "Library",
      category: "education",
    });
  });

  it("should parse CSV with latitude/longitude columns", () => {
    const csv = `id,latitude,longitude,status
1,35.07,137.12,active`;

    const result = parseCsvToGeoJSON(csv);
    expect(result.latColumn).toBe("latitude");
    expect(result.lngColumn).toBe("longitude");
    expect(result.geojson.features[0].geometry.coordinates).toEqual([
      137.12, 35.07,
    ]);
  });

  it("should throw on missing lat column", () => {
    const csv = `name,lng,category
Library,24.94,education`;

    expect(() => parseCsvToGeoJSON(csv)).toThrow("No latitude column found");
  });

  it("should throw on invalid coordinates", () => {
    const csv = `name,lat,lng
Library,abc,24.94`;

    expect(() => parseCsvToGeoJSON(csv)).toThrow(
      "Invalid coordinates at row 2",
    );
  });

  it("should auto-convert numeric values", () => {
    const csv = `name,lat,lng,rating
Library,60.17,24.94,4.5`;

    const result = parseCsvToGeoJSON(csv);
    expect(result.geojson.features[0].properties.rating).toBe(4.5);
  });
});

describe("parseJsonArrayToGeoJSON", () => {
  it("should parse sample-locations.json fixture", () => {
    const result = parseJsonArrayToGeoJSON(
      sampleLocations as Record<string, unknown>[],
    );

    expect(result.latKey).toBe("latitude");
    expect(result.lngKey).toBe("longitude");
    expect(result.geojson.type).toBe("FeatureCollection");
    expect(result.geojson.features).toHaveLength(3);
  });

  it("should use id field from objects", () => {
    const result = parseJsonArrayToGeoJSON(
      sampleLocations as Record<string, unknown>[],
    );

    expect(result.geojson.features[0].id).toBe("loc-001");
    expect(result.geojson.features[1].id).toBe("loc-002");
  });

  it("should set correct coordinates [lng, lat]", () => {
    const result = parseJsonArrayToGeoJSON(
      sampleLocations as Record<string, unknown>[],
    );

    const coords = result.geojson.features[0].geometry.coordinates;
    expect(coords).toEqual([24.9384, 60.1699]);
  });

  it("should flatten nested objects to JSON strings", () => {
    const result = parseJsonArrayToGeoJSON(
      sampleLocations as Record<string, unknown>[],
    );
    const props = result.geojson.features[0].properties;

    expect(props.metadata).toBe('{"source":"osm","verified":true}');
    expect(props.tags).toBe('["public","landmark"]');
  });

  it("should preserve scalar properties", () => {
    const result = parseJsonArrayToGeoJSON(
      sampleLocations as Record<string, unknown>[],
    );
    const props = result.geojson.features[0].properties;

    expect(props.name).toBe("Central Library");
    expect(props.category).toBe("education");
    expect(props.height).toBe(32.5);
    expect(props.rating).toBe(4.7);
    expect(props.updated_at).toBe(1700000000000);
  });

  it("should exclude lat/lng from property columns", () => {
    const result = parseJsonArrayToGeoJSON(
      sampleLocations as Record<string, unknown>[],
    );

    expect(result.propertyColumns).not.toContain("latitude");
    expect(result.propertyColumns).not.toContain("longitude");
    expect(result.propertyColumns).toContain("name");
    expect(result.propertyColumns).toContain("category");
  });

  it("should handle objects with lat/lng short names", () => {
    const items = [{ name: "Test", lat: 60.17, lng: 24.94 }];

    const result = parseJsonArrayToGeoJSON(items as Record<string, unknown>[]);
    expect(result.latKey).toBe("lat");
    expect(result.lngKey).toBe("lng");
    expect(result.geojson.features[0].geometry.coordinates).toEqual([
      24.94, 60.17,
    ]);
  });

  it("should generate fallback ids when id field is missing", () => {
    const items = [{ name: "No ID", latitude: 60.17, longitude: 24.94 }];

    const result = parseJsonArrayToGeoJSON(items as Record<string, unknown>[]);
    expect(result.geojson.features[0].id).toBe("point-0");
  });

  it("should throw on empty array", () => {
    expect(() => parseJsonArrayToGeoJSON([])).toThrow("JSON array is empty");
  });

  it("should throw on missing lat key", () => {
    const items = [{ name: "Test", longitude: 24.94 }];
    expect(() =>
      parseJsonArrayToGeoJSON(items as Record<string, unknown>[]),
    ).toThrow("No latitude key found");
  });

  it("should handle null property values", () => {
    const items = [
      { id: "1", latitude: 60.17, longitude: 24.94, address: null },
    ];

    const result = parseJsonArrayToGeoJSON(items as Record<string, unknown>[]);
    expect(result.geojson.features[0].properties.address).toBe("");
  });
});
