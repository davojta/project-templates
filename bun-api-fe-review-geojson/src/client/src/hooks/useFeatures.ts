import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeatureReview } from '../../../types/index.js';

export function useFeatureReview(layerId: string, featureId: string) {
  return useQuery({
    queryKey: ['feature-review', layerId, featureId],
    queryFn: async (): Promise<FeatureReview> => {
      const res = await fetch(`/api/features/${layerId}/${featureId}`);
      if (!res.ok) throw new Error('Failed to fetch feature review');
      return res.json();
    },
    enabled: !!layerId && !!featureId,
  });
}

export function useLayerReviews(layerId: string) {
  return useQuery({
    queryKey: ['layer-reviews', layerId],
    queryFn: async (): Promise<FeatureReview[]> => {
      const res = await fetch(`/api/features/layer/${layerId}`);
      if (!res.ok) throw new Error('Failed to fetch layer reviews');
      return res.json();
    },
    enabled: !!layerId,
  });
}

export function useUpdateFeatureReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      layerId,
      featureId,
      isFlagged,
    }: {
      layerId: string;
      featureId: string;
      isFlagged: boolean;
    }) => {
      const res = await fetch(`/api/features/${layerId}/${featureId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFlagged }),
      });
      if (!res.ok) throw new Error('Failed to update feature review');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['feature-review', variables.layerId, variables.featureId],
      });
      queryClient.invalidateQueries({
        queryKey: ['layer-reviews', variables.layerId],
      });
    },
  });
}
