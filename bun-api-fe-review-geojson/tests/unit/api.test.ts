import { describe, it, expect, beforeEach } from 'vitest';
import { Database } from 'bun:sqlite';

describe('API Layer', () => {
  let db: Database;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE layers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        visible INTEGER NOT NULL DEFAULT 1,
        color TEXT
      );

      CREATE TABLE feature_reviews (
        feature_id TEXT NOT NULL,
        layer_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reviewed_at TEXT NOT NULL,
        PRIMARY KEY (feature_id, layer_id)
      );
    `);
  });

  it('should create layer table', () => {
    const result = db.query("SELECT name FROM sqlite_master WHERE type='table' AND name='layers'").get();
    expect(result).toBeDefined();
  });

  it('should insert and retrieve a layer', () => {
    const insertQuery = db.query('INSERT INTO layers (id, name, url, visible) VALUES (?, ?, ?, ?) RETURNING *');
    const layer = insertQuery.get('test-id', 'Test Layer', 'http://example.com/data.geojson', 1);

    expect(layer).toMatchObject({
      id: 'test-id',
      name: 'Test Layer',
      url: 'http://example.com/data.geojson',
      visible: 1,
    });
  });

  it('should insert and retrieve a feature review', () => {
    db.query('INSERT INTO layers (id, name, url, visible) VALUES (?, ?, ?, ?)').run(
      'layer-1',
      'Test Layer',
      'http://example.com/data.geojson',
      1
    );

    const insertReview = db.query(
      'INSERT INTO feature_reviews (feature_id, layer_id, status, reviewed_at) VALUES (?, ?, ?, ?) RETURNING *'
    );
    const review = insertReview.get('feature-1', 'layer-1', 'flagged', new Date().toISOString());

    expect(review).toMatchObject({
      feature_id: 'feature-1',
      layer_id: 'layer-1',
      status: 'flagged',
    });
  });
});
