import { useState, useEffect } from 'react'
import { api } from '../services/api'

interface SavedDiscovery {
    id: number
    restaurant_name: string
    area: string
    source: string
    google_maps_link: string
    image_url: string
    notes: string
    created_at: string
}

export default function SavedDiscoveriesPanel() {
    const [discoveries, setDiscoveries] = useState<SavedDiscovery[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDiscoveries()
    }, [])

    const loadDiscoveries = async () => {
        try {
            const data = await api.getSavedDiscoveries()
            setDiscoveries(data)
        } catch (error) {
            console.error('Failed to load discoveries', error)
        } finally {
            setLoading(false)
        }
    }

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'instagram': return '📸'
            case 'youtube': return '▶️'
            case 'friend': return '👥'
            case 'blog': return '📝'
            default: return '📌'
        }
    }

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-800">My Saved Places</h3>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    {discoveries.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-8">Loading...</div>
                ) : discoveries.length === 0 ? (
                    <div className="text-center text-gray-400 py-8 text-sm">
                        No saved discoveries yet.
                    </div>
                ) : (
                    discoveries.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-800">{item.restaurant_name}</h4>
                                <span className="text-sm" title={item.source}>
                                    {getSourceIcon(item.source)}
                                </span>
                            </div>

                            {item.notes && (
                                <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg italic">
                                    "{item.notes}"
                                </p>
                            )}

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                {item.google_maps_link && (
                                    <a
                                        href={item.google_maps_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-primary hover:text-orange-700 flex items-center gap-1"
                                    >
                                        📍 View on Maps
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
