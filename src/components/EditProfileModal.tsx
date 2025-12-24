'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { X, Camera, MapPin, Loader2, Link as LinkIcon, Upload } from 'lucide-react'
import { reverseGeocode } from '@/utils/location'

interface EditProfileModalProps {
    isOpen: boolean
    onClose: () => void
    profile: any
    onSave: () => void
}

export function EditProfileModal({ isOpen, onClose, profile, onSave }: EditProfileModalProps) {
    const [displayName, setDisplayName] = useState(profile.display_name || '')
    const [bio, setBio] = useState(profile.bio || '')
    const [phoneNumber, setPhoneNumber] = useState(profile.phone_number || '')
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
    const [locationAddress, setLocationAddress] = useState(profile.location_address || '')
    const [locationLat, setLocationLat] = useState(profile.location_lat || null)
    const [locationLng, setLocationLng] = useState(profile.location_lng || null)
    const [locationCity, setLocationCity] = useState(profile.location_city || '')

    const [saving, setSaving] = useState(false)
    const [gettingLocation, setGettingLocation] = useState(false)
    const [showAvatarOptions, setShowAvatarOptions] = useState(false)
    const [avatarMode, setAvatarMode] = useState<'url' | 'upload' | null>(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

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

                // Reverse geocode to get address
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

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingAvatar(true)
        try {
            // Upload to Supabase storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${profile.id}-${Date.now()}.${fileExt}`

            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true })

            if (error) throw error

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            setAvatarUrl(publicUrl)
            setShowAvatarOptions(false)
            setAvatarMode(null)
        } catch (err: any) {
            console.error('Upload error:', err)
            alert('Failed to upload image: ' + err.message)
        } finally {
            setUploadingAvatar(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName || null,
                    bio: bio || null,
                    phone_number: phoneNumber || null,
                    avatar_url: avatarUrl || null,
                    location_address: locationAddress || null,
                    location_lat: locationLat,
                    location_lng: locationLng,
                    location_city: locationCity || null,
                })
                .eq('id', profile.id)

            if (error) throw error

            onSave()
            onClose()
        } catch (err: any) {
            console.error('Save error:', err)
            alert('Failed to save: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div
                                onClick={() => setShowAvatarOptions(!showAvatarOptions)}
                                className="h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden cursor-pointer ring-4 ring-white shadow-lg group-hover:ring-green-200 transition-all"
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white">
                                        {displayName?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-green-600 rounded-full p-2 shadow-lg cursor-pointer hover:bg-green-700 transition-colors">
                                <Camera className="h-4 w-4 text-white" />
                            </div>
                        </div>

                        {/* Avatar Options */}
                        {showAvatarOptions && (
                            <div className="mt-4 bg-gray-50 rounded-xl p-4 w-full animate-fade-in">
                                <p className="text-sm font-medium text-gray-700 mb-3 text-center">Change Profile Photo</p>
                                <div className="flex gap-2 justify-center">
                                    <Button
                                        variant={null}
                                        size="sm"
                                        onClick={() => setAvatarMode('url')}
                                        className={`border px-3 transition-colors ${avatarMode === 'url'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <LinkIcon className="h-4 w-4 mr-1" />
                                        URL
                                    </Button>
                                    <Button
                                        variant={null}
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 px-3"
                                    >
                                        {uploadingAvatar ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                            <Upload className="h-4 w-4 mr-1" />
                                        )}
                                        Upload
                                    </Button>
                                </div>

                                {avatarMode === 'url' && (
                                    <div className="mt-3">
                                        <input
                                            type="url"
                                            placeholder="Paste image URL"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => { setShowAvatarOptions(false); setAvatarMode(null) }}
                                            className="mt-2 w-full bg-green-600 hover:bg-green-700"
                                        >
                                            Done
                                        </Button>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Display Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="How should we call you?"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us about yourself..."
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none text-gray-900"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+91 9876543210"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Saved Location</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={locationAddress}
                                    onChange={(e) => setLocationAddress(e.target.value)}
                                    placeholder="Your default pickup/delivery location"
                                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                                />
                                <button
                                    type="button"
                                    onClick={handleGetCurrentLocation}
                                    disabled={gettingLocation}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
                                <p className="mt-1 text-xs text-gray-500">📍 {locationCity}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            </div>

            {/* CSS */}
            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </div>
    )
}
