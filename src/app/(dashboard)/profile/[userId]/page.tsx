import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PublicProfileClient } from './public-profile-client'
import { getByteMateStatus, recordProfileView } from '@/app/(dashboard)/actions/bytemate-actions'

interface PageProps {
    params: {
        userId: string
    }
}

export default async function PublicProfilePage({ params }: PageProps) {
    const { userId } = await params
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
        redirect('/login')
    }

    // Redirect to own profile if viewing self
    if (currentUser.id === userId) {
        redirect('/profile')
    }

    // Fetch target user's profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error || !profile) {
        notFound()
    }

    // Get ByteMate status
    const byteMateStatus = await getByteMateStatus(userId)

    // Fetch user's recent listings
    const { data: recentListings } = await supabase
        .from('listings')
        .select('id, title, food_type, food_category, created_at, status, image_url')
        .eq('donor_id', userId)
        .order('created_at', { ascending: false })
        .limit(6)

    // Record profile view (async, don't await)
    recordProfileView(userId)

    return (
        <PublicProfileClient
            profile={profile}
            recentListings={recentListings || []}
            byteMateStatus={byteMateStatus}
        />
    )
}
