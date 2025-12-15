import { useState, useRef, useEffect } from 'react'
import { api } from '../services/api'

interface Message {
    type: 'user' | 'assistant'
    text: string
}

interface ChatInterfaceProps {
    onRecommendations: (restaurants: any[]) => void
    userLocation: [number, number] | null
    filters: any
}

export default function ChatInterface({
    onRecommendations,
    userLocation,
    filters,
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            type: 'assistant',
            text: "Hey there! I'm here to help you discover amazing food in Coimbatore. What are you craving today?",
        },
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setInput('')
        setMessages((prev) => [...prev, { type: 'user', text: userMessage }])
        setLoading(true)

        try {
            const data = await api.getRecommendations(
                userMessage,
                userLocation?.[0],
                userLocation?.[1],
                filters
            )

            if (data.restaurants && data.restaurants.length > 0) {
                onRecommendations(data.restaurants)
                setMessages((prev) => [
                    ...prev,
                    { type: 'assistant', text: data.explanation || 'Here are some great options for you!' },
                ])
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        type: 'assistant',
                        text: data.explanation || 'No restaurants found matching your request. Try adjusting your search!',
                    },
                ])
            }
        } catch (error: any) {
            setMessages((prev) => [
                ...prev,
                {
                    type: 'assistant',
                    text: 'Sorry, something went wrong. Please try again.',
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleSurprise = async () => {
        setLoading(true)
        setMessages((prev) => [...prev, { type: 'user', text: 'Surprise me!' }])

        try {
            const data = await api.getSurprise(userLocation?.[0], userLocation?.[1])

            if (data.restaurant) {
                onRecommendations([data.restaurant])
                setMessages((prev) => [
                    ...prev,
                    { type: 'assistant', text: data.explanation },
                ])
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    type: 'assistant',
                    text: 'Could not find a surprise for you right now. Try again!',
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full flex flex-col bg-gray-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-800 shadow-sm'
                                }`}
                        >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <div className="mb-3">
                    <button
                        onClick={handleSurprise}
                        disabled={loading}
                        className="w-full py-2 px-4 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        ✨ Surprise Me!
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="What are you craving?"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        Send
                    </button>
                </form>

                <p className="mt-3 text-xs text-center text-gray-500 italic">
                    "Biryani is life"
                </p>
            </div>
        </div>
    )
}
