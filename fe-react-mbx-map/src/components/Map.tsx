import { useMap } from '../hooks/useMap'
import 'mapbox-gl/dist/mapbox-gl.css'
import '../styles/map.css'

const INITIAL_CENTER: [number, number] = [-74.0242, 40.6941]
const INITIAL_ZOOM = 10.12

function getAccessToken(): string {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  if (!token) {
    console.error(
      'VITE_MAPBOX_ACCESS_TOKEN is not set. ' +
      'Create a .env file with VITE_MAPBOX_ACCESS_TOKEN=your_token'
    )
    return ''
  }
  return token
}

function Map() {
  const accessToken = getAccessToken()

  const { mapContainerRef, mapState, resetView, isLoaded } = useMap({
    initialCenter: INITIAL_CENTER,
    initialZoom: INITIAL_ZOOM,
    accessToken,
  })

  if (!accessToken) {
    return (
      <div className="map-error">
        <h2>Mapbox Access Token Required</h2>
        <p>
          Create a <code>.env</code> file in the project root with:
        </p>
        <pre>VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token</pre>
        <p>
          Get your token at{' '}
          <a href="https://account.mapbox.com" target="_blank" rel="noopener noreferrer">
            account.mapbox.com
          </a>
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="sidebar" data-testid="map-sidebar">
        Longitude: {mapState.lng.toFixed(4)} | Latitude: {mapState.lat.toFixed(4)} | Zoom: {mapState.zoom.toFixed(2)}
      </div>
      <button
        className="reset-button"
        onClick={resetView}
        disabled={!isLoaded}
        data-testid="reset-button"
      >
        Reset
      </button>
      <div
        id="map-container"
        ref={mapContainerRef}
        data-testid="map-container"
      />
    </>
  )
}

export default Map
