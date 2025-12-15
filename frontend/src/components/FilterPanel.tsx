import { useState, useEffect } from 'react'

interface FilterPanelProps {
    filters: any
    onFiltersChange: (filters: any) => void
    onClose: () => void
}

export default function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
    const [maxBudget, setMaxBudget] = useState(filters.max_budget || 1000)
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>(filters.cuisines || [])
    const [isVeg, setIsVeg] = useState<boolean | null>(filters.is_veg ?? null)
    const [minRating, setMinRating] = useState(filters.min_rating || 0)
    const [maxTravelTime, setMaxTravelTime] = useState(filters.max_travel_time || 60)

    const cuisineOptions = [
        'South Indian',
        'North Indian',
        'Chinese',
        'Biryani',
        'Chettinad',
        'Continental',
        'Italian',
        'Street Food',
    ]

    const handleCuisineToggle = (cuisine: string) => {
        setSelectedCuisines((prev) =>
            prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
        )
    }

    const handleApply = () => {
        onFiltersChange({
            max_budget: maxBudget,
            cuisines: selectedCuisines,
            is_veg: isVeg,
            min_rating: minRating,
            max_travel_time: maxTravelTime,
        })
        onClose()
    }

    const handleReset = () => {
        setMaxBudget(1000)
        setSelectedCuisines([])
        setIsVeg(null)
        setMinRating(0)
        setMaxTravelTime(60)
        onFiltersChange({})
    }

    return (
        <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                    ×
                </button>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Budget: ₹{maxBudget}
                    </label>
                    <input
                        type="range"
                        min="100"
                        max="2000"
                        step="100"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cuisines
                    </label>
                    <div className="space-y-2">
                        {cuisineOptions.map((cuisine) => (
                            <label key={cuisine} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedCuisines.includes(cuisine)}
                                    onChange={() => handleCuisineToggle(cuisine)}
                                    className="mr-2"
                                />
                                <span className="text-sm">{cuisine}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dietary Preference
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={isVeg === null}
                                onChange={() => setIsVeg(null)}
                                className="mr-2"
                            />
                            <span className="text-sm">All</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={isVeg === true}
                                onChange={() => setIsVeg(true)}
                                className="mr-2"
                            />
                            <span className="text-sm">Vegetarian Only</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={isVeg === false}
                                onChange={() => setIsVeg(false)}
                                className="mr-2"
                            />
                            <span className="text-sm">Non-Vegetarian</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Rating: {minRating > 0 ? minRating.toFixed(1) : 'Any'}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={minRating}
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Travel Time: {maxTravelTime} min
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="120"
                        step="10"
                        value={maxTravelTime}
                        onChange={(e) => setMaxTravelTime(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    )
}
