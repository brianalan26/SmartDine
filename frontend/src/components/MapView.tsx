import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Restaurant {
    id: number
    name: string
    latitude: string
    longitude: string
    rating: string
    cuisines: string
}

interface MapViewProps {
    restaurants: Restaurant[]
    userLocation: [number, number] | null
    onRestaurantClick: (restaurant: Restaurant) => void
    onRecenter: () => void
}

const restaurantIcon = L.divIcon({
    className: 'custom-marker',
    html: `
    <div style="
      background-color: #ff6b35;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-size: 16px;
        font-weight: bold;
      ">🍽️</span>
    </div>
  `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
})

const userIcon = L.divIcon({
    className: 'user-marker',
    html: `
    <div style="
      background-color: #3b82f6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>
  `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
})

export default function MapView({
    restaurants,
    userLocation,
    onRestaurantClick,
    onRecenter,
}: MapViewProps) {
    const mapRef = useRef<L.Map | null>(null)
    const markersRef = useRef<L.Marker[]>([])
    const userMarkerRef = useRef<L.Marker | null>(null)

    useEffect(() => {
        if (!mapRef.current) {
            const map = L.map('map').setView([11.0168, 76.9558], 13)

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map)

            mapRef.current = map
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (!mapRef.current) return

        markersRef.current.forEach((marker) => marker.remove())
        markersRef.current = []

        restaurants.forEach((restaurant) => {
            const lat = parseFloat(restaurant.latitude)
            const lng = parseFloat(restaurant.longitude)

            const marker = L.marker([lat, lng], { icon: restaurantIcon })
                .addTo(mapRef.current!)
                .bindPopup(
                    `
          <div style="min-width: 200px">
            <h3 style="font-weight: 600; margin-bottom: 4px">${restaurant.name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px">${restaurant.cuisines}</p>
            <p style="font-size: 12px; color: #ff6b35">★ ${restaurant.rating}</p>
          </div>
        `
                )
                .on('click', () => {
                    onRestaurantClick(restaurant)
                })

            markersRef.current.push(marker)
        })

        if (restaurants.length > 0) {
            const bounds = L.latLngBounds(
                restaurants.map((r) => [parseFloat(r.latitude), parseFloat(r.longitude)])
            )
            mapRef.current.fitBounds(bounds, { padding: [50, 50] })
        }
    }, [restaurants, onRestaurantClick])

    useEffect(() => {
        if (!mapRef.current || !userLocation) return

        if (userMarkerRef.current) {
            userMarkerRef.current.remove()
        }

        userMarkerRef.current = L.marker(userLocation, { icon: userIcon })
            .addTo(mapRef.current)
            .bindPopup('You are here')

        mapRef.current.setView(userLocation, 13)
    }, [userLocation])

    return (
        <div className="relative h-full">
            <div id="map" className="h-full w-full"></div>

            <button
                onClick={onRecenter}
                className="absolute bottom-6 right-6 bg-white px-4 py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors z-[1000] flex items-center gap-2"
            >
                <span className="text-xl">📍</span>
                <span className="font-medium">My Location</span>
            </button>

            {restaurants.length > 0 && (
                <div className="absolute top-6 left-6 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-primary">{restaurants.length}</span>{' '}
                        {restaurants.length === 1 ? 'restaurant' : 'restaurants'}
                    </p>
                </div>
            )}
        </div>
    )
}
