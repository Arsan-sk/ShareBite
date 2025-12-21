'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptRequest(pickupId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.rpc('accept_pickup', {
        p_pickup_id: pickupId,
        p_donor_id: user?.id
    })

    if (error) console.error(error)
    revalidatePath('/activity')
}

export async function confirmHandover(listingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.rpc('confirm_pickup', {
        p_listing_id: listingId,
        p_donor_id: user?.id
    })

    if (error) console.error(error)
    revalidatePath('/activity')
}

export async function markDelivered(listingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.rpc('complete_delivery', {
        p_listing_id: listingId,
        p_volunteer_id: user?.id
    })

    if (error) console.error(error)
    revalidatePath('/activity')
}
