import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ListingDetailsPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: listing } = await supabase
        .from('listings')
        .select('*, donor:profiles(*)')
        .eq('id', params.id)
        .single()

    if (!listing) {
        return notFound()
    }

    // Booking Action (RENAMED to requestPickup to match usage)
    async function requestPickup() {
        'use server'
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return redirect('/login')

        // Call RPC for secure booking transaction
        // Ensure lifecycle_setup.sql or lifecycle_v2_email.sql has been run
        const { data: success, error: rpcError } = await supabase.rpc('request_pickup', {
            p_listing_id: params.id,
            p_volunteer_id: user.id
        })

        if (rpcError || !success) {
            console.error("Booking failed:", rpcError)
            return redirect(`/listings/${params.id}?error=Request failed or already requested`)
        }

        // Redirect to Feed on success
        redirect('/?success=Request sent successfully')
    }

    const isOwner = user?.id === listing.donor_id
    const isAvailable = listing.status === 'available'

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Food Listing Details</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Posted by {listing.donor?.organization_name || listing.donor?.display_name}</p>
                </div>
                <div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${listing.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {listing.status.toUpperCase()}
                    </span>
                </div>
            </div>
            <div className="border-t border-gray-200">
                <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Title</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{listing.title}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{listing.description}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Image</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {listing.image_url ? (
                                <img src={listing.image_url} alt="Food" className="h-48 w-auto rounded-md object-cover" />
                            ) : (
                                <span className="text-gray-400">No image provided</span>
                            )}
                        </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Quantity / Type</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{listing.quantity} • {listing.food_type}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Expiry</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(listing.expiry_date).toLocaleString()}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Address</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{listing.address || 'Contact for address'}</dd>
                    </div>
                </dl>
            </div>
            <div className="px-4 py-5 sm:px-6 flex justify-end space-x-3">
                <Link href="/">
                    <Button variant="outline">Back to Feed</Button>
                </Link>
                {isAvailable && !isOwner && (
                    <form action={requestPickup}>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                            Send Pickup Request
                        </Button>
                    </form>
                )}
                {isOwner && (
                    <Button variant="outline" disabled>You posted this</Button>
                )}
            </div>
        </div>
    )
}
