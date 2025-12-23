import { NextRequest, NextResponse } from 'next/server'
import { reverseGeocode } from '@/utils/location'

export async function GET(request: NextRequest) {
    console.log('[reverse-geocode] Route called')
    try {
        const { searchParams } = new URL(request.url)
        const lat = parseFloat(searchParams.get('lat') || '')
        const lng = parseFloat(searchParams.get('lng') || '')

        console.log('[reverse-geocode] Params:', { lat, lng })

        if (isNaN(lat) || isNaN(lng)) {
            console.log('[reverse-geocode] Invalid params')
            return NextResponse.json({ error: 'Valid lat and lng required' }, { status: 400 })
        }

        console.log('[reverse-geocode] Calling reverseGeocode function')
        const result = await reverseGeocode(lat, lng)
        console.log('[reverse-geocode] Result:', result)

        if (!result) {
            console.log('[reverse-geocode] No result from reverseGeocode')
            return NextResponse.json({ error: 'Could not reverse geocode' }, { status: 404 })
        }

        return NextResponse.json({
            address: result.address,
            city: result.city
        })
    } catch (error) {
        console.error('[reverse-geocode] API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
