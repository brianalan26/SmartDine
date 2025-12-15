import { useState, useEffect } from 'react'
import MapView from '../components/MapView'
import ChatInterface from '../components/ChatInterface'
import FilterPanel from '../components/FilterPanel'
import RestaurantDetail from '../components/RestaurantDetail'
import SaveDiscoveryModal from '../components/SaveDiscoveryModal'
import FavoritesPanel from '../components/FavoritesPanel'
import SavedDiscoveriesPanel from '../components/SavedDiscoveriesPanel'
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
    const [activeTab, setActiveTab] = useState<'map' | 'favorites' | 'saved'>('map')

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
            const favoriteIds = new Set<number>(data.map((fav: any) => fav.restaurant.id))
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

    // Food Quotes Component - Moved here for cleaner render logic
    const FoodQuotes = () => (
        <div className="absolute inset-0 z-[5] pointer-events-none opacity-[0.03] select-none overflow-hidden">
            <div className="flex flex-wrap items-center justify-center h-full gap-16 p-10">
                <span className="text-8xl font-serif italic text-primary rotate-12">"Food is love"</span>
                <span className="text-7xl font-serif italic text-orange-600 -rotate-6">"Biryani is life"</span>
                <span className="text-8xl font-serif italic text-red-500 rotate-3">"Good food fixes bad days"</span>
                <span className="text-7xl font-serif italic text-yellow-600 -rotate-12">"Taste the joy"</span>
            </div>
        </div>
    )

    return (
        <div className="h-screen flex flex-col bg-slate-50 relative overflow-hidden">
            <FoodQuotes />

            <header className="bg-white/90 backdrop-blur-md shadow-sm z-30 border-b border-orange-100 relative">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">🍲</span>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">SmartDine</h1>
                            <p className="text-xs text-gray-500 font-medium tracking-wide">YOUR FOOD COMPANION</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowSaveModal(true)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-orange-50 hover:border-orange-200 transition-all shadow-sm flex items-center gap-1"
                        >
                            <span>+</span> Save Discovery
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-orange-50 hover:border-orange-200 transition-all shadow-sm"
                        >
                            Filters
                        </button>
                        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800">{user.username}</p>
                            </div>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-black transition-colors shadow-md"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden z-10 relative">
                {/* Main Chat Area - Center/Left - Primary Focus */}
                <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full p-6 h-full relative z-20">
                    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden border border-white/50 h-full flex flex-col">
                        <ChatInterface
                            onRecommendations={handleRecommendations}
                            userLocation={userLocation}
                            filters={filters}
                        />
                    </div>
                </div>

                {/* Side Panel - Right - Tabs for Map/Favorites/Saved */}
                <div className="w-[420px] border-l border-gray-200 bg-white shadow-xl flex flex-col relative z-20 shrink-0">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'map' ? 'text-primary border-b-2 border-primary bg-orange-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Explore
                        </button>
                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'favorites' ? 'text-primary border-b-2 border-primary bg-orange-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Favorites
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'saved' ? 'text-primary border-b-2 border-primary bg-orange-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Saved
                        </button>
                    </div>

                    <div className="flex-1 relative overflow-hidden">
                        {activeTab === 'map' && (
                            <div className="h-full flex flex-col">
                                <div className="p-3 border-b border-gray-100 font-medium text-gray-600 flex justify-between items-center bg-gray-50/50 text-xs uppercase tracking-wide">
                                    <span>Nearby Restaurants</span>
                                    <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">{restaurants.length}</span>
                                </div>
                                <div className="flex-1 relative">
                                    <MapView
                                        restaurants={restaurants}
                                        userLocation={userLocation}
                                        onRestaurantClick={(r) => {
                                            handleRestaurantClick(r)
                                        }}
                                        onRecenter={() => userLocation && setUserLocation([...userLocation])}
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === 'favorites' && (
                            <FavoritesPanel
                                onClose={() => setActiveTab('map')}
                                onRestaurantClick={(restaurant: any) => {
                                    const r = restaurants.find(r => r.id === restaurant.id || r.id === restaurant) || restaurant;

                                    if (r && r.id) {
                                        setSelectedRestaurant(r);
                                        setActiveTab('map');
                                    }
                                }}
                            />
                        )}
                        {activeTab === 'saved' && (
                            <SavedDiscoveriesPanel />
                        )}
                    </div>
                </div>

                {/* Modals & Panels */}
                {selectedRestaurant && (
                    <div className="absolute top-6 right-[440px] bottom-6 w-[380px] z-[40] drop-shadow-2xl">
                        <RestaurantDetail
                            restaurant={selectedRestaurant}
                            onClose={() => setSelectedRestaurant(null)}
                            onToggleFavorite={handleToggleFavorite}
                            isFavorite={favorites.has(selectedRestaurant.id)}
                        />
                    </div>
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
