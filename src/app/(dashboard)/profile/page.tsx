import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './profile-client'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Query pending verification request
    const { data: pendingRequest } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single()

    if (!profile) {
        // Fallback for missing profile
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-lg text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Setup Required</h3>
                <p className="text-gray-500 mb-4">Your account needs a profile setup to continue.</p>
                <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
                    Try logging in again →
                </a>
            </div>
        )
    }

    return <ProfileClient profile={profile} pendingRequest={pendingRequest} />
}
