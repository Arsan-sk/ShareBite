import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button' // Minimal button
import { signout } from '@/app/(auth)/actions'

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

    if (!profile) {
        // Fallback UI to self-repair
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-lg text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Setup Required</h3>
                <p className="text-gray-500 mb-4">Your account needs a profile setup to continue.</p>
                <form action={signout}>
                    <Button variant="default">Refresh Session (Sign Out)</Button>
                </form>
                <p className="text-xs text-gray-400 mt-4">If this persists, please contact support.</p>
            </div>
        )
    }

    // Determine Badge based on impact score
    let badge = 'Newcomer'
    let badgeColor = 'bg-gray-100 text-gray-800'
    const score = profile.impact_score || 0

    if (score >= 100) {
        badge = 'Community Hero'
        badgeColor = 'bg-yellow-100 text-yellow-800'
    } else if (score >= 50) {
        badge = 'Impact Maker'
        badgeColor = 'bg-indigo-100 text-indigo-800'
    } else if (score >= 10) {
        badge = 'Active Contributor'
        badgeColor = 'bg-green-100 text-green-800'
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold leading-6 text-gray-900">My Profile</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and impact stats.</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${badgeColor}`}>
                        {badge}
                    </span>
                </div>

                <div className="border-t border-gray-200">
                    {/* Impact Stats Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-b border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 bg-gray-50">
                        <div className="px-6 py-5 text-center">
                            <dt className="text-sm font-medium text-gray-500">Impact Score</dt>
                            <dd className="mt-1 text-3xl font-semibold text-indigo-600">{profile.impact_score || 0}</dd>
                        </div>
                        <div className="px-6 py-5 text-center">
                            <dt className="text-sm font-medium text-gray-500">Meals Shared</dt>
                            <dd className="mt-1 text-3xl font-semibold text-green-600">{profile.meals_shared || 0}</dd>
                        </div>
                        <div className="px-6 py-5 text-center">
                            <dt className="text-sm font-medium text-gray-500">Role</dt>
                            <dd className="mt-1 text-lg font-medium text-gray-900 capitalize">{profile.role}</dd>
                        </div>
                    </div>

                    <dl className="divide-y divide-gray-200 bg-white">
                        <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 transition-colors">
                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.full_name || 'Not set'}</dd>
                        </div>
                        <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 transition-colors">
                            <dt className="text-sm font-medium text-gray-500">Email address</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.email}</dd>
                        </div>
                        <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 transition-colors">
                            <dt className="text-sm font-medium text-gray-500">Display Name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.display_name || user.email?.split('@')[0]}</dd>
                        </div>
                        <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 transition-colors">
                            <dt className="text-sm font-medium text-gray-500">Organization</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.organization_name || '-'}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Account Actions */}
            <div className="mt-8 flex justify-end">
                <form action={signout}>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Log Out</Button>
                </form>
            </div>
        </div>
    )
}
