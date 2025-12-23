'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { geocodeAddress } from '@/utils/location'

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
    const pickupLat = formData.get('pickup_lat') as string
    const pickupLng = formData.get('pickup_lng') as string
    const pickupAddress = formData.get('pickup_address') as string
    const pickupCity = formData.get('pickup_city') as string

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

    console.log('Creating listing with location:', { pickupLat, pickupLng, pickupAddress, pickupCity })

    const { error } = await supabase.from('listings').insert({
        donor_id: user.id,
        title,
        description,
        quantity,
        food_type: foodType,
        expiry_date: new Date(expiryDate).toISOString(),
        pickup_window_end: new Date(pickupEnd).toISOString(),
        address: pickupAddress || address,
        image_url: imageUrl,
        status: 'available',
        // Location fields
        latitude: pickupLat ? parseFloat(pickupLat) : 0,
        longitude: pickupLng ? parseFloat(pickupLng) : 0,
        pickup_lat: pickupLat ? parseFloat(pickupLat) : null,
        pickup_lng: pickupLng ? parseFloat(pickupLng) : null,
        pickup_address: pickupAddress || null,
        pickup_city: pickupCity || null,
    })

    if (error) {
        console.error('Error creating listing:', error)
        return redirect('/listings/create?error=Failed to create listing')
    }

    revalidatePath('/')
    redirect('/?success=posted')
}
