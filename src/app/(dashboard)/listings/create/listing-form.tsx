'use client'

import { createListing } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { LocationPicker } from '@/components/LocationPicker'

export default function ListingForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imageType, setImageType] = useState<'url' | 'upload'>('upload')
    const [preview, setPreview] = useState<string | null>(null)
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string; city?: string } | null>(null)
    const [savedLocation, setSavedLocation] = useState<{ lat: number; lng: number; address: string; city?: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Fetch user's saved location on mount
    useEffect(() => {
        const fetchUserLocation = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('location_lat, location_lng, location_address, location_city')
                    .eq('id', user.id)
                    .single()

                if (profile?.location_lat && profile?.location_lng) {
                    setSavedLocation({
                        lat: profile.location_lat,
                        lng: profile.location_lng,
                        address: profile.location_address || '',
                        city: profile.location_city || undefined
                    })
                }
            }
        }
        fetchUserLocation()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true)
        try {
            // If upload, we might want to upload client side or let server action handle it.
            // Letting server action handle standard FormData file is cleaner for Next.js 14 Actions if size < 4MB.
            // But Supabase storage usually better from client for large files. 
            // For MVP, let's try direct Server Action upload first (simplest code), 
            // but we need to ensure the action handles it.

            // Actually, standard FormData transmission of File works.
            await createListing(formData)
        } catch (e) {
            console.error(e)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 pb-20">
            {/* Added pb-20 to ensure button space on mobile */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title / Food Name
                </label>
                <div className="mt-1">
                    <Input id="title" name="title" required placeholder="e.g. 50 Servings of Fried Rice" />
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <div className="mt-1">
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        required
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2 text-gray-900"
                        placeholder="Any details about allergens, packaging, etc."
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Food Image</label>
                <div className="flex space-x-4 mb-2">
                    <button
                        type="button"
                        onClick={() => setImageType('upload')}
                        className={`text-sm px-3 py-1 rounded-full ${imageType === 'upload' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        Upload File
                    </button>
                    <button
                        type="button"
                        onClick={() => setImageType('url')}
                        className={`text-sm px-3 py-1 rounded-full ${imageType === 'url' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        Image URL
                    </button>
                </div>

                {imageType === 'upload' ? (
                    <div className="mt-1 flex items-center">
                        <Input
                            ref={fileInputRef}
                            id="imageFile"
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                ) : (
                    <div className="mt-1">
                        <Input id="imageUrl" name="imageUrl" placeholder="https://..." />
                    </div>
                )}

                {preview && imageType === 'upload' && (
                    <div className="mt-2 h-32 w-32 relative rounded-md overflow-hidden bg-gray-100">
                        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                </label>
                <div className="mt-1">
                    <Input id="quantity" name="quantity" required placeholder="e.g. 5kg, 10 packs" />
                </div>
            </div>

            <div>
                <label htmlFor="foodType" className="block text-sm font-medium text-gray-700">
                    Food Type
                </label>
                <select
                    id="foodType"
                    name="foodType"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-gray-900"
                >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Cooked Meals">Cooked Meals</option>
                    <option value="Raw Ingredients">Raw Ingredients</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                        Expiry Date & Time
                    </label>
                    <div className="mt-1">
                        <Input type="datetime-local" id="expiryDate" name="expiryDate" required />
                    </div>
                </div>

                <div>
                    <label htmlFor="pickupEnd" className="block text-sm font-medium text-gray-700">
                        Pickup Until
                    </label>
                    <div className="mt-1">
                        <Input type="datetime-local" id="pickupEnd" name="pickupEnd" required />
                    </div>
                </div>
            </div>

            <LocationPicker
                savedLocation={savedLocation}
                onLocationSelect={setLocation}
            />

            {/* Hidden fields for location data */}
            <input type="hidden" name="pickup_lat" value={location?.lat || ''} />
            <input type="hidden" name="pickup_lng" value={location?.lng || ''} />
            <input type="hidden" name="pickup_address" value={location?.address || ''} />
            <input type="hidden" name="pickup_city" value={location?.city || ''} />
            <input type="hidden" name="address" value={location?.address || ''} />

            <div className="pt-4 flex items-center justify-end border-t border-gray-200 mt-6 md:static fixed bottom-0 left-0 right-0 bg-white p-4 md:p-0 md:bg-transparent z-10 shadow-up md:shadow-none">
                <Button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6" disabled={isSubmitting}>
                    {isSubmitting ? 'Posting...' : 'Create Listing'}
                </Button>
            </div>
        </form>
    )
}
