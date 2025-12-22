import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function VerificationPage() {
    // 1. Auth Check
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/')

    // 2. Data Fetch (Use Admin Client to bypass RLS)
    const supabaseAdmin = createAdminClient()

    // Fetch Pending Requests with User Details
    const { data: requests, error: requestsError } = await supabaseAdmin
        .from('verification_requests')
        .select(`
            id,
            status,
            submitted_at,
            user_id
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true })

    // Fetch user details separately
    let requestsWithUsers = requests || []
    if (requests && requests.length > 0) {
        const userIds = requests.map(r => r.user_id)
        const { data: users } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, email, role')
            .in('id', userIds)

        requestsWithUsers = requests.map(req => ({
            ...req,
            user: users?.find(u => u.id === req.user_id) || null
        }))
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Verification Requests</h1>
                    <p className="text-sm text-gray-500">Review and approve identity proofs from users.</p>
                </div>
            </div>

            {(!requestsWithUsers || requestsWithUsers.length === 0) ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                    <p className="mt-1 text-sm text-gray-500">All caught up! Check back later.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Submitted
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requestsWithUsers.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {req.user?.full_name || 'Unknown User'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{req.user?.email || 'No Email'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900 capitalize">{req.user?.role || 'user'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(req.submitted_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Pending
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/admin/verification/${req.id}`}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                                        >
                                            Review Details →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
