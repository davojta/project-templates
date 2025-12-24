import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Layer } from '../../../types/index.js';

export function useLayers() {
  return useQuery({
    queryKey: ['layers'],
    queryFn: async (): Promise<Layer[]> => {
      const res = await fetch('/api/layers');
      if (!res.ok) throw new Error('Failed to fetch layers');
      return res.json();
    },
  });
}

export function useCreateLayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (layer: Omit<Layer, 'id'>) => {
      const res = await fetch('/api/layers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layer),
      });
      if (!res.ok) throw new Error('Failed to create layer');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layers'] });
    },
  });
}

export function useUpdateLayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Layer> & { id: string }) => {
      const res = await fetch(`/api/layers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update layer');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layers'] });
    },
  });
}

export function useDeleteLayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/layers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete layer');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layers'] });
    },
  });
}

export function useApplyLayerFlags() {
  return useMutation({
    mutationFn: async (layerId: string) => {
      const res = await fetch(`/api/layers/${layerId}/apply-flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to apply flags');
      }
      return res.json();
    },
  });
}
