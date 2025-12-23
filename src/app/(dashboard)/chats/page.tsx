import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, User } from 'lucide-react'

export default async function ChatsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch all chat rooms for this user with unread counts
    const { data: chatRooms, error } = await supabase
        .from('chat_rooms')
        .select(`
            *,
            donor:profiles!chat_rooms_donor_id_fkey(id, display_name, avatar_url),
            volunteer:profiles!chat_rooms_volunteer_id_fkey(id, display_name, avatar_url)
        `)
        .or(`donor_id.eq.${user.id},volunteer_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="h-7 w-7 text-green-600" />
                Messages
            </h1>

            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
                {(!chatRooms || chatRooms.length === 0) ? (
                    <div className="p-12 text-center">
                        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full p-5 w-fit mx-auto mb-4">
                            <MessageCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                            When you accept or have a pickup request accepted, a chat will be created automatically so you can coordinate the pickup.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-md hover:shadow-lg"
                        >
                            Browse Food Listings
                        </Link>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {chatRooms.map((room: any) => {
                            // If current user is the donor, show volunteer. Otherwise show donor.
                            const otherUser = user.id === room.donor_id ? room.volunteer : room.donor

                            // Get unread count for current user
                            const unreadCount = user.id === room.donor_id
                                ? (room.donor_unread_count || 0)
                                : (room.volunteer_unread_count || 0)

                            return (
                                <li key={room.id} className="group">
                                    <Link
                                        href={`/chats/${room.id}`}
                                        className="block p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                                    {otherUser?.avatar_url ? (
                                                        <img src={otherUser.avatar_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-xl font-semibold text-white">
                                                            {otherUser?.display_name?.[0]?.toUpperCase() || 'U'}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Unread badge on avatar */}
                                                {unreadCount > 0 && (
                                                    <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full h-6 min-w-6 flex items-center justify-center px-1 border-2 border-white shadow-sm">
                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Chat info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {otherUser?.display_name || 'User'}
                                                    </p>
                                                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0" suppressHydrationWarning>
                                                        {formatRelativeTime(room.last_message_at)}
                                                    </span>
                                                </div>
                                                <p className={`text-sm mt-0.5 truncate ${unreadCount > 0 ? 'text-gray-600 font-medium' : 'text-gray-500'}`}>
                                                    {unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : 'Tap to view conversation'}
                                                </p>
                                            </div>

                                            {/* Arrow */}
                                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}

// Helper function to format relative time
function formatRelativeTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
