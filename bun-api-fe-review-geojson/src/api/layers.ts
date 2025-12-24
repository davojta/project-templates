import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { layerQueries, featureReviewQueries } from './db.js';
import { createLayerSchema, updateLayerSchema } from './schemas.js';
import { randomUUID } from 'crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const layers = new Hono();

layers.get('/', (c) => {
  const allLayers = layerQueries.getAll.all();
  return c.json(allLayers);
});

layers.get('/:id', (c) => {
  const id = c.req.param('id');
  const layer = layerQueries.getById.get(id);

  if (!layer) {
    return c.json({ error: 'Layer not found' }, 404);
  }

  return c.json(layer);
});

layers.post('/', zValidator('json', createLayerSchema), (c) => {
  const data = c.req.valid('json');
  const id = randomUUID();

  const layer = layerQueries.create.get(
    id,
    data.name,
    data.url,
    data.visible ? 1 : 0,
    data.color || null
  );

  return c.json(layer, 201);
});

layers.put('/:id', zValidator('json', updateLayerSchema), (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');

  const existing = layerQueries.getById.get(id);
  if (!existing) {
    return c.json({ error: 'Layer not found' }, 404);
  }

  const layer = layerQueries.update.get(
    data.name ?? existing.name,
    data.url ?? existing.url,
    data.visible !== undefined ? (data.visible ? 1 : 0) : (existing.visible ? 1 : 0),
    data.color !== undefined ? data.color : existing.color,
    id
  );

  return c.json(layer);
});

layers.delete('/:id', (c) => {
  const id = c.req.param('id');
  const existing = layerQueries.getById.get(id);

  if (!existing) {
    return c.json({ error: 'Layer not found' }, 404);
  }

  layerQueries.delete.run(id);
  return c.json({ success: true }, 200);
});

layers.post('/:id/apply-flags', async (c) => {
  const id = c.req.param('id');
  const layer = layerQueries.getById.get(id);

  if (!layer) {
    return c.json({ error: 'Layer not found' }, 404);
  }

  const reviews = featureReviewQueries.getByLayerId.all(id);
  const flagMap = new Map(reviews.map(r => [r.featureId, r.isFlagged]));

  const filePath = join(process.cwd(), layer.url.replace(/^\//, ''));

  try {
    const content = await readFile(filePath, 'utf-8');
    const geojson = JSON.parse(content);

    if (geojson.features && Array.isArray(geojson.features)) {
      geojson.features = geojson.features.map((feature: any) => {
        const featureId = feature.id || feature.properties?.id;
        const flagValue = flagMap.get(String(featureId));

        return {
          ...feature,
          properties: {
            ...feature.properties,
            isFlagged: Boolean(flagValue),
          },
        };
      });
    }

    await writeFile(filePath, JSON.stringify(geojson, null, 2), 'utf-8');

    return c.json({
      success: true,
      message: 'Flags applied to GeoJSON file',
      updatedFeatures: geojson.features.length
    });
  } catch (error) {
    console.error('Error applying flags:', error);
    return c.json({
      error: 'Failed to apply flags to file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default layers;
