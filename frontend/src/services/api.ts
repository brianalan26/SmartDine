const API_BASE_URL = 'http://localhost:8000/api'

async function fetchWithCredentials(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
}

export const api = {
    signup: async (email: string, password: string) => {
        return fetchWithCredentials(`${API_BASE_URL}/auth/signup/`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        })
    },

    login: async (email: string, password: string) => {
        return fetchWithCredentials(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        })
    },

    logout: async () => {
        return fetchWithCredentials(`${API_BASE_URL}/auth/logout/`, {
            method: 'POST',
        })
    },

    checkAuthStatus: async () => {
        return fetchWithCredentials(`${API_BASE_URL}/auth/status/`)
    },

    getRestaurants: async (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : ''
        return fetchWithCredentials(`${API_BASE_URL}/restaurants/${query}`)
    },

    getRecommendations: async (
        query: string,
        latitude?: number,
        longitude?: number,
        filters?: any
    ) => {
        return fetchWithCredentials(`${API_BASE_URL}/recommend/`, {
            method: 'POST',
            body: JSON.stringify({ query, latitude, longitude, filters }),
        })
    },

    getSurprise: async (latitude?: number, longitude?: number) => {
        const params = new URLSearchParams()
        if (latitude) params.append('latitude', latitude.toString())
        if (longitude) params.append('longitude', longitude.toString())
        const query = params.toString() ? '?' + params.toString() : ''
        return fetchWithCredentials(`${API_BASE_URL}/surprise/${query}`)
    },

    getFavorites: async () => {
        return fetchWithCredentials(`${API_BASE_URL}/favorites/`)
    },

    addFavorite: async (restaurantId: number) => {
        return fetchWithCredentials(`${API_BASE_URL}/favorites/`, {
            method: 'POST',
            body: JSON.stringify({ restaurant_id: restaurantId }),
        })
    },

    removeFavorite: async (restaurantId: number) => {
        return fetchWithCredentials(`${API_BASE_URL}/favorites/`, {
            method: 'DELETE',
            body: JSON.stringify({ restaurant_id: restaurantId }),
        })
    },

    getHistory: async () => {
        return fetchWithCredentials(`${API_BASE_URL}/history/`)
    },

    getSavedDiscoveries: async () => {
        return fetchWithCredentials(`${API_BASE_URL}/saved-discoveries/`)
    },

    saveDiscovery: async (data: any) => {
        return fetchWithCredentials(`${API_BASE_URL}/saved-discoveries/`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    recordSelection: async (historyId: number, restaurantId: number) => {
        return fetchWithCredentials(`${API_BASE_URL}/record-selection/`, {
            method: 'POST',
            body: JSON.stringify({ history_id: historyId, restaurant_id: restaurantId }),
        })
    },
}
