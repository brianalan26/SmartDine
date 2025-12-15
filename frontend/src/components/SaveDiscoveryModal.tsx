import { useState } from 'react'
import { api } from '../services/api'

interface SaveDiscoveryModalProps {
    onClose: () => void
}

export default function SaveDiscoveryModal({ onClose }: SaveDiscoveryModalProps) {
    const [restaurantName, setRestaurantName] = useState('')
    const [source, setSource] = useState('instagram')
    const [googleMapsLink, setGoogleMapsLink] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!notes.trim()) {
            setError('Please tell us why you saved this place.')
            setLoading(false)
            return
        }

        try {
            await api.saveDiscovery({
                restaurant_name: restaurantName,
                area: "Coimbatore", // Default value as field is required but removed from UI
                source,
                google_maps_link: googleMapsLink,
                image_url: imageUrl,
                notes,
            })
            alert('Discovery saved successfully!')
            onClose()
        } catch (err: any) {
            setError(err.message || 'Failed to save discovery')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl transform transition-all">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Save a Discovery</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Restaurant Name *
                        </label>
                        <input
                            type="text"
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="e.g. Annapoorna"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Source *
                        </label>
                        <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                            <option value="instagram">Instagram</option>
                            <option value="friend">Friend Recommendation</option>
                            <option value="youtube">YouTube</option>
                            <option value="blog">Blog/Article</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Why did you save this place? *
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                            placeholder="Must try the ghee roast..."
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                const details = document.getElementById('optional-details');
                                if (details) details.classList.toggle('hidden');
                            }}
                            className="text-sm text-primary font-medium hover:underline mb-4 inline-block"
                        >
                            + Add Link or Image (Optional)
                        </button>

                        <div id="optional-details" className="hidden space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Google Maps Link
                                </label>
                                <input
                                    type="url"
                                    value={googleMapsLink}
                                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="https://maps.google.com/..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-primary text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Discovery'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
