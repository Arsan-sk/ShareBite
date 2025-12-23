'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Send, User, Check, CheckCheck } from 'lucide-react'

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

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    // Mark messages as read when entering chat
    useEffect(() => {
        const markAsRead = async () => {
            try {
                await supabase.rpc('mark_chat_as_read', {
                    p_room_id: chatRoom.id,
                    p_user_id: currentUserId
                })
            } catch (err) {
                console.log('Mark as read failed (function might not exist yet)')
            }
        }
        markAsRead()
    }, [chatRoom.id, currentUserId, supabase])

    // Subscribe to realtime messages - fixed subscription
    useEffect(() => {
        console.log('[Chat] Setting up realtime subscription for room:', chatRoom.id)

        const channel = supabase
            .channel(`room-${chatRoom.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `room_id=eq.${chatRoom.id}`
                },
                (payload) => {
                    console.log('[Chat] New message received:', payload.new)
                    // Check if message already exists (from optimistic update)
                    setMessages((prev: any[]) => {
                        const exists = prev.some(m => m.id === payload.new.id)
                        if (exists) return prev
                        return [...prev, payload.new]
                    })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `room_id=eq.${chatRoom.id}`
                },
                (payload) => {
                    // Update read status
                    setMessages((prev: any[]) =>
                        prev.map(m => m.id === payload.new.id ? payload.new : m)
                    )
                }
            )
            .subscribe((status) => {
                console.log('[Chat] Subscription status:', status)
            })

        return () => {
            console.log('[Chat] Cleaning up subscription')
            supabase.removeChannel(channel)
        }
    }, [chatRoom.id, supabase])

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        const messageContent = newMessage.trim()
        const tempId = `temp-${Date.now()}`

        // Optimistic update - add message immediately
        const optimisticMessage = {
            id: tempId,
            room_id: chatRoom.id,
            sender_id: currentUserId,
            content: messageContent,
            created_at: new Date().toISOString(),
            read_at: null,
            message_type: 'text',
            _sending: true
        }

        setMessages(prev => [...prev, optimisticMessage])
        setNewMessage('')
        setSending(true)

        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .insert({
                    room_id: chatRoom.id,
                    sender_id: currentUserId,
                    content: messageContent
                })
                .select()
                .single()

            if (error) throw error

            // Replace optimistic message with real one
            setMessages(prev => prev.map(m =>
                m.id === tempId ? { ...data, _sending: false } : m
            ))
        } catch (err) {
            console.error('Error sending message:', err)
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempId))
            setNewMessage(messageContent)
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

    // Get read status icon
    const getStatusIcon = (message: any) => {
        if (message._sending) {
            // Still sending
            return <Check className="h-3 w-3 text-green-200 opacity-50" />
        }
        if (message.read_at) {
            // Read - blue double tick
            return <CheckCheck className="h-3 w-3 text-blue-400" />
        }
        // Sent - grey double tick
        return <CheckCheck className="h-3 w-3 text-green-200" />
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
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
                <Link href="/chats" className="text-gray-500 hover:text-gray-700 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden shadow-sm">
                    {otherUser?.avatar_url ? (
                        <img src={otherUser.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <User className="h-5 w-5 text-white" />
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="font-semibold text-gray-900">{otherUser?.display_name || 'User'}</h1>
                    {chatRoom.listing?.title && (
                        <p className="text-xs text-gray-500">Re: {chatRoom.listing.title}</p>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ scrollbarWidth: 'thin' }}>
                {Object.entries(groupedMessages).map(([date, dateMessages]: [string, any]) => (
                    <div key={date}>
                        {/* Date divider */}
                        <div className="flex items-center justify-center my-4">
                            <span className="bg-white/80 backdrop-blur-sm text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm">
                                {formatDate(dateMessages[0].created_at)}
                            </span>
                        </div>

                        {/* Messages for this date */}
                        {dateMessages.map((message: any, index: number) => {
                            const isOwn = message.sender_id === currentUserId
                            const isSystem = message.message_type === 'system'

                            if (isSystem) {
                                return (
                                    <div key={message.id} className="flex justify-center my-3 animate-fade-in">
                                        <span className="bg-amber-50 text-amber-700 text-xs px-4 py-2 rounded-lg border border-amber-200 shadow-sm">
                                            {message.content}
                                        </span>
                                    </div>
                                )
                            }

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 animate-slide-up`}
                                    style={{ animationDelay: `${index * 20}ms` }}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm transition-all ${isOwn
                                                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-md'
                                                : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
                                            } ${message._sending ? 'opacity-70' : ''}`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-green-100' : 'text-gray-400'}`}>
                                            <span className="text-xs">{formatTime(message.created_at)}</span>
                                            {isOwn && getStatusIcon(message)}
                                        </div>
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
                        <div className="bg-green-100 rounded-full p-4 mb-3">
                            <Send className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="font-medium">No messages yet</p>
                        <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4 shadow-lg">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-gray-50 transition-all"
                        disabled={sending}
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-11 w-11 p-0 shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>

            {/* CSS for animations */}
            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                .animate-slide-up {
                    animation: slide-up 0.2s ease-out;
                }
            `}</style>
        </div>
    )
}
