'use server'

import { createClient } from '@/utils/supabase/server'

export async function debugAdminData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    console.log('--- DEBUG START ---')
    console.log('Current User:', user?.id, user?.email)

    // 1. Check Profile Visibility
    const { data: myProfile, error: myProfileError } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', user?.id!)
        .single()
    console.log('My Profile:', myProfile, 'Error:', myProfileError)

    // 2. Check All Profiles (Admin View)
    const { count: totalProfiles, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
    console.log('Total Profiles Visible:', totalProfiles, 'Error:', countError)

    // 3. Check Verification Requests
    const { data: requests, error: reqError } = await supabase
        .from('verification_requests')
        .select('id, user_id, status')
    console.log('Requests Raw:', requests, 'Error:', reqError)

    // 4. Check Join (The failing part)
    const { data: requestsWithProfile, error: joinError } = await supabase
        .from('verification_requests')
        .select('id, profiles(full_name)')
    console.log('Requests Join:', JSON.stringify(requestsWithProfile, null, 2), 'Error:', joinError)

    // 5. Check Pickups Status
    const { data: pickups } = await supabase.from('pickups').select('id, status')
    console.log('Pickups:', pickups)

    console.log('--- DEBUG END ---')
}
