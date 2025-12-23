'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Send, User } from 'lucide-react'

interface ChatRoomClientProps {
    chatRoom: any
    messages: any[]
    currentUserId: string
    otherUser: {
        id: string
        display_name: string
        avatar_url?: string
    }
}

export default function ChatRoomClient({ chatRoom, messages: initialMessages, currentUserId, otherUser }: ChatRoomClientProps) {
    const [messages, setMessages] = useState(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Scroll to bottom on new messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Subscribe to realtime messages
    useEffect(() => {
        const channel = supabase
            .channel(`chat:${chatRoom.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `room_id=eq.${chatRoom.id}`
                },
                (payload) => {
                    setMessages((prev: any[]) => [...prev, payload.new])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [chatRoom.id, supabase])

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        setSending(true)
        try {
            const { error } = await supabase
                .from('chat_messages')
                .insert({
                    room_id: chatRoom.id,
                    sender_id: currentUserId,
                    content: newMessage.trim()
                })

            if (error) throw error
            setNewMessage('')
        } catch (err) {
            console.error('Error sending message:', err)
            alert('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return 'Today'
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday'
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
    }

    // Group messages by date
    const groupedMessages = messages.reduce((groups: any, message: any) => {
        const date = new Date(message.created_at).toDateString()
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(message)
        return groups
    }, {})

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
                <Link href="/activity?tab=chats" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                    {otherUser.avatar_url ? (
                        <img src={otherUser.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <User className="h-5 w-5 text-green-600" />
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="font-semibold text-gray-900">{otherUser.display_name || 'User'}</h1>
                    {chatRoom.listing && (
                        <p className="text-xs text-gray-500">Re: {chatRoom.listing.title}</p>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
                {Object.entries(groupedMessages).map(([date, dateMessages]: [string, any]) => (
                    <div key={date}>
                        {/* Date divider */}
                        <div className="flex items-center justify-center my-4">
                            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {formatDate(dateMessages[0].created_at)}
                            </span>
                        </div>

                        {/* Messages for this date */}
                        {dateMessages.map((message: any) => {
                            const isOwn = message.sender_id === currentUserId
                            const isSystem = message.message_type === 'system'

                            if (isSystem) {
                                return (
                                    <div key={message.id} className="flex justify-center my-2">
                                        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-lg italic">
                                            {message.content}
                                        </span>
                                    </div>
                                )
                            }

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${isOwn
                                                ? 'bg-green-600 text-white rounded-br-md'
                                                : 'bg-white text-gray-900 shadow-sm border rounded-bl-md'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                        <p className={`text-xs mt-1 ${isOwn ? 'text-green-100' : 'text-gray-400'}`}>
                                            {formatTime(message.created_at)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ))}
                <div ref={messagesEndRef} />

                {/* Empty state */}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="bg-gray-100 rounded-full p-4 mb-3">
                            <Send className="h-8 w-8" />
                        </div>
                        <p className="font-medium">No messages yet</p>
                        <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        disabled={sending}
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="rounded-full bg-green-600 hover:bg-green-700 h-10 w-10 p-0"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
