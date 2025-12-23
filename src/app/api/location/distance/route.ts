import { NextRequest, NextResponse } from 'next/server'
import { getDistanceAndTime } from '@/utils/location'

export async function POST(request: NextRequest) {
    try {
        const { from, to } = await request.json()

        if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) {
            return NextResponse.json({ error: 'Valid from and to coordinates required' }, { status: 400 })
        }

        const result = await getDistanceAndTime(from, to)

        return NextResponse.json(result)
    } catch (error) {
        console.error('Distance API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
