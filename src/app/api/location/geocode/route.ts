import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress } from '@/utils/location'

export async function POST(request: NextRequest) {
    try {
        const { address } = await request.json()

        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 })
        }

        const location = await geocodeAddress(address)

        if (!location) {
            return NextResponse.json({ error: 'Could not geocode address' }, { status: 404 })
        }

        return NextResponse.json({
            lat: location.lat,
            lng: location.lng,
            formattedAddress: location.address,
            city: location.city
        })
    } catch (error) {
        console.error('Geocode API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
