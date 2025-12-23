import { MapPin } from 'lucide-react'

interface DistanceDisplayProps {
    distance: number // in km
    city?: string
    className?: string
}

export function DistanceDisplay({ distance, city, className = '' }: DistanceDisplayProps) {
    const formatDistance = (km: number): string => {
        if (km < 0.1) return '< 100m'
        if (km < 1) return `${(km * 1000).toFixed(0)}m`
        return `${km.toFixed(1)} km`
    }

    return (
        <p className={`text-xs text-gray-500 flex items-center gap-1 ${className}`}>
            <MapPin className="h-3 w-3" />
            {city && `${city}`}
            {distance > 0 && ` · ${formatDistance(distance)} away`}
        </p>
    )
}
