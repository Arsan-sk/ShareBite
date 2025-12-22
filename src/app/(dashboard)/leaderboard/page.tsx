import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LeaderboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Top Donors (Restaurants/Residents)
    const { data: topDonors } = await supabase
        .from('profiles')
        .select('*')
        .gt('meals_shared', 0)
        .order('impact_score', { ascending: false })
        .limit(10)

    // Fetch Top Volunteers (NGOs/Volunteers)
    // Assuming volunteers might not list meals_shared but have impact_score from deliveries
    const { data: topVolunteers } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['volunteer', 'ngo'])
        .gt('impact_score', 0)
        .order('impact_score', { ascending: false })
        .limit(10)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Community Impact</h1>
                <p className="mt-2 text-gray-600">Celebrating our top contributors making a difference.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Top Donors Section */}
                <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Top Donors</h2>
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full">Most Meals Shared</span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {topDonors?.map((donor, index) => (
                            <li key={donor.id} className="px-6 py-4 hover:bg-gray-50 flex items-center">
                                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm mr-4 
                                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-200 text-gray-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-white text-gray-500'}`}>
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {donor.organization_name || donor.display_name || 'Anonymous'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{donor.role ? donor.role.charAt(0).toUpperCase() + donor.role.slice(1) : 'User'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">{donor.meals_shared || 0}</p>
                                    <p className="text-xs text-gray-500">Meals Shared</p>
                                </div>
                            </li>
                        ))}
                        {!topDonors?.length && (
                            <li className="px-6 py-8 text-center text-gray-500 text-sm">No donors yet. Be the first!</li>
                        )}
                    </ul>
                </div>

                {/* Top Volunteers Section */}
                <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Top Volunteers</h2>
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">Highest Impact Score</span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {topVolunteers?.map((volunteer, index) => (
                            <li key={volunteer.id} className="px-6 py-4 hover:bg-gray-50 flex items-center">
                                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm mr-4 
                                     ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-200 text-gray-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-white text-gray-500'}`}>
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {volunteer.organization_name || volunteer.display_name || 'Anonymous'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{volunteer.role ? volunteer.role.charAt(0).toUpperCase() + volunteer.role.slice(1) : 'User'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-indigo-600">{volunteer.impact_score || 0}</p>
                                    <p className="text-xs text-gray-500">Impact Score</p>
                                </div>
                            </li>
                        ))}
                        {!topVolunteers?.length && (
                            <li className="px-6 py-8 text-center text-gray-500 text-sm">No active volunteers yet.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}
