import { createAdminClient } from '@/utils/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Users,
    FileText,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Clock
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    const supabase = createAdminClient()

    // 1. Fetch Key Metrics (Parallel Requests for Performance)
    const [
        { count: userCount },
        { count: listingCount },
        { count: deliveryCount },
        { count: pendingVerifications },
        { data: recentActivity },
        { data: recentVerifications }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        // Check for both 'delivered' and 'completed' statuses (and case variants)
        supabase.from('pickups').select('*', { count: 'exact', head: true }).in('status', ['delivered', 'Delivered', 'completed', 'Completed']),
        supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),

        // Fetch 5 most recent activities (listings created)
        supabase.from('listings')
            .select('title, created_at, status, profiles(full_name)')
            .order('created_at', { ascending: false })
            .limit(5),

        // Fetch 5 most recent verification requests
        supabase.from('verification_requests')
            .select('status, submitted_at, users:profiles(full_name, email)')
            .eq('status', 'pending')
            .order('submitted_at', { ascending: false })
            .limit(5)
    ])

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">System Overview</h1>
                <p className="text-gray-500">Real-time platform statistics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{userCount || 0}</div>
                        <p className="text-xs text-gray-500">Registered accounts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Listings</CardTitle>
                        <FileText className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{listingCount || 0}</div>
                        <p className="text-xs text-gray-500">Food donations posted</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Meals Delivered</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{deliveryCount || 0}</div>
                        <p className="text-xs text-green-600">Successful handovers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending Verification</CardTitle>
                        <AlertCircle className={pendingVerifications && pendingVerifications > 0 ? "h-4 w-4 text-yellow-600" : "h-4 w-4 text-gray-400"} />
                    </CardHeader>
                    <CardContent>
                        <div className={"text-2xl font-bold " + (pendingVerifications && pendingVerifications > 0 ? "text-yellow-700" : "text-gray-900")}>
                            {pendingVerifications || 0}
                        </div>
                        <p className="text-xs text-gray-500">
                            {pendingVerifications && pendingVerifications > 0 ? "Requests need review" : "All caught up"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity & Verifications */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Recent Listings Activity */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest food listings posted on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity && recentActivity.length > 0 ? (
                                recentActivity.map((item: any, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 p-2 rounded-full">
                                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                                <p className="text-xs text-gray-500">by {item.profiles?.full_name || 'Unknown'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'available' ? 'bg-green-100 text-green-800' :
                                                item.status === 'claimed' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {item.status}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No recent activity found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Verifications */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Verifications</CardTitle>
                        <CardDescription>Latest status updates on user requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentVerifications && recentVerifications.length > 0 ? (
                                recentVerifications.map((req: any, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-50 p-2 rounded-full">
                                                <Clock className="h-4 w-4 text-gray-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                                    {/* @ts-ignore */}
                                                    {(Array.isArray(req.users) ? req.users[0] : req.users)?.full_name || (Array.isArray(req.users) ? req.users[0] : req.users)?.email || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Submitted {new Date(req.submitted_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No verification requests yet.</p>
                            )}

                            <div className="pt-4 mt-2 border-t border-gray-100">
                                <Button asChild variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-sm">
                                    <Link href="/admin/verification">View All Requests</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
