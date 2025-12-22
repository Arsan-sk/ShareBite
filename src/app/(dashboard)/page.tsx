import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { VerifiedBadge } from '@/components/VerifiedBadge'

export default async function FeedPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: listings } = await supabase
        .from('listings')
        .select(`
      *,
      donor:profiles(*)
    `)
        .eq('status', 'available')
        .neq('donor_id', user?.id) // Hide own listings
        .order('created_at', { ascending: false })

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Live Food Feed</h1>
                <Link href="/listings/create" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    + Share Food
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {listings?.map((listing: any) => (
                    <div key={listing.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
                        <div className="p-5 flex-1">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {/* Avatar logic */}
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs overflow-hidden">
                                        {listing.donor?.avatar_url ? (
                                            <img src={listing.donor.avatar_url} alt="Ava" className="h-full w-full object-cover" />
                                        ) : (
                                            listing.donor?.display_name?.[0] || 'U'
                                        )}
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                        {listing.donor?.organization_name || listing.donor?.display_name || 'Anonymous'}
                                        {listing.donor?.is_verified && <VerifiedBadge />}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {/* Distance would require geo calculation, just showing time for now */}
                                        {listing.created_at ? formatDistanceToNow(new Date(listing.created_at), { addSuffix: true }) : 'Just now'}
                                    </p>
                                </div>
                            </div>

                            {listing.image_url && (
                                <div className="mt-4 h-48 w-full bg-gray-100 rounded-md overflow-hidden">
                                    <img
                                        src={listing.image_url}
                                        alt={listing.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="mt-4">
                                <h3 className="text-lg font-medium text-gray-900">{listing.title}</h3>
                                <div className="mt-1 text-sm text-gray-500 space-y-1">
                                    <p>{listing.description}</p>
                                    <p className="font-semibold text-green-700">Qty: {listing.quantity}</p>
                                    <p className="text-xs">Expires: {new Date(listing.expiry_date).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 mt-auto">
                            <div className="text-sm">
                                {/* Link to details page (TODO) */}
                                <Link href={`/listings/${listing.id}`} className="font-medium text-green-700 hover:text-green-900 cursor-pointer">
                                    Request Pickup
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {!listings?.length && (
                    <div className="bg-white overflow-hidden shadow rounded-lg col-span-full">
                        <div className="p-5">
                            <div className="h-24 bg-gray-100 flex items-center justify-center text-gray-400">
                                No active listings. Be the first to share!
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
