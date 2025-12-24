import { Database } from 'bun:sqlite';
import type { Layer, FeatureReview } from '../types/index.js';

export const db = new Database('db.sqlite', { create: true });

db.exec(`
  CREATE TABLE IF NOT EXISTS layers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    visible INTEGER NOT NULL DEFAULT 1,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS feature_reviews (
    feature_id TEXT NOT NULL,
    layer_id TEXT NOT NULL,
    is_flagged INTEGER NOT NULL DEFAULT 0,
    reviewed_at TEXT NOT NULL,
    PRIMARY KEY (feature_id, layer_id),
    FOREIGN KEY (layer_id) REFERENCES layers(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_feature_reviews_layer_id ON feature_reviews(layer_id);
  CREATE INDEX IF NOT EXISTS idx_feature_reviews_is_flagged ON feature_reviews(is_flagged);
`);

export const layerQueries = {
  getAll: db.query<Layer, []>('SELECT * FROM layers'),

  getById: db.query<Layer, [string]>('SELECT * FROM layers WHERE id = ?'),

  create: db.query<Layer, [string, string, string, number, string | null]>(
    'INSERT INTO layers (id, name, url, visible, color) VALUES (?, ?, ?, ?, ?) RETURNING *'
  ),

  update: db.query<Layer, [string, string, number, string | null, string]>(
    'UPDATE layers SET name = ?, url = ?, visible = ?, color = ? WHERE id = ? RETURNING *'
  ),

  delete: db.query<void, [string]>('DELETE FROM layers WHERE id = ?'),
};

export const featureReviewQueries = {
  getByFeatureId: db.query<FeatureReview, [string, string]>(
    'SELECT feature_id as featureId, layer_id as layerId, is_flagged as isFlagged, reviewed_at as reviewedAt FROM feature_reviews WHERE feature_id = ? AND layer_id = ?'
  ),

  getByLayerId: db.query<FeatureReview, [string]>(
    'SELECT feature_id as featureId, layer_id as layerId, is_flagged as isFlagged, reviewed_at as reviewedAt FROM feature_reviews WHERE layer_id = ?'
  ),

  upsert: db.query<FeatureReview, [string, string, number, string]>(
    `INSERT INTO feature_reviews (feature_id, layer_id, is_flagged, reviewed_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(feature_id, layer_id) DO UPDATE SET
       is_flagged = excluded.is_flagged,
       reviewed_at = excluded.reviewed_at
     RETURNING feature_id as featureId, layer_id as layerId, is_flagged as isFlagged, reviewed_at as reviewedAt`
  ),
};
