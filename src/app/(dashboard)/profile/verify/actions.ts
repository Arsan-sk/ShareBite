'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitDetailedVerification(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const fullName = formData.get('fullName') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const licenseNumber = formData.get('licenseNumber') as string
    const documentFile = formData.get('document') as File

    // 1. Update Profile Details
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            phone_number: phoneNumber,
            license_number: licenseNumber
            // Note: We might want organization_name to be set if it's an NGO/Restaurant role
            // But relying on full_name field reuse for now or separate based on role is easier.
            // Let's assume full_name holds the entity name for now.
        })
        .eq('id', user.id)

    if (profileError) {
        console.error('Profile update failed:', profileError)
        return { error: 'Failed to update profile details' }
    }

    // 2. Upload Document
    if (!documentFile || documentFile.size === 0) {
        return { error: 'Document is required' }
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(`${user.id}/${Date.now()}-${documentFile.name}`, documentFile, {
            upsert: false
        })

    if (uploadError) {
        console.error('Upload failed:', uploadError)
        return { error: 'Upload failed' }
    }

    const { data: { publicUrl } } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(uploadData.path)

    // 3. Create Verification Request
    const { error: insertError } = await supabase.from('verification_requests').insert({
        user_id: user.id,
        document_url: publicUrl,
        status: 'pending'
    })

    if (insertError) {
        // handle duplicate request error
        return { error: 'Request already pending' }
    }

    revalidatePath('/profile')
    redirect('/profile?success=verification_submitted')
}
