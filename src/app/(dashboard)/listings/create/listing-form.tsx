'use client'

import { createListing } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MapPin, Loader2, Camera, Link as LinkIcon, Upload, Calendar, Clock, Utensils, Package, Scale } from 'lucide-react'
import { reverseGeocode } from '@/utils/location'

export default function ListingForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imageType, setImageType] = useState<'url' | 'upload'>('upload')
    const [preview, setPreview] = useState<string | null>(null)

    // Location state
    const [locationAddress, setLocationAddress] = useState('')
    const [locationLat, setLocationLat] = useState<number | null>(null)
    const [locationLng, setLocationLng] = useState<number | null>(null)
    const [locationCity, setLocationCity] = useState('')
    const [gettingLocation, setGettingLocation] = useState(false)

    // New quantity state
    const [quantityNumber, setQuantityNumber] = useState(1)
    const [quantityUnit, setQuantityUnit] = useState('packs')
    const [quantityItemName, setQuantityItemName] = useState('')
    const [customUnit, setCustomUnit] = useState('')
    const [foodCategory, setFoodCategory] = useState('veg')

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Calculate estimated meals
    const calculateMeals = (): number => {
        const multipliers: Record<string, number> = {
            'kg': 3,
            'packs': 1,
            'half': 1,
            'full': 2,
            'custom': 1
        }
        const multiplier = multipliers[quantityUnit] || 1
        return Math.ceil(quantityNumber * multiplier)
    }

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
                    setLocationLat(profile.location_lat)
                    setLocationLng(profile.location_lng)
                    setLocationAddress(profile.location_address || '')
                    setLocationCity(profile.location_city || '')
                }
            }
        }
        fetchUserLocation()
    }, [])

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
            return
        }

        setGettingLocation(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setLocationLat(latitude)
                setLocationLng(longitude)

                try {
                    const result = await reverseGeocode(latitude, longitude)
                    if (result) {
                        setLocationAddress(result.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
                        setLocationCity(result.city || '')
                    } else {
                        setLocationAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
                    }
                } catch (err) {
                    setLocationAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
                }
                setGettingLocation(false)
            },
            (error) => {
                alert('Unable to get location: ' + error.message)
                setGettingLocation(false)
            }
        )
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true)
        try {
            await createListing(formData)
        } catch (e) {
            console.error(e)
        } finally {
            setIsSubmitting(false)
        }
    }

    const quantityUnitOptions = [
        { value: 'kg', label: 'Kg', icon: '⚖️' },
        { value: 'packs', label: 'Packs', icon: '📦' },
        { value: 'half', label: 'Half', icon: '½' },
        { value: 'full', label: 'Full', icon: '🍽️' },
        { value: 'custom', label: 'Custom', icon: '✏️' }
    ]

    const foodTypeOptions = [
        { value: 'Cooked Meals', label: 'Cooked Meals' },
        { value: 'Bakery', label: 'Bakery Items' },
        { value: 'Raw Ingredients', label: 'Raw Ingredients' },
        { value: 'Fruits & Vegetables', label: 'Fruits & Vegetables' },
        { value: 'Beverages', label: 'Beverages' },
        { value: 'Other', label: 'Other' }
    ]

    return (
        <form action={handleSubmit} className="space-y-6 pb-20">
            {/* Section: Food Details */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-green-600" />
                        Food Details
                    </h3>
                </div>
                <div className="p-5 space-y-4">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title / Food Name
                        </label>
                        <Input
                            id="title"
                            name="title"
                            required
                            placeholder="e.g. Vegetable Fried Rice, Fresh Bread"
                            className="bg-white text-gray-900 border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-sm resize-none transition-all"
                            placeholder="Details about allergens, packaging, freshness, etc."
                        />
                    </div>

                    {/* Food Category (Veg/Non-Veg/Both) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Food Category
                        </label>
                        <div className="flex gap-2">
                            {[
                                { value: 'veg', label: 'Veg', emoji: '🟢', color: 'green' },
                                { value: 'non-veg', label: 'Non-Veg', emoji: '🔴', color: 'red' },
                                { value: 'both', label: 'Both', emoji: '🟠', color: 'orange' }
                            ].map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setFoodCategory(cat.value)}
                                    className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${foodCategory === cat.value
                                        ? cat.value === 'veg'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : cat.value === 'non-veg'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {cat.emoji} {cat.label}
                                </button>
                            ))}
                        </div>
                        <input type="hidden" name="foodCategory" value={foodCategory} />
                    </div>

                    {/* Food Type */}
                    <div>
                        <label htmlFor="foodType" className="block text-sm font-medium text-gray-700 mb-1">
                            Food Type
                        </label>
                        <select
                            id="foodType"
                            name="foodType"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 text-sm transition-all"
                        >
                            {foodTypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Section: Food Image */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Camera className="h-4 w-4 text-blue-600" />
                        Food Image
                    </h3>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => setImageType('upload')}
                            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition-all ${imageType === 'upload'
                                ? 'bg-green-100 text-green-700 font-medium'
                                : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            <Upload className="h-4 w-4" />
                            Upload
                        </button>
                        <button
                            type="button"
                            onClick={() => setImageType('url')}
                            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition-all ${imageType === 'url'
                                ? 'bg-green-100 text-green-700 font-medium'
                                : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            <LinkIcon className="h-4 w-4" />
                            URL
                        </button>
                    </div>

                    {imageType === 'upload' ? (
                        <Input
                            ref={fileInputRef}
                            id="imageFile"
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="bg-white text-gray-900 border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-medium hover:file:bg-green-100"
                        />
                    ) : (
                        <Input
                            id="imageUrl"
                            name="imageUrl"
                            placeholder="https://..."
                            className="bg-white text-gray-900 border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    )}

                    {preview && imageType === 'upload' && (
                        <div className="mt-3 h-32 w-32 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                    )}
                </div>
            </div>

            {/* Section: Quantity & Meals */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Package className="h-4 w-4 text-purple-600" />
                        Quantity & Meals
                    </h3>
                </div>
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Quantity Number */}
                        <div>
                            <label htmlFor="quantityNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity
                            </label>
                            <Input
                                type="number"
                                id="quantityNumber"
                                name="quantityNumber"
                                min="1"
                                value={quantityNumber}
                                onChange={(e) => setQuantityNumber(parseInt(e.target.value) || 1)}
                                className="bg-white text-gray-900 border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Quantity Unit */}
                        <div>
                            <label htmlFor="quantityUnit" className="block text-sm font-medium text-gray-700 mb-1">
                                Unit Type
                            </label>
                            <select
                                id="quantityUnit"
                                name="quantityUnit"
                                value={quantityUnit}
                                onChange={(e) => setQuantityUnit(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 text-sm transition-all"
                            >
                                {quantityUnitOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.icon} {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Item Name for Half/Full */}
                    {(quantityUnit === 'half' || quantityUnit === 'full') && (
                        <div className="animate-fade-in">
                            <label htmlFor="quantityItemName" className="block text-sm font-medium text-gray-700 mb-1">
                                Item Name <span className="text-gray-400">(e.g., Rice, Biryani, Dal)</span>
                            </label>
                            <Input
                                id="quantityItemName"
                                name="quantityItemName"
                                value={quantityItemName}
                                onChange={(e) => setQuantityItemName(e.target.value)}
                                placeholder="What food is this?"
                                className="bg-white text-gray-900 border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Custom Unit */}
                    {quantityUnit === 'custom' && (
                        <div className="animate-fade-in">
                            <label htmlFor="customUnit" className="block text-sm font-medium text-gray-700 mb-1">
                                Custom Unit Description
                            </label>
                            <Input
                                id="customUnit"
                                name="customUnit"
                                value={customUnit}
                                onChange={(e) => setCustomUnit(e.target.value)}
                                placeholder="e.g., Boxes, Containers, Portions"
                                className="bg-white text-gray-900 border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Estimated Meals Display */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Estimated Meals</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {quantityNumber} {quantityUnit} × {quantityUnit === 'kg' ? '3' : quantityUnit === 'full' ? '2' : '1'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-green-600">{calculateMeals()}</p>
                                <p className="text-xs text-green-600 font-medium">🍽️ meals</p>
                            </div>
                        </div>
                    </div>
                    <input type="hidden" name="estimatedMeals" value={calculateMeals()} />
                </div>
            </div>

            {/* Section: Schedule */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        Schedule
                    </h3>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="h-3.5 w-3.5 inline mr-1" />
                                Expiry Date & Time
                            </label>
                            <Input
                                type="datetime-local"
                                id="expiryDate"
                                name="expiryDate"
                                required
                                className="bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                        </div>

                        <div>
                            <label htmlFor="pickupEnd" className="block text-sm font-medium text-gray-700 mb-1">
                                <Clock className="h-3.5 w-3.5 inline mr-1" />
                                Pickup Until
                            </label>
                            <Input
                                type="datetime-local"
                                id="pickupEnd"
                                name="pickupEnd"
                                required
                                className="bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Pickup Location */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="px-5 py-4 bg-gradient-to-r from-cyan-50 to-sky-50 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-cyan-600" />
                        Pickup Location
                    </h3>
                </div>
                <div className="p-5 space-y-3">
                    <div className="relative">
                        <Input
                            type="text"
                            value={locationAddress}
                            onChange={(e) => setLocationAddress(e.target.value)}
                            placeholder="Enter pickup address or use GPS"
                            className="bg-white text-gray-900 border-gray-300 placeholder-gray-400 pr-12 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={handleGetCurrentLocation}
                            disabled={gettingLocation}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Use current location"
                        >
                            {gettingLocation ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <MapPin className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    {locationCity && (
                        <p className="text-xs text-gray-500">📍 {locationCity}</p>
                    )}
                </div>
            </div>

            {/* Hidden fields for location data */}
            <input type="hidden" name="pickup_lat" value={locationLat || ''} />
            <input type="hidden" name="pickup_lng" value={locationLng || ''} />
            <input type="hidden" name="pickup_address" value={locationAddress || ''} />
            <input type="hidden" name="pickup_city" value={locationCity || ''} />
            <input type="hidden" name="address" value={locationAddress || ''} />

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end border-t border-gray-200 mt-6 md:static fixed bottom-0 left-0 right-0 bg-white p-4 md:p-0 md:bg-transparent z-10 shadow-up md:shadow-none">
                <Button
                    type="submit"
                    variant={null}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 transition-all hover:shadow-lg"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Posting...
                        </>
                    ) : (
                        '🍽️ Create Listing'
                    )}
                </Button>
            </div>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </form >
    )
}
