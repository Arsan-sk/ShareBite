'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createListing(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Basic validation could go here
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const quantity = formData.get('quantity') as string
    const foodType = formData.get('foodType') as string
    const expiryDate = formData.get('expiryDate') as string
    const pickupEnd = formData.get('pickupEnd') as string
    const address = formData.get('address') as string

    // Image Handling
    let imageUrl = formData.get('imageUrl') as string
    const imageFile = formData.get('imageFile') as File

    if (imageFile && imageFile.size > 0) {
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('sharebite-assets')
            .upload(`listings/${user.id}/${Date.now()}-${imageFile.name}`, imageFile)

        if (!uploadError && uploadData) {
            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('sharebite-assets')
                .getPublicUrl(uploadData.path)
            imageUrl = publicUrl
        } else {
            console.error("Upload error:", uploadError)
        }
    }

    // We should fetch the user's location setup, but for now we take manual address
    // And maybe default lat/long to 0 or null

    const { error } = await supabase.from('listings').insert({
        donor_id: user.id,
        title,
        description,
        quantity,
        food_type: foodType,
        expiry_date: new Date(expiryDate).toISOString(),
        pickup_window_end: new Date(pickupEnd).toISOString(),
        address,
        image_url: imageUrl, // Add this column mapping
        status: 'available'
    })

    if (error) {
        console.error('Error creating listing:', error)
        // Return to form with error (not implemented in this simple action, usually state form)
        // For MVP just redirect
        return redirect('/listings/create?error=Failed to create listing')
    }

    revalidatePath('/')
    redirect('/?success=posted')
}
