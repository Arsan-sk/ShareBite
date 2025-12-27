'use server'

import { createClient } from '@/utils/supabase/server'

export interface UserSearchResult {
    id: string
    display_name: string | null
    email: string
    avatar_url: string | null
    is_verified: boolean
    impact_score: number
    bytemate_count: number
    role: string
    bio: string | null
    organization_name: string | null
}

/**
 * Search users by name (prefix-based, case-insensitive)
 */
export async function searchUsers(query: string): Promise<UserSearchResult[]> {
    if (!query || query.trim().length < 1) {
        return []
    }

    const supabase = await createClient()
    const searchTerm = query.trim().toLowerCase()

    // Search by display_name, full_name, or email prefix
    const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url, is_verified, impact_score, bytemate_count, role, bio, organization_name')
        .or(`display_name.ilike.${searchTerm}%,full_name.ilike.${searchTerm}%,email.ilike.${searchTerm}%`)
        .order('display_name', { ascending: true, nullsFirst: false })
        .order('email', { ascending: true })
        .limit(50)

    if (error) {
        console.error('Search error:', error)
        return []
    }

    return data || []
}

/**
 * Get suggested users (popular, verified, or nearby)
 */
export async function getSuggestedUsers(limit: number = 10): Promise<UserSearchResult[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    // Get users the current user is NOT following, sorted by impact score
    const { data: bytemates } = await supabase
        .from('bytemates')
        .select('following_id')
        .eq('follower_id', user.id)

    const followingIds = bytemates?.map(b => b.following_id) || []

    const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url, is_verified, impact_score, bytemate_count, role, bio, organization_name')
        .neq('id', user.id) // Exclude self
        .not('id', 'in', `(${followingIds.join(',')})`) // Exclude already following
        .order('impact_score', { ascending: false })
        .order('bytemate_count', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Suggested users error:', error)
        return []
    }

    return data || []
}
