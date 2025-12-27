import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { getPersonalizedFeed, ListingWithPriority } from '@/utils/feed'
import { ListingCard } from '@/components/ListingCard'

export default async function FeedPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch user's location for personalized distance scoring
    let userLocation = { lat: null as number | null, lng: null as number | null }
    let byteMateIds: string[] = []

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('location_lat, location_lng')
            .eq('id', user.id)
            .single()

        if (profile?.location_lat && profile?.location_lng) {
            userLocation = {
                lat: profile.location_lat,
                lng: profile.location_lng
            }
        }

        // Fetch ByteMates for feed personalization
        const { data: bytemates } = await supabase
            .from('bytemates')
            .select('following_id')
            .eq('follower_id', user.id)

        byteMateIds = bytemates?.map(b => b.following_id) || []
    }

    // Fetch all available listings
    const { data: rawListings } = await supabase
        .from('listings')
        .select(`
            *,
            donor:profiles(id, display_name, organization_name, avatar_url, is_verified, role)
        `)
        .eq('status', 'available')
        .neq('donor_id', user?.id || '') // Hide own listings
        .gt('expiry_date', new Date().toISOString()) // Only show non-expired

    // Apply priority scoring and sort
    const listings: ListingWithPriority[] = rawListings
        ? getPersonalizedFeed(rawListings, userLocation, byteMateIds)
        : []

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Live Food Feed</h1>
                    <p className="text-gray-500 mt-2 text-sm max-w-lg">
                        Real-time listings personalized for you based on urgency and location.
                        Help us rescue food before it expires!
                    </p>
                </div>
                <Link
                    href="/listings/create"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                    + Share Food
                </Link>
            </div>

            {/* Grid Layout - Wider Cards */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                {listings?.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                ))}

                {!listings?.length && (
                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="mx-auto h-12 w-12 text-gray-300">
                            <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No active listings</h3>
                        <p className="mt-1 text-sm text-gray-500">Be the first to share food in your area!</p>
                        <div className="mt-6">
                            <Link href="/listings/create" className="text-sm font-medium text-green-600 hover:text-green-500">
                                Share Food Now &rarr;
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
