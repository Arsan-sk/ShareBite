'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitVerification(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const documentFile = formData.get('document') as File

    if (!documentFile || documentFile.size === 0) {
        // Handle error (ideally return state)
        return { error: 'Document is required' }
    }

    // Upload Document
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sharebite-assets')
        .upload(`verification/${user.id}/${Date.now()}-${documentFile.name}`, documentFile)

    if (uploadError) {
        console.error('Upload failed:', uploadError)
        return { error: 'Upload failed' }
    }

    const { data: { publicUrl } } = supabase.storage
        .from('sharebite-assets')
        .getPublicUrl(uploadData.path)

    // Insert Request
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
    return { success: true }
}
