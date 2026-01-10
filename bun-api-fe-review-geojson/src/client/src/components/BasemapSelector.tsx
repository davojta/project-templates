import { Card, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { BASEMAPS } from '../config.js';

interface BasemapSelectorProps {
  currentBasemap: string;
  onBasemapChange: (styleUrl: string) => void;
}

export function BasemapSelector({ currentBasemap, onBasemapChange }: BasemapSelectorProps) {
  return (
    <Card
      sx={{
        position: 'absolute',
        bottom: 24,
        right: 10,
        padding: 1.5,
        zIndex: 1,
        minWidth: 160,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Basemap
      </Typography>
      <RadioGroup
        value={currentBasemap}
        onChange={(e) => {
          const selected = BASEMAPS.find((b) => b.id === e.target.value);
          if (selected) {
            onBasemapChange(selected.styleUrl);
          }
        }}
      >
        {BASEMAPS.map((basemap) => (
          <FormControlLabel
            key={basemap.id}
            value={basemap.id}
            control={<Radio size="small" />}
            label={basemap.name}
            sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
          />
        ))}
      </RadioGroup>
    </Card>
  );
}
