# Change: Add Python Geospatial CLI Template

## Why
Add a specialized Python CLI template for geospatial analysis using the modern 2025 geospatial stack (SedonaDB, QuackOSM, KeplerGL) to provide developers with a production-ready starting point for OSM data processing and spatial analysis tools.

## What Changes
- New template directory: `python-geo-cli/` with complete geospatial CLI structure
- Dependencies: SedonaDB, QuackOSM, Click, Pydantic, Rich, KeplerGL, GeoPandas
- CLI commands: download, process, visualize for OSM data handling
- Data formats: GeoParquet for optimized spatial data storage
- Performance: 5-40x faster spatial operations with SedonaDB
- Documentation: Comprehensive README with geospatial examples

## Impact
- **Affected specs**: New capability `python-geo-cli`
- **Affected code**: New standalone template directory
- **Integration**: Follows existing project patterns and conventions
- **Dependencies**: Adds spatial data processing dependencies to template collection