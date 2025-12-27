'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Add a ByteMate (follow a user)
 */
export async function addByteMate(targetUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    if (user.id === targetUserId) {
        return { error: 'Cannot ByteMate yourself' }
    }

    // Check if already ByteMate
    const { data: existing } = await supabase
        .from('bytemates')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single()

    if (existing) {
        return { error: 'Already a ByteMate' }
    }

    // Create ByteMate relationship
    const { error } = await supabase
        .from('bytemates')
        .insert({
            follower_id: user.id,
            following_id: targetUserId
        })

    if (error) {
        console.error('Error adding ByteMate:', error)
        return { error: 'Failed to add ByteMate' }
    }

    // Revalidate relevant pages
    revalidatePath(`/profile/${targetUserId}`)
    revalidatePath('/feed')
    revalidatePath('/search')

    return { success: true }
}

/**
 * Remove a ByteMate (unfollow a user)
 */
export async function removeByteMate(targetUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('bytemates')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)

    if (error) {
        console.error('Error removing ByteMate:', error)
        return { error: 'Failed to remove ByteMate' }
    }

    // Revalidate relevant pages
    revalidatePath(`/profile/${targetUserId}`)
    revalidatePath('/feed')
    revalidatePath('/search')

    return { success: true }
}

/**
 * Get ByteMate status between current user and target user
 */
export async function getByteMateStatus(targetUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return {
            isFollowing: false,
            isFollowedBy: false
        }
    }

    // Check if current user follows target
    const { data: following } = await supabase
        .from('bytemates')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single()

    // Check if target follows current user
    const { data: followedBy } = await supabase
        .from('bytemates')
        .select('id')
        .eq('follower_id', targetUserId)
        .eq('following_id', user.id)
        .single()

    return {
        isFollowing: !!following,
        isFollowedBy: !!followedBy
    }
}

/**
 * Get list of users that current user is following (ByteMates)
 */
export async function getMyByteMates() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data } = await supabase
        .from('bytemates')
        .select(`
            following_id,
            profiles:following_id (
                id,
                display_name,
                email,
                avatar_url,
                is_verified,
                impact_score,
                bytemate_count
            )
        `)
        .eq('follower_id', user.id)
        .order('created_at', { ascending: false })

    return data || []
}

/**
 * Get list of users following current user (ByteMate followers)
 */
export async function getMyByteMateFollowers() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data } = await supabase
        .from('bytemates')
        .select(`
            follower_id,
            profiles:follower_id (
                id,
                display_name,
                email,
                avatar_url,
                is_verified,
                impact_score,
                bytemate_count
            )
        `)
        .eq('following_id', user.id)
        .order('created_at', { ascending: false })

    return data || []
}

/**
 * Get ByteMate IDs for feed personalization
 */
export async function getByteMateIds() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data } = await supabase
        .from('bytemates')
        .select('following_id')
        .eq('follower_id', user.id)

    return data?.map(b => b.following_id) || []
}

/**
 * Record a profile view (analytics)
 */
export async function recordProfileView(viewedProfileId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Don't record if viewing own profile or not authenticated
    if (!user || user.id === viewedProfileId) {
        return
    }

    await supabase
        .from('public_profile_views')
        .insert({
            viewer_id: user.id,
            viewed_profile_id: viewedProfileId
        })
}
