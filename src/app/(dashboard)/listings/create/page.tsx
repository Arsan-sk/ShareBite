import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ListingForm from './listing-form'

export default async function CreateListingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow pb-24 md:pb-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Share Food</h1>
            <ListingForm />
        </div>
    )
}
