# End-to-End Tests

This directory contains end-to-end tests for the geo-cli tool that test complete workflows in isolated environments.

## Test Coverage

The e2e tests cover:

### Spatial Processing Tests
- **Buffer Operations**: Testing the `geo-cli process spatial --operation buffer` command
- **Error Handling**: Validation of required parameters and error scenarios
- **Performance**: Ensuring operations complete within reasonable time limits

### Visualization Tests
- **Map Generation**: Testing the `geo-cli viz map` command with real spatial data
- **HTML Output**: Verification that KeplerGL HTML files are generated correctly
- **Complete Workflows**: End-to-end testing from data processing to visualization

## Running Tests

### Run all e2e tests:
```bash
make run-e2e-tests
# or
uv run pytest e2e-tests/
```

### Run specific tests:
```bash
# Run only spatial buffer tests
uv run pytest e2e-tests/test_geo_cli_e2e.py::TestGeoCliE2E::test_spatial_buffer_operation_e2e -v

# Run only visualization tests
uv run pytest e2e-tests/test_geo_cli_e2e.py::TestGeoCliE2E::test_map_visualization_e2e -v

# Run complete workflow tests
uv run pytest e2e-tests/test_geo_cli_e2e.py::TestGeoCliE2E::test_complete_workflow_e2e -v
```

### Run with verbose output:
```bash
uv run pytest e2e-tests/ -v -s
```

## Test Data Requirements

The tests require sample geospatial data to be available at:
- `data/processed/helsinki_buildings.geoparquet`

If the sample data is not available, tests will be automatically skipped.

## Test Environment

The e2e tests create isolated temporary environments for each test run to ensure:

1. **Isolation**: Each test runs in a clean environment
2. **Real World Conditions**: Tests use actual file system operations
3. **Subprocess Execution**: CLI commands are run as subprocesses, mimicking real usage
4. **Cleanup**: Temporary files and directories are automatically cleaned up

## Artifacts

Test artifacts are stored in temporary directories and automatically cleaned up. The tests also verify that:

- Output files are created in expected locations (`data/processed/`, `output-map/`)
- Generated files are valid (GeoParquet, HTML)
- Content is correctly formatted and contains expected data

## Performance Expectations

- **Spatial Operations**: Should complete within 30 seconds
- **Map Visualization**: Should complete within 10 seconds
- **Error Handling**: Should fail fast with clear error messages

## Debugging Failed Tests

To debug a failing e2e test:

1. **Run with verbose output**: `uv run pytest e2e-tests/ -v -s`
2. **Run a single test**: `uv run pytest e2e-tests/test_geo_cli_e2e.py::TestGeoCliE2E::test_name -v -s`
3. **Check temporary files**: The tests preserve temporary directories during teardown for debugging
4. **Examine output**: Look at stdout/stderr from CLI commands

## Adding New Tests

When adding new e2e tests:

1. Follow the existing class structure in `TestGeoCliE2E`
2. Use the provided `run_geo_cli()` helper method
3. Include proper cleanup in `teardown_method()`
4. Test both success and error scenarios
5. Verify actual output files are created and valid
6. Include performance assertions for long-running operations