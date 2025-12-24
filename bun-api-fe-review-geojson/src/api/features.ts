import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { featureReviewQueries } from './db.js';
import { updateFeatureReviewSchema } from './schemas.js';

const features = new Hono();

features.get('/layer/:layerId', (c) => {
  const layerId = c.req.param('layerId');
  const reviews = featureReviewQueries.getByLayerId.all(layerId);
  return c.json(reviews);
});

features.get('/:layerId/:featureId', (c) => {
  const layerId = c.req.param('layerId');
  const featureId = c.req.param('featureId');

  const review = featureReviewQueries.getByFeatureId.get(featureId, layerId);

  if (!review) {
    return c.json({
      featureId,
      layerId,
      isFlagged: false,
      reviewedAt: new Date().toISOString(),
    });
  }

  return c.json(review);
});

features.put(
  '/:layerId/:featureId',
  zValidator('json', updateFeatureReviewSchema),
  (c) => {
    const layerId = c.req.param('layerId');
    const featureId = c.req.param('featureId');
    const { isFlagged } = c.req.valid('json');

    const review = featureReviewQueries.upsert.get(
      featureId,
      layerId,
      isFlagged ? 1 : 0,
      new Date().toISOString()
    );

    return c.json(review);
  }
);

export default features;
