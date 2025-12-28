import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ActivityDashboard from './dashboard'

export default async function ActivityPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch My Listings (with volunteer names for display)
    const { data: listings } = await supabase
        .from('listings')
        .select(`
            *,
            pickups(
                status,
                volunteer_id,
                volunteer:profiles!volunteer_id(display_name, email, avatar_url)
            )
        `)
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false })

    // 2. Fetch My Pickups (with donor names for display)
    const { data: pickups } = await supabase
        .from('pickups')
        .select(`
            *,
            listing:listings(
                *,
                donor:profiles!donor_id(display_name, email, avatar_url)
            )
        `)
        .eq('volunteer_id', user.id)
        .order('created_at', { ascending: false })

    // 3. Fetch Incoming Requests (Pending Pickups for my listings)
    const { data: incomingRequests } = await supabase
        .from('pickups')
        .select(`
            *,
            listing:listings!inner(*),
            volunteer:profiles!volunteer_id(*)
        `)
        .eq('status', 'pending')
        .filter('listing.donor_id', 'eq', user.id)

    console.log('--- Activity Page Debug ---')
    console.log('User:', user.id)
    console.log('Listings Count:', listings?.length, listings)
    console.log('Pickups Count:', pickups?.length, pickups)
    console.log('Incoming Requests:', incomingRequests?.length)
    console.log('--- End Debug ---')

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">My Activity</h1>
            <ActivityDashboard
                listings={listings || []}
                pickups={pickups || []}
                incomingRequests={incomingRequests || []}
            />
        </div>
    )
}
