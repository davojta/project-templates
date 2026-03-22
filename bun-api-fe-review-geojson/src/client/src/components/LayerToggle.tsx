import type { Layer } from '../../../types/index.js';

interface LayerToggleProps {
  layers: Layer[];
  onToggle: (layerId: string) => void;
  onApplyFlags?: (layerId: string) => void;
  isApplying?: boolean;
}

export function LayerToggle({ layers, onToggle, onApplyFlags, isApplying }: LayerToggleProps) {
  return (
    <div style={{ padding: '1rem', borderBottom: '1px solid #ddd' }} data-testid="layer-toggle" aria-label="layer-toggle" role="group">
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Layers</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {layers.map((layer) => (
          <div key={layer.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} data-testid={`layer-item-${layer.id}`}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={() => onToggle(layer.id)}
                style={{ cursor: 'pointer' }}
                data-testid={`layer-checkbox-${layer.id}`}
                aria-label={`layer-toggle-${layer.name}`}
              />
              <span>{layer.name}</span>
            </label>
            {onApplyFlags && layer.visible && (
              <button
                onClick={() => onApplyFlags(layer.id)}
                disabled={isApplying}
                data-testid={`layer-apply-${layer.id}`}
                aria-label={`layer-apply-${layer.name}`}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#007cbf',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isApplying ? 'not-allowed' : 'pointer',
                  opacity: isApplying ? 0.6 : 1,
                }}
              >
                {isApplying ? 'Applying...' : 'Apply'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
