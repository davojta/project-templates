import { useState } from 'react';
import type { GeoJSONFeature } from '../../../types/index.js';
import type { ReviewStatus } from '../../../types/index.js';

interface FeatureTableProps {
  features: GeoJSONFeature[];
  reviews: Map<string | number, ReviewStatus>;
  onFeatureSelect?: (feature: GeoJSONFeature) => void;
}

export function FeatureTable({ features, reviews, onFeatureSelect }: FeatureTableProps) {
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedFeatures = [...features].sort((a, b) => {
    let aVal: unknown = a.id;
    let bVal: unknown = b.id;

    if (sortKey === 'status') {
      aVal = reviews.get(a.id!) || 'pending';
      bVal = reviews.get(b.id!) || 'pending';
    } else if (sortKey in (a.properties || {})) {
      aVal = a.properties[sortKey];
      bVal = b.properties[sortKey];
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const propertyKeys = features.length > 0 ? Object.keys(features[0].properties || {}) : [];

  return (
    <div style={{ padding: '1rem', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th onClick={() => handleSort('id')} style={headerStyle}>
              ID {sortKey === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            {propertyKeys.map((key) => (
              <th key={key} onClick={() => handleSort(key)} style={headerStyle}>
                {key} {sortKey === key && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            ))}
            <th onClick={() => handleSort('status')} style={headerStyle}>
              Status {sortKey === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedFeatures.map((feature) => {
            const status = reviews.get(feature.id!) || 'pending';
            return (
              <tr
                key={feature.id}
                onClick={() => onFeatureSelect?.(feature)}
                style={{
                  ...rowStyle,
                  backgroundColor: status === 'flagged' ? '#ffecec' : 'transparent',
                }}
              >
                <td style={cellStyle}>{feature.id}</td>
                {propertyKeys.map((key) => (
                  <td key={key} style={cellStyle}>
                    {String(feature.properties[key] ?? '')}
                  </td>
                ))}
                <td style={cellStyle}>
                  <span style={getStatusBadgeStyle(status)}>{status}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  padding: '0.75rem',
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
  cursor: 'pointer',
  userSelect: 'none',
  backgroundColor: '#f5f5f5',
};

const rowStyle: React.CSSProperties = {
  cursor: 'pointer',
};

const cellStyle: React.CSSProperties = {
  padding: '0.75rem',
  borderBottom: '1px solid #eee',
};

function getStatusBadgeStyle(status: ReviewStatus): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
  };

  switch (status) {
    case 'flagged':
      return { ...baseStyle, backgroundColor: '#ff6b6b', color: 'white' };
    case 'approved':
      return { ...baseStyle, backgroundColor: '#51cf66', color: 'white' };
    default:
      return { ...baseStyle, backgroundColor: '#e9ecef', color: '#495057' };
  }
}
