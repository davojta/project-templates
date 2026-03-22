import { Card, Typography } from '@mui/material';
import type { GeoJSONFeature } from '../../../types/index.js';

interface FeatureDetailsProps {
  feature: GeoJSONFeature;
}

export function FeatureDetails({ feature }: FeatureDetailsProps) {
  return (
    <Card
      data-testid="feature-info"
      aria-label="feature-info"
      role="region"
      sx={{
        position: 'absolute',
        bottom: 24,
        left: 10,
        padding: 1.5,
        zIndex: 1,
        minWidth: 300,
        maxWidth: 600,
        maxHeight: '60%',
        overflow: 'auto',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Feature Details
      </Typography>
      <div data-testid="feature-properties" aria-label="feature-properties" style={{ fontSize: '0.875rem' }}>
        {Object.entries(feature.properties).map(([key, value]) => (
          <div key={key} style={{ padding: '0.15rem 0' }}>
            <strong>{key}:</strong> {String(value)}
          </div>
        ))}
      </div>
    </Card>
  );
}
