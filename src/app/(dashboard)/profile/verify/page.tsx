import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitDetailedVerification } from './actions'

export default async function VerifyPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Apply for Verification
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Provide official details to verify your identity.</p>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                {/* @ts-ignore */}
                <form action={submitDetailedVerification} className="p-6 space-y-6">

                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name / Organization Name</label>
                        <div className="mt-1">
                            <Input
                                id="fullName"
                                name="fullName"
                                defaultValue={profile?.full_name || profile?.organization_name || ''}
                                required
                                placeholder="Enter your full legal name or organization name"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <p className="text-xs text-gray-500 mb-1">We may contact you for verification.</p>
                        <div className="mt-1">
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                defaultValue={profile?.phone_number || ''}
                                required
                                placeholder="+91 99999 99999"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">License / Registration Number (Optional)</label>
                        <p className="text-xs text-gray-500 mb-1">Required for Restaurants and NGOs.</p>
                        <div className="mt-1">
                            <Input
                                id="licenseNumber"
                                name="licenseNumber"
                                defaultValue={profile?.license_number || ''}
                                placeholder="Reg No. 12345/2024"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="document" className="block text-sm font-medium text-gray-700">Proof of Identity (Image/PDF)</label>
                        <p className="text-xs text-gray-500 mb-1">Upload Aadhaar, PAN, or Registration Certificate.</p>
                        <div className="mt-2 text-sm text-gray-900 border border-gray-300 rounded-md p-2 bg-gray-50">
                            <input
                                type="file"
                                name="document"
                                required
                                accept="image/*,application/pdf"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                    </div>

                    <div className="pt-5 border-t border-gray-200 flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <a href="/profile">Cancel</a>
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            Submit Application
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    )
}
