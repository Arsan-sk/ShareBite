import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
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

    // Query pending request status to show "Pending" state
    const { data: request } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
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
            </div>
        )
    }

    // Determine Badge
    let badge = 'Newcomer'
    let badgeColor = 'bg-gray-100 text-gray-800'
    const score = profile.impact_score || 0
    if (score >= 100) { badge = 'Community Hero'; badgeColor = 'bg-yellow-100 text-yellow-800'; }
    else if (score >= 50) { badge = 'Impact Maker'; badgeColor = 'bg-indigo-100 text-indigo-800'; }
    else if (score >= 10) { badge = 'Active Contributor'; badgeColor = 'bg-green-100 text-green-800'; }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold leading-6 text-gray-900">My Profile</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and impact stats.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${badgeColor}`}>
                            {badge}
                        </span>
                        <form action={signout}>
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Log Out</Button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-200">
                    <dl>
                        {/* Impact Stats Row */}
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <div className="text-center sm:text-left">
                                <dt className="text-sm font-medium text-gray-500">Impact Score</dt>
                                <dd className="mt-1 text-2xl font-semibold text-indigo-600">{profile.impact_score || 0}</dd>
                            </div>
                            <div className="text-center sm:text-left mt-4 sm:mt-0">
                                <dt className="text-sm font-medium text-gray-500">Meals Shared</dt>
                                <dd className="mt-1 text-2xl font-semibold text-green-600">{profile.meals_shared || 0}</dd>
                            </div>
                            <div className="text-center sm:text-left mt-4 sm:mt-0">
                                <dt className="text-sm font-medium text-gray-500">Role</dt>
                                <dd className="mt-1 text-xl font-medium text-gray-900 capitalize">{profile.role}</dd>
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.full_name || 'Not set'}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Email address</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.email}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Organization</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.organization_name || '-'}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.phone_number || '-'}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Address</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.address || '-'}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Verification Section (Bottom Card) */}
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Verification Status</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>Verify your identity to build trust and unlock more features. Required for posting food.</p>
                    </div>
                    <div className="mt-5">
                        {profile.is_verified ? (
                            <div className="rounded-md bg-green-50 p-4 border border-green-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800">Verified</h3>
                                        <div className="mt-2 text-sm text-green-700">
                                            <p>Your account is verified. Thank you for being a trusted member.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : request ? (
                            <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">Verification Pending</h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>Your application is under review. Submitted on {new Date(request.submitted_at).toLocaleDateString()}.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                    <a href="/profile/verify">Apply for Verification</a>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
