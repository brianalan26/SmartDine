import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import { api } from './services/api'

interface User {
    id: number
    username: string
    email: string
}

function App() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            const data = await api.checkAuthStatus()
            if (data.authenticated) {
                setUser(data.user)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = (userData: User) => {
        setUser(userData)
    }

    const handleLogout = async () => {
        try {
            await api.logout()
            setUser(null)
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        )
    }

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={
                        user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
                    }
                />
                <Route
                    path="/signup"
                    element={
                        user ? <Navigate to="/dashboard" /> : <Signup onLogin={handleLogin} />
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        user ? (
                            <Dashboard user={user} onLogout={handleLogout} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    )
}

export default App
