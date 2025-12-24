import { createAdminClient } from '@/utils/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Users,
    FileText,
    CheckCircle,
    AlertCircle,
    TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { UserRolePieChart } from '@/components/UserRolePieChart'

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
        { count: residentCount },
        { count: restaurantCount },
        { count: volunteerCount },
        { count: ngoCount }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        supabase.from('pickups').select('*', { count: 'exact', head: true }).in('status', ['delivered', 'Delivered', 'completed', 'Completed']),
        supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),

        // Fetch 5 most recent activities (listings created)
        supabase.from('listings')
            .select('title, created_at, status, profiles(full_name)')
            .order('created_at', { ascending: false })
            .limit(5),

        // Role counts for pie chart
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'resident'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'restaurant'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'volunteer'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'ngo')
    ])

    // Prepare pie chart data
    const roleChartData = [
        { role: 'resident', count: residentCount || 0, color: '#3B82F6' },
        { role: 'restaurant', count: restaurantCount || 0, color: '#F97316' },
        { role: 'volunteer', count: volunteerCount || 0, color: '#22C55E' },
        { role: 'ngo', count: ngoCount || 0, color: '#A855F7' }
    ].filter(item => item.count > 0)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">System Overview</h1>
                <p className="text-gray-500">Real-time platform statistics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{userCount || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
                    </CardContent>
                </Card>
                <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Listings</CardTitle>
                        <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                            <FileText className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{listingCount || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">Food donations posted</p>
                    </CardContent>
                </Card>
                <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Meals Delivered</CardTitle>
                        <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{deliveryCount || 0}</div>
                        <p className="text-xs text-green-600 mt-1">Successful handovers</p>
                    </CardContent>
                </Card>
                <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending Verification</CardTitle>
                        <div className={`p-2 rounded-lg transition-colors ${pendingVerifications && pendingVerifications > 0 ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                            <AlertCircle className={pendingVerifications && pendingVerifications > 0 ? "h-4 w-4 text-amber-600" : "h-4 w-4 text-gray-400"} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={"text-3xl font-bold " + (pendingVerifications && pendingVerifications > 0 ? "text-amber-600" : "text-gray-900")}>
                            {pendingVerifications || 0}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {pendingVerifications && pendingVerifications > 0 ? "Requests need review" : "All caught up"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity & Verifications */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Recent Listings Activity */}
                <Card className="col-span-4 hover:shadow-md transition-shadow duration-200">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest food listings posted on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity && recentActivity.length > 0 ? (
                                recentActivity.map((item: any, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
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

                {/* User Composition Pie Chart */}
                <Card className="col-span-3 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle>User Composition</CardTitle>
                        <CardDescription>Distribution of users by role on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {roleChartData.length > 0 ? (
                            <UserRolePieChart data={roleChartData} />
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No users registered yet.</p>
                        )}

                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <Button asChild variant="ghost" className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 text-sm font-medium">
                                <Link href="/admin/users">View All Users</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
