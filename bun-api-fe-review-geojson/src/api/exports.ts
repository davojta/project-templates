import { Hono } from "hono";
import { layerQueries, featureReviewQueries } from "./db.js";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join } from "node:path";

const exports_ = new Hono();

const EXPORTS_DIR = join(process.cwd(), "data", "exports");
const ARCHIVE_DIR = join(EXPORTS_DIR, "archive");

const sanitizeName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

type FeatureRow = {
  id?: string | number;
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
};

const featuresToCsv = (
  features: FeatureRow[],
  reviews: Map<
    string,
    { isFlagged: boolean; note: string; reviewedAt: string }
  >,
): string => {
  if (features.length === 0) return "";

  const propKeys = new Set<string>();
  features.forEach((f) => {
    Object.keys(f.properties || {}).forEach((k) => {
      if (k !== "isFlagged" && k !== "featureId") propKeys.add(k);
    });
  });

  const columns = [
    "id",
    ...Array.from(propKeys),
    "isFlagged",
    "note",
    "reviewedAt",
  ];
  const header = columns.join(",");

  const rows = features.map((f) => {
    const fid = String(f.id ?? "");
    const review = reviews.get(fid);
    const vals = columns.map((col) => {
      if (col === "id") return escapeCsvField(fid);
      if (col === "isFlagged")
        return review ? String(review.isFlagged) : "false";
      if (col === "note") return escapeCsvField(review?.note ?? "");
      if (col === "reviewedAt") return escapeCsvField(review?.reviewedAt ?? "");
      return escapeCsvField(String(f.properties?.[col] ?? ""));
    });
    return vals.join(",");
  });

  return [header, ...rows].join("\n");
};

const escapeCsvField = (val: string): string => {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
};

// POST /api/exports/layers/:id
// For IndexedDB layers, body must include { geojson: FeatureCollection }
// For file-based layers, geojson is read from disk
exports_.post("/layers/:id", async (c) => {
  const id = c.req.param("id");
  const layer = layerQueries.getById.get(id);
  if (!layer) return c.json({ error: "Layer not found" }, 404);

  let features: FeatureRow[];

  if (layer.url.startsWith("indexeddb://")) {
    const body = await c.req.json().catch(() => null);
    if (!body?.geojson?.features) {
      return c.json(
        { error: "GeoJSON body required for IndexedDB layers" },
        400,
      );
    }
    features = body.geojson.features.map((f: any, i: number) => ({
      ...f,
      id: f.id ?? i,
    }));
  } else {
    const filePath = join(process.cwd(), layer.url.replace(/^\//, ""));
    try {
      const content = await readFile(filePath, "utf-8");
      const geojson = JSON.parse(content);
      features = (geojson.features || []).map((f: any, i: number) => ({
        ...f,
        id: f.id ?? i,
      }));
    } catch {
      return c.json({ error: "Failed to read GeoJSON file" }, 500);
    }
  }

  const dbReviews = featureReviewQueries.getByLayerId.all(id);
  const reviewMap = new Map(
    dbReviews.map((r) => [
      r.featureId,
      {
        isFlagged: Boolean(r.isFlagged),
        note: r.note || "",
        reviewedAt: r.reviewedAt,
      },
    ]),
  );

  const csv = featuresToCsv(features, reviewMap);
  const layerSlug = sanitizeName(layer.name);

  await mkdir(EXPORTS_DIR, { recursive: true });
  await mkdir(ARCHIVE_DIR, { recursive: true });

  const currentFilename = `review-results-${layerSlug}.csv`;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const archiveFilename = `${timestamp}-review-results-${layerSlug}.csv`;

  await writeFile(join(EXPORTS_DIR, currentFilename), csv, "utf-8");
  await writeFile(join(ARCHIVE_DIR, archiveFilename), csv, "utf-8");

  c.header("Content-Type", "text/csv");
  c.header("Content-Disposition", `attachment; filename="${currentFilename}"`);
  return c.body(csv);
});

// GET /api/exports/layers/:id
exports_.get("/layers/:id", async (c) => {
  const id = c.req.param("id");
  const layer = layerQueries.getById.get(id);
  if (!layer) return c.json({ error: "Layer not found" }, 404);

  const layerSlug = sanitizeName(layer.name);
  const currentFilename = `review-results-${layerSlug}.csv`;

  let current: string | null = null;
  try {
    await readFile(join(EXPORTS_DIR, currentFilename));
    current = currentFilename;
  } catch {
    current = null;
  }

  let archive: string[] = [];
  try {
    const files = await readdir(ARCHIVE_DIR);
    archive = files
      .filter(
        (f) => f.includes(`review-results-${layerSlug}`) && f.endsWith(".csv"),
      )
      .sort()
      .reverse();
  } catch {
    archive = [];
  }

  return c.json({ current, archive });
});

// GET /api/exports/download/:filename
exports_.get("/download/:filename", async (c) => {
  const filename = c.req.param("filename");
  try {
    const content = await readFile(join(EXPORTS_DIR, filename), "utf-8");
    c.header("Content-Type", "text/csv");
    c.header("Content-Disposition", `attachment; filename="${filename}"`);
    return c.body(content);
  } catch {
    return c.json({ error: "File not found" }, 404);
  }
});

// GET /api/exports/download/archive/:filename
exports_.get("/download/archive/:filename", async (c) => {
  const filename = c.req.param("filename");
  try {
    const content = await readFile(join(ARCHIVE_DIR, filename), "utf-8");
    c.header("Content-Type", "text/csv");
    c.header("Content-Disposition", `attachment; filename="${filename}"`);
    return c.body(content);
  } catch {
    return c.json({ error: "File not found" }, 404);
  }
});

export default exports_;
