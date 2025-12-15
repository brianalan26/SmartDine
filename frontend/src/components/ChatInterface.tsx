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
        setMessages((prev) => [...prev, { type: 'user', text: '✨ Surprise me!' }])

        try {
            const data = await api.getSurprise(userLocation?.[0], userLocation?.[1])

            if (data.restaurants && data.restaurants.length > 0) {
                onRecommendations(data.restaurants)
                setMessages((prev) => [
                    ...prev,
                    { type: 'assistant', text: data.explanation },
                ])
            } else if (data.restaurant) {
                // Fallback for backward compatibility
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
                    text: 'My chef brain is taking a nap. Try again in a second!',
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    const suggestionChips = [
        "Cheap spicy snacks",
        "Family dinner tonight",
        "Best Biryani near me",
        "Romantic date spots",
        "Late night cravings"
    ]

    return (
        <div className="h-full flex flex-col bg-slate-50/50">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {message.type === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-xs mr-2 shadow-sm shrink-0">
                                AI
                            </div>
                        )}
                        <div
                            className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${message.type === 'user'
                                ? 'bg-gradient-to-r from-primary to-orange-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                }`}
                        >
                            <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br/>') }} />
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 shrink-0 animate-pulse" />
                        <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                {/* Suggestions */}
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
                    {suggestionChips.map((chip) => (
                        <button
                            key={chip}
                            onClick={() => {
                                setInput(chip)
                                // Optional: auto-submit
                            }}
                            className="whitespace-nowrap px-4 py-1.5 bg-orange-50 text-orange-700 text-xs rounded-full hover:bg-orange-100 transition-colors border border-orange-100"
                        >
                            {chip}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSurprise}
                        disabled={loading}
                        className="p-3 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition-colors border border-yellow-200"
                        title="Surprise Me!"
                    >
                        ✨
                    </button>

                    <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about food, cravings, or mood..."
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-orange-600 transition-all font-medium shadow-md shadow-orange-100 disabled:opacity-50 disabled:shadow-none"
                        >
                            Send
                        </button>
                    </form>
                </div>

                <p className="mt-3 text-[10px] text-center text-gray-400 uppercase tracking-widest font-medium">
                    SmartDine Assistant
                </p>
            </div>
        </div>
    )
}
