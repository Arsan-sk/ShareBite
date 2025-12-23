import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ActivityDashboard from './dashboard'

export default async function ActivityPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch My Listings
    const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false })

    // 2. Fetch My Pickups (As Volunteer)
    const { data: pickups } = await supabase
        .from('pickups')
        .select(`
            *,
            listing:listings(*)
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">My Food Journey</h1>
            <ActivityDashboard
                listings={listings || []}
                pickups={pickups || []}
                incomingRequests={incomingRequests || []}
            />
        </div>
    )
}
