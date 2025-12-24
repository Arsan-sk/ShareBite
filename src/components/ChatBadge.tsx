'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface ChatBadgeProps {
    userId: string
    isActive: boolean
}

export function ChatBadge({ userId, isActive }: ChatBadgeProps) {
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    // Fetch initial unread count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const { data, error } = await supabase.rpc('get_total_unread_count', {
                    p_user_id: userId
                })
                if (!error && data !== null) {
                    setUnreadCount(data)
                }
            } catch (err) {
                console.log('Unread count fetch failed (function might not exist yet)')
            }
        }

        fetchUnreadCount()

        // Subscribe to chat room changes for realtime badge updates
        const channel = supabase
            .channel('chat-badge')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_rooms'
                },
                () => {
                    // Refetch count on any chat room change
                    fetchUnreadCount()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages'
                },
                () => {
                    // Refetch on new message
                    fetchUnreadCount()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase])

    const linkClass = `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium relative ${isActive
        ? 'border-green-500 text-gray-900'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        }`

    return (
        <Link href="/chats" className={linkClass}>
            <MessageCircle className="h-4 w-4 mr-1" />
            Chats
            {unreadCount > 0 && (
                <span className="absolute top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    )
}
