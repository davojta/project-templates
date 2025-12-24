import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import { debounce } from 'lodash'

export interface MapState {
  lng: number
  lat: number
  zoom: number
}

export interface UseMapOptions {
  initialCenter: [number, number]
  initialZoom: number
  accessToken: string
}

export interface UseMapReturn {
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  mapState: MapState
  resetView: () => void
  isLoaded: boolean
}

export function useMap(options: UseMapOptions): UseMapReturn {
  const { initialCenter, initialZoom, accessToken } = options
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapState, setMapState] = useState<MapState>({
    lng: initialCenter[0],
    lat: initialCenter[1],
    zoom: initialZoom,
  })

  const updateMapState = useMemo(
    () =>
      debounce((map: mapboxgl.Map) => {
        const center = map.getCenter()
        const zoom = map.getZoom()
        setMapState({
          lng: center.lng,
          lat: center.lat,
          zoom: zoom,
        })
      }, 16),
    []
  )

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapboxgl.accessToken = accessToken

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: initialCenter,
      zoom: initialZoom,
    })

    map.on('load', () => {
      setIsLoaded(true)
    })

    map.on('move', () => {
      updateMapState(map)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [accessToken, initialCenter, initialZoom, updateMapState])

  const resetView = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: initialCenter,
        zoom: initialZoom,
      })
    }
  }, [initialCenter, initialZoom])

  return {
    mapContainerRef,
    mapState,
    resetView,
    isLoaded,
  }
}
