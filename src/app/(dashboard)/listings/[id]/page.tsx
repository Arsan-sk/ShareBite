import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { ListingDetailsClient } from './listing-details-client'

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

    const isOwner = user?.id === listing.donor_id

    return <ListingDetailsClient listing={listing} isOwner={isOwner} user={user} listingId={params.id} />
}
