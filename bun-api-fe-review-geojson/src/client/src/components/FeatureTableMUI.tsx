import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  IconButton,
} from '@mui/material';
import type { GeoJSONFeature } from '../../../types/index.js';

interface FeatureTableMUIProps {
  features: GeoJSONFeature[];
  reviews: Map<string | number, boolean>;
  onFeatureSelect?: (feature: GeoJSONFeature) => void;
  onToggleFlag?: (featureId: string | number, currentFlag: boolean) => void;
}

type Order = 'asc' | 'desc';

export function FeatureTableMUI({
  features,
  reviews,
  onFeatureSelect,
  onToggleFlag,
}: FeatureTableMUIProps) {
  const [orderBy, setOrderBy] = useState<string>('id');
  const [order, setOrder] = useState<Order>('asc');

  const propertyKeys = features.length > 0 ? Object.keys(features[0].properties || {}) : [];

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedFeatures = [...features].sort((a, b) => {
    let aVal: unknown = a.id;
    let bVal: unknown = b.id;

    if (orderBy === 'flag') {
      aVal = reviews.get(a.id!) ? 1 : 0;
      bVal = reviews.get(b.id!) ? 1 : 0;
    } else if (orderBy in (a.properties || {})) {
      aVal = a.properties[orderBy];
      bVal = b.properties[orderBy];
    }

    const comparison =
      typeof aVal === 'string' && typeof bVal === 'string'
        ? aVal.localeCompare(bVal)
        : aVal < bVal
        ? -1
        : aVal > bVal
        ? 1
        : 0;

    return order === 'asc' ? comparison : -comparison;
  });

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'id'}
                direction={orderBy === 'id' ? order : 'asc'}
                onClick={() => handleRequestSort('id')}
              >
                ID
              </TableSortLabel>
            </TableCell>
            {propertyKeys.map((key) => (
              <TableCell key={key}>
                <TableSortLabel
                  active={orderBy === key}
                  direction={orderBy === key ? order : 'asc'}
                  onClick={() => handleRequestSort(key)}
                >
                  {key}
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell>
              <TableSortLabel
                active={orderBy === 'flag'}
                direction={orderBy === 'flag' ? order : 'asc'}
                onClick={() => handleRequestSort('flag')}
              >
                Flag
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedFeatures.map((feature) => {
            const isFlagged = reviews.get(feature.id!) || false;
            return (
              <TableRow
                key={feature.id}
                hover
                onClick={() => onFeatureSelect?.(feature)}
                sx={{
                  cursor: onFeatureSelect ? 'pointer' : 'default',
                  backgroundColor: isFlagged ? '#ffecec' : 'transparent',
                  '&:hover': {
                    backgroundColor: isFlagged ? '#ffd9d9 !important' : undefined,
                  },
                }}
              >
                <TableCell>{feature.id}</TableCell>
                {propertyKeys.map((key) => (
                  <TableCell key={key}>{String(feature.properties[key] ?? '')}</TableCell>
                ))}
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFlag?.(feature.id!, isFlagged);
                    }}
                    sx={{ fontSize: '1.5rem' }}
                  >
                    {isFlagged ? '🔴' : '🟢'}
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
