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

    // Fetch all chat rooms for this user
    const { data: chatRooms, error } = await supabase
        .from('chat_rooms')
        .select(`
            *,
            donor:profiles!chat_rooms_donor_id_fkey(id, display_name, avatar_url),
            volunteer:profiles!chat_rooms_volunteer_id_fkey(id, display_name, avatar_url)
        `)
        .or(`donor_id.eq.${user.id},volunteer_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

    console.log('[Chats] Fetched rooms:', chatRooms?.length, 'Error:', error)

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="h-7 w-7 text-green-600" />
                Messages
            </h1>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {(!chatRooms || chatRooms.length === 0) ? (
                    <div className="p-8 text-center">
                        <div className="bg-gray-100 rounded-full p-4 w-fit mx-auto mb-4">
                            <MessageCircle className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            When you accept or have a pickup request accepted, a chat will be created automatically.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                        >
                            Browse Food Listings
                        </Link>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {chatRooms.map((room: any) => {
                            // If current user is the donor, show volunteer. Otherwise show donor.
                            const otherUser = user.id === room.donor_id ? room.volunteer : room.donor

                            return (
                                <li key={room.id}>
                                    <Link
                                        href={`/chats/${room.id}`}
                                        className="block p-4 hover:bg-green-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {otherUser?.avatar_url ? (
                                                    <img src={otherUser.avatar_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-lg font-medium text-green-700">
                                                        {otherUser?.display_name?.[0] || 'U'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {otherUser?.display_name || 'User'}
                                                </p>
                                                <p className="text-sm text-gray-500" suppressHydrationWarning>
                                                    {new Date(room.last_message_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
