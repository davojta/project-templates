import type { Layer } from '../../../types/index.js';

interface LayerToggleProps {
  layers: Layer[];
  onToggle: (layerId: string) => void;
  onApplyFlags?: (layerId: string) => void;
  isApplying?: boolean;
}

export function LayerToggle({ layers, onToggle, onApplyFlags, isApplying }: LayerToggleProps) {
  return (
    <div style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Layers</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {layers.map((layer) => (
          <div key={layer.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={() => onToggle(layer.id)}
                style={{ cursor: 'pointer' }}
              />
              <span>{layer.name}</span>
            </label>
            {onApplyFlags && layer.visible && (
              <button
                onClick={() => onApplyFlags(layer.id)}
                disabled={isApplying}
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
