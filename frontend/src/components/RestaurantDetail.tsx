interface Restaurant {
    id: number
    name: string
    address: string
    cuisines: string
    price_range: string
    average_cost: number
    rating: string
    must_try_dishes: string
    special_recognition: string
    google_maps_link: string
    swiggy_link: string
    zomato_link: string
    distance?: string
}

interface RestaurantDetailProps {
    restaurant: Restaurant
    onClose: () => void
    onToggleFavorite: (id: number) => void
    isFavorite: boolean
}

export default function RestaurantDetail({
    restaurant,
    onClose,
    onToggleFavorite,
    isFavorite,
}: RestaurantDetailProps) {
    const shareLink = () => {
        const url = restaurant.google_maps_link
        navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
    }

    return (
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold">Restaurant Details</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                    ×
                </button>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{restaurant.name}</h3>
                        <button
                            onClick={() => onToggleFavorite(restaurant.id)}
                            className="text-2xl"
                        >
                            {isFavorite ? '❤️' : '🤍'}
                        </button>
                    </div>
                    {restaurant.special_recognition && (
                        <p className="text-sm text-primary font-medium mb-2">
                            {restaurant.special_recognition}
                        </p>
                    )}
                    <p className="text-sm text-gray-600">{restaurant.address}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{restaurant.rating}</span>
                    </div>
                    <div className="text-sm text-gray-600">{restaurant.price_range}</div>
                    <div className="text-sm text-gray-600">Avg ₹{restaurant.average_cost}</div>
                    {restaurant.distance && (
                        <div className="text-sm text-gray-600">{restaurant.distance} km</div>
                    )}
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Cuisines</h4>
                    <p className="text-sm text-gray-700">{restaurant.cuisines}</p>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Must-Try Dishes</h4>
                    <p className="text-sm text-gray-700">{restaurant.must_try_dishes}</p>
                </div>

                <div className="space-y-2">
                    <a
                        href={restaurant.google_maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2 px-4 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                        📍 Navigate
                    </a>

                    {restaurant.swiggy_link && (
                        <a
                            href={restaurant.swiggy_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-2 px-4 bg-orange-500 text-white text-center rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                        >
                            Order on Swiggy
                        </a>
                    )}

                    {restaurant.zomato_link && (
                        <a
                            href={restaurant.zomato_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-2 px-4 bg-red-500 text-white text-center rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                            View on Zomato
                        </a>
                    )}

                    <button
                        onClick={shareLink}
                        className="block w-full py-2 px-4 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        🔗 Share Link
                    </button>
                </div>
            </div>
        </div>
    )
}
