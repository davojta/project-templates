import { z } from 'zod';

export const layerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  visible: z.boolean(),
  color: z.string().optional(),
});

export const createLayerSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  visible: z.boolean().default(true),
  color: z.string().optional(),
});

export const updateLayerSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  visible: z.boolean().optional(),
  color: z.string().optional(),
});

export const updateFeatureReviewSchema = z.object({
  isFlagged: z.boolean(),
});

export const featureReviewSchema = z.object({
  featureId: z.string(),
  layerId: z.string(),
  isFlagged: z.boolean(),
  reviewedAt: z.string(),
});
