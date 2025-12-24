import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { approveRequest, rejectRequest } from '../actions'
import { DocumentViewer } from './DocumentViewer'

export const dynamic = 'force-dynamic'

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabaseAdmin = createAdminClient()

    // Fetch Request with User Profile Details
    const { data: req } = await supabaseAdmin
        .from('verification_requests')
        .select('*')
        .eq('id', id)
        .single()

    if (!req) {
        return <div className="p-8">Request not found</div>
    }

    // Fetch user separately
    const { data: userProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', req.user_id)
        .single()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Verification Request Details</h2>
                    <p className="text-sm text-gray-500">Review all information carefully before making a decision.</p>
                </div>
                <Link href="/admin/verification">
                    <Button variant={null} className="border border-green-400 text-green-600 hover:bg-green-50 transition-colors">
                        ← Back to List
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Applicant Information */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Applicant Information</h3>
                        <p className="text-sm text-gray-500 mt-1">Personal and organizational details</p>
                    </div>
                    <div className="px-6 py-5 space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name / Organization</label>
                            <p className="text-lg font-medium text-gray-900">{userProfile?.full_name || 'Not Provided'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
                            <p className="text-base text-gray-700">{userProfile?.email}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label>
                            <p className="text-lg font-medium text-gray-900">{userProfile?.phone_number || 'Not Provided'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">License / Registration Number</label>
                            {userProfile?.license_number ? (
                                <p className="text-base font-mono bg-gray-100 px-3 py-2 rounded inline-block text-gray-800 border border-gray-200">
                                    {userProfile.license_number}
                                </p>
                            ) : (
                                <p className="text-gray-400 italic">Not Provided</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role</label>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                {userProfile?.role}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Submitted On</label>
                            <p className="text-sm text-gray-600">{new Date(req.submitted_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Right: Document Viewer & Actions */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Proof Document</h3>
                        <p className="text-sm text-gray-500 mt-1">ID Card, License, or Registration Certificate</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-gray-100 p-6 min-h-[500px]">
                        {req.document_url ? (
                            <DocumentViewer documentUrl={req.document_url} />
                        ) : (
                            <p className="text-gray-400 italic">No document uploaded</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {req.status === 'pending' && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                            <form action={async () => {
                                'use server'
                                await rejectRequest(req.id, 'Document unclear or information mismatch')
                            }} className="flex-1">
                                <Button
                                    type="submit"
                                    variant={null}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                                    size="lg"
                                >
                                    Reject Request
                                </Button>
                            </form>
                            <form action={async () => {
                                'use server'
                                await approveRequest(req.id)
                            }} className="flex-1">
                                <Button
                                    type="submit"
                                    variant={null}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                                    size="lg"
                                >
                                    Approve & Verify
                                </Button>
                            </form>
                        </div>
                    )}
                    {req.status === 'approved' && (
                        <div className="px-6 py-4 bg-green-50 border-t border-green-200">
                            <p className="text-green-700 font-semibold text-center">✓ Request Approved</p>
                        </div>
                    )}
                    {req.status === 'rejected' && (
                        <div className="px-6 py-4 bg-red-50 border-t border-red-200">
                            <p className="text-red-700 font-semibold text-center">✗ Request Rejected</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
