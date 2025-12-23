import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChatRoomClient from './chat-room-client'

export default async function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: roomId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    console.log('[ChatRoom] Fetching room:', roomId)

    // Fetch chat room with participants - simplified query
    const { data: chatRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .select(`
            *,
            donor:profiles!chat_rooms_donor_id_fkey(id, display_name, avatar_url),
            volunteer:profiles!chat_rooms_volunteer_id_fkey(id, display_name, avatar_url)
        `)
        .eq('id', roomId)
        .single()

    console.log('[ChatRoom] Query result:', { chatRoom, roomError })

    if (roomError) {
        console.error('[ChatRoom] Error:', roomError)
        redirect('/chats?error=Chat not found')
    }

    if (!chatRoom) {
        redirect('/chats?error=Chat not found')
    }

    // Verify user is participant
    if (chatRoom.donor_id !== user.id && chatRoom.volunteer_id !== user.id) {
        redirect('/chats?error=Unauthorized')
    }

    // Fetch messages
    const { data: messages, error: msgError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

    console.log('[ChatRoom] Messages:', messages?.length, 'Error:', msgError)

    // Determine other participant
    const otherUser = user.id === chatRoom.donor_id ? chatRoom.volunteer : chatRoom.donor

    // Get listing info if available
    let listingTitle = null
    if (chatRoom.listing_id) {
        const { data: listing } = await supabase
            .from('listings')
            .select('title')
            .eq('id', chatRoom.listing_id)
            .single()
        listingTitle = listing?.title
    }

    return (
        <ChatRoomClient
            chatRoom={{ ...chatRoom, listing: { title: listingTitle } }}
            messages={messages || []}
            currentUserId={user.id}
            otherUser={otherUser}
        />
    )
}
