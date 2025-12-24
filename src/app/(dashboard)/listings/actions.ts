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

    // Basic fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const foodType = formData.get('foodType') as string
    const expiryDate = formData.get('expiryDate') as string
    const pickupEnd = formData.get('pickupEnd') as string

    // Location fields
    const pickupLat = formData.get('pickup_lat') as string
    const pickupLng = formData.get('pickup_lng') as string
    const pickupAddress = formData.get('pickup_address') as string
    const pickupCity = formData.get('pickup_city') as string
    const address = formData.get('address') as string

    // New fields
    const foodCategory = formData.get('foodCategory') as string || 'veg'
    const quantityNumber = parseInt(formData.get('quantityNumber') as string) || 1
    const quantityUnit = formData.get('quantityUnit') as string || 'packs'
    const quantityItemName = formData.get('quantityItemName') as string || null
    const customUnit = formData.get('customUnit') as string || null
    const estimatedMeals = parseInt(formData.get('estimatedMeals') as string) || 1

    // Build quantity string for backward compatibility
    let quantityString = `${quantityNumber} ${quantityUnit}`
    if (quantityUnit === 'half' || quantityUnit === 'full') {
        quantityString = `${quantityNumber} ${quantityUnit}${quantityItemName ? ` ${quantityItemName}` : ''}`
    } else if (quantityUnit === 'custom' && customUnit) {
        quantityString = `${quantityNumber} ${customUnit}`
    }

    // Image Handling
    let imageUrl = formData.get('imageUrl') as string
    const imageFile = formData.get('imageFile') as File

    if (imageFile && imageFile.size > 0) {
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('sharebite-assets')
            .upload(`listings/${user.id}/${Date.now()}-${imageFile.name}`, imageFile)

        if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
                .from('sharebite-assets')
                .getPublicUrl(uploadData.path)
            imageUrl = publicUrl
        } else {
            console.error("Upload error:", uploadError)
        }
    }

    console.log('Creating listing with:', {
        foodCategory,
        quantityNumber,
        quantityUnit,
        estimatedMeals,
        pickupAddress,
        pickupCity
    })

    // Insert listing
    const { error } = await supabase.from('listings').insert({
        donor_id: user.id,
        title,
        description,
        quantity: quantityString,
        food_type: foodType,
        food_category: foodCategory,
        quantity_number: quantityNumber,
        quantity_unit: quantityUnit,
        quantity_item_name: quantityItemName,
        custom_unit: customUnit,
        estimated_meals: estimatedMeals,
        expiry_date: new Date(expiryDate).toISOString(),
        pickup_window_end: new Date(pickupEnd).toISOString(),
        address: pickupAddress || address,
        image_url: imageUrl,
        status: 'available',
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

    // Update profile stats
    // Increment times_shared by 1 and add estimated_meals to total_meals_donated
    const { error: profileError } = await supabase.rpc('increment_profile_meals', {
        p_user_id: user.id,
        p_meals_to_add: estimatedMeals
    })

    if (profileError) {
        // Fallback: Direct update if RPC doesn't exist
        console.log('RPC not available, using direct update')
        await supabase
            .from('profiles')
            .update({
                times_shared: supabase.rpc('increment', { x: 1 }),
                total_meals_donated: supabase.rpc('increment', { x: estimatedMeals }),
                meals_shared: supabase.rpc('increment', { x: 1 })  // Keep for backward compat
            })
            .eq('id', user.id)
    }

    revalidatePath('/')
    redirect('/?success=posted')
}
