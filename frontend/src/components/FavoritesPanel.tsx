import { useState, useEffect } from 'react'
import { api } from '../services/api'

interface FavoritesPanelProps {
    onClose: () => void
    onRestaurantClick: (restaurant: any) => void
}

export default function FavoritesPanel({ onClose, onRestaurantClick }: FavoritesPanelProps) {
    const [favorites, setFavorites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadFavorites()
    }, [])

    const loadFavorites = async () => {
        try {
            const data = await api.getFavorites()
            setFavorites(data)
        } catch (error) {
            console.error('Failed to load favorites', error)
        } finally {
            setLoading(false)
        }
    }

    const removeFavorite = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation()
        try {
            await api.removeFavorite(id)
            setFavorites(prev => prev.filter(f => f.restaurant.id !== id))
        } catch (error) {
            console.error('Failed to remove favorite', error)
        }
    }

    return (
        <div className="absolute top-0 right-0 w-96 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Your Favorites ❤️</h2>
                <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="text-center text-gray-500 mt-10">Loading tasty spots...</div>
                ) : favorites.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p className="text-4xl mb-2">💔</p>
                        <p>No favorites yet.</p>
                        <p className="text-sm mt-2">Tap the heart on restaurants you love!</p>
                    </div>
                ) : (
                    favorites.map((fav) => (
                        <div
                            key={fav.id}
                            onClick={() => onRestaurantClick(fav.restaurant)}
                            className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-800">{fav.restaurant.name}</h3>
                                    <p className="text-xs text-gray-500">{fav.restaurant.cuisines}</p>
                                </div>
                                <button
                                    onClick={(e) => removeFavorite(e, fav.restaurant.id)}
                                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                                    title="Remove"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                                <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">★ {fav.restaurant.rating}</span>
                                <span>₹{fav.restaurant.average_cost}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
