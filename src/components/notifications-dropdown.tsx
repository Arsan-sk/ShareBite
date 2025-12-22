'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from './ui/button'

type Notification = {
    id: string
    title: string
    message: string
    link: string
    is_read: boolean
    created_at: string
}

export default function NotificationDropdown({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        // Initial fetch
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data) {
                setNotifications(data)
                const unread = data.filter(n => !n.is_read).length
                setUnreadCount(unread)
                console.log('Fetched notifications:', data.length, 'Unread:', unread)
            }
        }

        fetchNotifications()

        // Real-time subscription for NEW notifications
        const channel = supabase
            .channel('realtime_notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                const newNotif = payload.new as Notification
                setNotifications(prev => [newNotif, ...prev])
                // Only increment if it's truly unread
                if (!newNotif.is_read) {
                    setUnreadCount(prev => prev + 1)
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const markAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.is_read)

        if (unreadNotifications.length > 0) {
            const unreadIds = unreadNotifications.map(n => n.id)

            console.log('Marking as read:', unreadIds)

            // Update database
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .in('id', unreadIds)

            if (error) {
                console.error('Error marking notifications as read:', error)
            } else {
                console.log('Successfully marked notifications as read')
                // Update local state
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                setUnreadCount(0)
            }
        }
    }

    return (
        <div className="relative ml-3">
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => {
                    const wasOpen = isOpen
                    setIsOpen(!isOpen)
                    // Only mark as read when OPENING the dropdown
                    if (!wasOpen && unreadCount > 0) {
                        markAsRead()
                    }
                }}
            >
                <Bell className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
            </Button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 border-b border-gray-100 font-medium text-gray-700">Notifications</div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
                        ) : (
                            notifications.map(notification => (
                                <div key={notification.id} className={`px-4 py-3 border-b hover:bg-gray-50 transition-colors ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}>
                                    <Link href={notification.link || '#'} onClick={() => setIsOpen(false)}>
                                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                        <p className="text-sm text-gray-500">{notification.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(notification.created_at).toLocaleString()}</p>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
