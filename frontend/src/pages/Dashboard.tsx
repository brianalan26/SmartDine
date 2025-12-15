import { useState, useEffect } from 'react'
import MapView from '../components/MapView'
import ChatInterface from '../components/ChatInterface'
import FilterPanel from '../components/FilterPanel'
import RestaurantDetail from '../components/RestaurantDetail'
import SaveDiscoveryModal from '../components/SaveDiscoveryModal'
import { api } from '../services/api'

interface User {
    id: number
    username: string
    email: string
}

interface DashboardProps {
    user: User
    onLogout: () => void
}

interface Restaurant {
    id: number
    name: string
    address: string
    latitude: string
    longitude: string
    cuisines: string
    price_range: string
    average_cost: number
    rating: string
    tags: string
    must_try_dishes: string
    special_recognition: string
    google_maps_link: string
    swiggy_link: string
    zomato_link: string
    is_veg: boolean
    is_favorite: boolean
    distance?: string
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [filters, setFilters] = useState({})
    const [showFilters, setShowFilters] = useState(false)
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [favorites, setFavorites] = useState<Set<number>>(new Set())

    useEffect(() => {
        getUserLocation()
        loadFavorites()
    }, [])

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude])
                },
                (error) => {
                    console.error('Geolocation error:', error)
                    setUserLocation([11.0168, 76.9558])
                }
            )
        } else {
            setUserLocation([11.0168, 76.9558])
        }
    }

    const loadFavorites = async () => {
        try {
            const data = await api.getFavorites()
            const favoriteIds = new Set(data.map((fav: any) => fav.restaurant.id))
            setFavorites(favoriteIds)
        } catch (error) {
            console.error('Failed to load favorites:', error)
        }
    }

    const handleRecommendations = (newRestaurants: Restaurant[]) => {
        setRestaurants(newRestaurants)
    }

    const handleRestaurantClick = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant)
    }

    const handleToggleFavorite = async (restaurantId: number) => {
        try {
            if (favorites.has(restaurantId)) {
                await api.removeFavorite(restaurantId)
                setFavorites((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(restaurantId)
                    return newSet
                })
            } else {
                await api.addFavorite(restaurantId)
                setFavorites((prev) => new Set(prev).add(restaurantId))
            }

            setRestaurants((prev) =>
                prev.map((r) =>
                    r.id === restaurantId ? { ...r, is_favorite: !r.is_favorite } : r
                )
            )

            if (selectedRestaurant && selectedRestaurant.id === restaurantId) {
                setSelectedRestaurant({
                    ...selectedRestaurant,
                    is_favorite: !selectedRestaurant.is_favorite,
                })
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error)
        }
    }

    return (
        <div className="h-screen flex flex-col">
            <header className="bg-white shadow-sm z-10">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">SmartDine</h1>
                        <p className="text-sm text-gray-600">Discover great food in Coimbatore</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowSaveModal(true)}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Save Discovery
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Filters
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-700">{user.email}</span>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-96 flex flex-col border-r border-gray-200">
                    <ChatInterface
                        onRecommendations={handleRecommendations}
                        userLocation={userLocation}
                        filters={filters}
                    />
                </div>

                <div className="flex-1 relative">
                    <MapView
                        restaurants={restaurants}
                        userLocation={userLocation}
                        onRestaurantClick={handleRestaurantClick}
                        onRecenter={() => userLocation && setUserLocation([...userLocation])}
                    />
                </div>

                {selectedRestaurant && (
                    <RestaurantDetail
                        restaurant={selectedRestaurant}
                        onClose={() => setSelectedRestaurant(null)}
                        onToggleFavorite={handleToggleFavorite}
                        isFavorite={favorites.has(selectedRestaurant.id)}
                    />
                )}

                {showFilters && (
                    <FilterPanel
                        filters={filters}
                        onFiltersChange={setFilters}
                        onClose={() => setShowFilters(false)}
                    />
                )}

                {showSaveModal && (
                    <SaveDiscoveryModal onClose={() => setShowSaveModal(false)} />
                )}
            </div>
        </div>
    )
}
