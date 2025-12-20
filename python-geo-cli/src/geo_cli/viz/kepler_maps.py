"""KeplerGL visualization for geospatial data."""

import json
from pathlib import Path
from typing import Dict, List, Optional, Union, Any
import logging

logger = logging.getLogger(__name__)


class KeplerVisualizer:
    """KeplerGL visualization for geospatial data."""

    def __init__(self):
        """Initialize the KeplerGL visualizer."""
        self.config = self._get_default_config()

    def create_visualization(
        self,
        data_path: Union[str, Path],
        label_field: Optional[str] = None,
        color_field: Optional[str] = None,
        size_field: Optional[str] = None,
        config: Optional[Dict] = None
    ) -> Dict:
        """Create KeplerGL configuration for spatial data.

        Args:
            data_path: Path to the geospatial data file
            label_field: Field to use for labeling features
            color_field: Field to use for color coding
            size_field: Field to use for sizing features
            config: Custom KeplerGL configuration

        Returns:
            Dictionary with KeplerGL configuration and data
        """
        try:
            import geopandas as gpd

            # Load the data
            gdf = gpd.read_file(data_path)

            # Ensure coordinates are in WGS84 for KeplerGL
            if gdf.crs != 'EPSG:4326':
                logger.info(f"Reprojecting from {gdf.crs} to EPSG:4326")
                gdf = gdf.to_crs('EPSG:4326')

            # Convert to GeoJSON
            geojson = json.loads(gdf.to_json())

            # Calculate center and zoom
            bounds = gdf.total_bounds
            center_lat = (bounds[1] + bounds[3]) / 2
            center_lon = (bounds[0] + bounds[2]) / 2

            # Determine zoom level based on bounds
            lat_range = bounds[3] - bounds[1]
            lon_range = bounds[2] - bounds[0]
            max_range = max(lat_range, lon_range)

            # Rough zoom calculation (simplified)
            if max_range > 10:
                zoom = 2
            elif max_range > 5:
                zoom = 4
            elif max_range > 1:
                zoom = 6
            elif max_range > 0.1:
                zoom = 8
            elif max_range > 0.01:
                zoom = 10
            else:
                zoom = 12

            # Create or use custom config
            if config:
                kepler_config = config
                # Update map state to center on our data
                if 'config' in kepler_config and 'visState' in kepler_config['config']:
                    kepler_config['config']['visState']['mapState'].update({
                        'latitude': center_lat,
                        'longitude': center_lon,
                        'zoom': zoom
                    })
            else:
                kepler_config = self._create_layer_config(
                    gdf,
                    label_field,
                    color_field,
                    size_field,
                    center_lat,
                    center_lon,
                    zoom
                )

            return {
                'datasets': [
                    {
                        'info': {
                            'id': 'data',
                            'label': 'Spatial Data'
                        },
                        'data': geojson
                    }
                ],
                'config': kepler_config['config']
            }

        except Exception as e:
            logger.error(f"Failed to create visualization: {e}")
            raise

    def _create_layer_config(
        self,
        gdf,
        label_field: Optional[str],
        color_field: Optional[str],
        size_field: Optional[str],
        center_lat: float,
        center_lon: float,
        zoom: int
    ) -> Dict:
        """Create KeplerGL layer configuration."""
        # Determine geometry type
        geom_types = gdf.geometry.geom_type.unique()

        # Default configuration
        config = {
            'version': 'v1',
            'config': {
                'visState': {
                    'layers': [],
                    'mapState': {
                        'latitude': center_lat,
                        'longitude': center_lon,
                        'zoom': zoom,
                        'bearing': 0,
                        'pitch': 0
                    },
                    'mapStyle': {
                        'styleType': 'light'
                    }
                }
            }
        }

        # Create layer based on geometry type
        if 'Point' in geom_types or 'MultiPoint' in geom_types:
            layer_config = self._create_point_layer(gdf, label_field, color_field, size_field)
        elif 'LineString' in geom_types or 'MultiLineString' in geom_types:
            layer_config = self._create_line_layer(gdf, label_field, color_field)
        elif 'Polygon' in geom_types or 'MultiPolygon' in geom_types:
            layer_config = self._create_polygon_layer(gdf, label_field, color_field)
        else:
            # Default to point layer
            layer_config = self._create_point_layer(gdf, label_field, color_field, size_field)

        config['config']['visState']['layers'].append(layer_config)

        return config

    def _create_point_layer(
        self,
        gdf,
        label_field: Optional[str],
        color_field: Optional[str],
        size_field: Optional[str]
    ) -> Dict:
        """Create point layer configuration."""
        layer_config = {
            'id': 'point_layer',
            'type': 'geojson',
            'config': {
                'dataId': 'data',
                'label': 'Points',
                'color': [255, 0, 0],
                'columns': {},
                'isVisible': True,
                'visConfig': {
                    'opacity': 0.8,
                    'strokeOpacity': 0.8,
                    'thickness': 0.5,
                    'strokeColor': [255, 255, 255],
                    'colorRange': {
                        'name': 'Global Warming',
                        'type': 'sequential',
                        'category': 'Uber',
                        'colors': ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
                    },
                    'radius': 10
                }
            },
            'visualChannels': {
                'colorField': None,
                'sizeField': None
            }
        }

        # Configure color field
        if color_field and color_field in gdf.columns:
            layer_config['visualChannels']['colorField'] = {
                'name': color_field,
                'type': 'string' if gdf[color_field].dtype == 'object' else 'numeric'
            }

        # Configure size field
        if size_field and size_field in gdf.columns:
            layer_config['visualChannels']['sizeField'] = {
                'name': size_field,
                'type': 'numeric'
            }

        # Configure label field
        if label_field and label_field in gdf.columns:
            layer_config['config']['label'] = label_field

        return layer_config

    def _create_line_layer(
        self,
        gdf,
        label_field: Optional[str],
        color_field: Optional[str]
    ) -> Dict:
        """Create line layer configuration."""
        layer_config = {
            'id': 'line_layer',
            'type': 'geojson',
            'config': {
                'dataId': 'data',
                'label': 'Lines',
                'color': [0, 0, 255],
                'columns': {},
                'isVisible': True,
                'visConfig': {
                    'opacity': 0.8,
                    'strokeOpacity': 0.8,
                    'thickness': 2,
                    'strokeColor': [0, 0, 255],
                    'colorRange': {
                        'name': 'Uber Viz Sequential 1',
                        'type': 'sequential',
                        'category': 'Uber',
                        'colors': ['#07133A', '#20417C', '#396FBD', '#529CFD', '#6BC9FE', '#84F6FF']
                    }
                }
            },
            'visualChannels': {
                'colorField': None,
                'sizeField': None
            }
        }

        # Configure color field
        if color_field and color_field in gdf.columns:
            layer_config['visualChannels']['colorField'] = {
                'name': color_field,
                'type': 'string' if gdf[color_field].dtype == 'object' else 'numeric'
            }

        # Configure label field
        if label_field and label_field in gdf.columns:
            layer_config['config']['label'] = label_field

        return layer_config

    def _create_polygon_layer(
        self,
        gdf,
        label_field: Optional[str],
        color_field: Optional[str]
    ) -> Dict:
        """Create polygon layer configuration."""
        layer_config = {
            'id': 'polygon_layer',
            'type': 'geojson',
            'config': {
                'dataId': 'data',
                'label': 'Polygons',
                'color': [0, 255, 0],
                'columns': {},
                'isVisible': True,
                'visConfig': {
                    'opacity': 0.6,
                    'strokeOpacity': 0.8,
                    'thickness': 1,
                    'strokeColor': [255, 255, 255],
                    'colorRange': {
                        'name': 'Google Earth',
                        'type': 'sequential',
                        'category': 'Google',
                        'colors': ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026']
                    }
                }
            },
            'visualChannels': {
                'colorField': None,
                'sizeField': None
            }
        }

        # Configure color field
        if color_field and color_field in gdf.columns:
            layer_config['visualChannels']['colorField'] = {
                'name': color_field,
                'type': 'string' if gdf[color_field].dtype == 'object' else 'numeric'
            }

        # Configure label field
        if label_field and label_field in gdf.columns:
            layer_config['config']['label'] = label_field

        return layer_config

    def _get_default_config(self) -> Dict:
        """Get default KeplerGL configuration."""
        return {
            'version': 'v1',
            'config': {
                'visState': {
                    'filters': [],
                    'layers': [],
                    'interactionConfig': {
                        'tooltip': {
                            'fieldsToShow': {},
                            'enabled': True
                        },
                        'brush': {
                            'enabled': False
                        },
                        'geocoder': {
                            'enabled': False
                        },
                        'coordinate': {
                            'enabled': False
                        }
                    },
                    'layerBlending': 'normal',
                    'splitMaps': [],
                    'animationConfig': {
                        'currentTime': None,
                        'speed': 1
                    }
                },
                'mapState': {
                    'bearing': 0,
                    'dragRotate': True,
                    'latitude': 0,
                    'longitude': 0,
                    'pitch': 0,
                    'zoom': 1,
                    'isSplit': False
                },
                'mapStyle': {
                    'styleType': 'light',
                    'topLayerGroups': {},
                    'visibleLayerGroups': {
                        'label': True,
                        'road': True,
                        'border': False,
                        'building': True,
                        'water': True,
                        'land': True,
                        '3d building': False
                    },
                    'threeDBuildingColor': [
                        9.665468314072011,
                        17.18305478057247,
                        31.1442867897876
                    ],
                    'mapStyles': {}
                }
            }
        }

    def save_html(
        self,
        viz_data: Dict,
        output_path: Union[str, Path],
        title: str = "Geospatial Visualization",
        width: str = "100%",
        height: str = "100vh"
    ) -> None:
        """Save visualization as HTML file.

        Args:
            viz_data: KeplerGL visualization data
            output_path: Output HTML file path
            title: HTML title
            width: Container width
            height: Container height
        """
        html_content = self._generate_html(viz_data, title, width, height)

        with open(output_path, 'w') as f:
            f.write(html_content)

        logger.info(f"Saved visualization to {output_path}")

    def _generate_html(
        self,
        viz_data: Dict,
        title: str,
        width: str,
        height: str
    ) -> str:
        """Generate HTML content for KeplerGL visualization."""
        return f"""
<!DOCTYPE html>
<html>
<head>
    <title>{title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }}
        .container {{
            width: {width};
            height: {height};
            position: relative;
        }}
        .header {{
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.95);
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }}
        .header h3 {{
            margin: 0 0 4px 0;
            color: #333;
            font-size: 16px;
            font-weight: 600;
        }}
        .header p {{
            margin: 0;
            color: #666;
            font-size: 14px;
        }}
        .loading {{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 1001;
        }}
        .spinner {{
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }}
        @keyframes spin {{
            0% {{ transform: rotate(0deg); }}
            100% {{ transform: rotate(360deg); }}
        }}
    </style>
    <script src="https://unpkg.com/kepler.gl@latest/umd/keplergl.min.js"></script>
</head>
<body>
    <div class="header">
        <h3>🗺️ {title}</h3>
        <p>Interactive map powered by KeplerGL</p>
    </div>
    <div class="loading" id="loading">
        <div class="spinner"></div>
        <p>Loading spatial data...</p>
    </div>
    <div class="container" id="map-container"></div>

    <script>
        const data = {json.dumps(viz_data)};

        // Initialize KeplerGL
        const keplergl = new keplergl.KeplerGl({{
            mapboxApiAccessToken: null,
            id: 'map'
        }});

        // Load the data
        keplergl.loadMap(data)
            .then(() => {{
                // Hide loading indicator
                document.getElementById('loading').style.display = 'none';

                // Add map to container
                document.getElementById('map-container').appendChild(keplergl.container);

                console.log('KeplerGL map loaded successfully');
            }})
            .catch((error) => {{
                console.error('Error loading KeplerGL map:', error);
                document.getElementById('loading').innerHTML = `
                    <div style="color: red;">
                        <p>Error loading map: ${{error.message}}</p>
                        <p>Please check the console for details.</p>
                    </div>
                `;
            }});

        // Handle window resize
        window.addEventListener('resize', () => {{
            if (keplergl && keplergl.container) {{
                keplergl.resize();
            }}
        }});
    </script>
</body>
</html>
"""