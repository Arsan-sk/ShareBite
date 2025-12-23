'use client'

import { useState, useEffect } from 'react'
import { MapPin, Target, Home, Loader2 } from 'lucide-react'
import { Button } from './ui/button'

interface LocationPickerProps {
    savedLocation?: { lat: number; lng: number; address: string; city?: string } | null
    onLocationSelect: (location: { lat: number; lng: number; address: string; city?: string }) => void
    defaultValue?: { lat: number; lng: number; address: string; city?: string }
}

export function LocationPicker({ savedLocation, onLocationSelect, defaultValue }: LocationPickerProps) {
    const [mode, setMode] = useState<'current' | 'saved' | 'manual'>('saved')
    const [manualAddress, setManualAddress] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<string>('')

    // Auto-select saved location on mount if available
    useEffect(() => {
        if (savedLocation && !defaultValue) {
            setMode('saved')
            setSelectedLocation(savedLocation.address)
            onLocationSelect(savedLocation)
        } else if (defaultValue) {
            setManualAddress(defaultValue.address)
            setSelectedLocation(defaultValue.address)
            onLocationSelect(defaultValue)
        }
    }, [])

    const handleCurrentLocation = () => {
        setLoading(true)
        setMode('current')

        if (!navigator.geolocation) {
            alert('Location not supported by your browser')
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords

                // Reverse geocode to get address
                try {
                    const url = `/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`
                    const res = await fetch(url)
                    const data = await res.json()

                    const location = {
                        lat: latitude,
                        lng: longitude,
                        address: data.address || `${latitude}, ${longitude}`,
                        city: data.city
                    }
                    setSelectedLocation(location.address)
                    onLocationSelect(location)
                } catch (err) {
                    const location = {
                        lat: latitude,
                        lng: longitude,
                        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    }
                    setSelectedLocation(location.address)
                    onLocationSelect(location)
                }
                setLoading(false)
            },
            (error) => {
                alert('Unable to get location: ' + error.message)
                setLoading(false)
            }
        )
    }

    const handleSavedLocation = () => {
        if (savedLocation) {
            setMode('saved')
            setSelectedLocation(savedLocation.address)
            onLocationSelect(savedLocation)
        }
    }

    const handleManualSubmit = async () => {
        if (!manualAddress.trim()) return

        setLoading(true)
        try {
            const url = `/api/location/geocode`
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: manualAddress })
            })
            const data = await res.json()

            console.log('Geocode response:', data)

            if (data.lat && data.lng) {
                const location = {
                    lat: data.lat,
                    lng: data.lng,
                    address: data.formattedAddress || manualAddress,
                    city: data.city
                }
                console.log('Setting location:', location)
                setSelectedLocation(location.address)
                onLocationSelect(location)
            } else {
                alert('Could not find location. Please try a different address.')
            }
        } catch (err) {
            console.error('Geocoding error:', err)
            alert('Error geocoding address')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Pickup Location *</label>

            {/* Better Button Styling */}
            <div className="flex gap-2 flex-wrap">
                <button
                    type="button"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'current'
                        ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                    onClick={handleCurrentLocation}
                    disabled={loading}
                >
                    {loading && mode === 'current' ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin inline" />
                            Getting...
                        </>
                    ) : (
                        <>
                            <Target className="h-4 w-4 mr-1.5 inline" />
                            Current Location
                        </>
                    )}
                </button>

                {savedLocation && (
                    <button
                        type="button"
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'saved'
                            ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                            }`}
                        onClick={handleSavedLocation}
                    >
                        <Home className="h-4 w-4 mr-1.5 inline" />
                        Saved Location
                    </button>
                )}

                <button
                    type="button"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'manual'
                        ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                    onClick={() => setMode('manual')}
                >
                    <MapPin className="h-4 w-4 mr-1.5 inline" />
                    Enter Address
                </button>
            </div>

            {/* Manual Address Input - Always visible when selected */}
            {mode === 'manual' && (
                <div className="flex gap-2 mt-2">
                    <input
                        type="text"
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleManualSubmit()
                            }
                        }}
                        placeholder="Enter full pickup address (e.g., Shop 5, Market Road, Panvel, Navi Mumbai)"
                        className="flex-1 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 text-sm text-gray-900 placeholder-gray-400"
                    />
                    <Button
                        type="button"
                        onClick={handleManualSubmit}
                        disabled={loading || !manualAddress.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set'}
                    </Button>
                </div>
            )}

            {/* Selected Location Display - Green success box */}
            {selectedLocation && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-900">
                        <span className="font-semibold">✓ Location Set:</span> {selectedLocation}
                    </p>
                </div>
            )}
        </div>
    )
}
