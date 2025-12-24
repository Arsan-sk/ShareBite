'use client'

import { PriorityInfo } from '@/utils/priority'

interface PriorityBadgeProps {
    priorityInfo: PriorityInfo
    priorityScore: number
    size?: 'sm' | 'md'
}

export function PriorityBadge({ priorityInfo, priorityScore, size = 'sm' }: PriorityBadgeProps) {
    if (!priorityInfo.showBadge) return null

    const sizeClasses = size === 'sm'
        ? 'text-xs px-2 py-0.5'
        : 'text-sm px-2.5 py-1'

    return (
        <span
            className={`
                inline-flex items-center gap-1 rounded-full font-medium
                ${priorityInfo.bgColor} ${priorityInfo.color}
                ${sizeClasses}
                ${priorityInfo.band === 'critical' ? 'animate-pulse' : ''}
            `}
        >
            {priorityInfo.label}
        </span>
    )
}

interface ExpiryBadgeProps {
    expiryDate: string
    className?: string
}

export function ExpiryBadge({ expiryDate, className = '' }: ExpiryBadgeProps) {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const hoursLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)

    let text: string
    let colorClass: string

    if (hoursLeft <= 0) {
        text = 'Expired'
        colorClass = 'text-red-600 bg-red-50'
    } else if (hoursLeft < 1) {
        text = `${Math.round(hoursLeft * 60)} min left`
        colorClass = 'text-red-600 bg-red-50'
    } else if (hoursLeft < 6) {
        text = `${Math.round(hoursLeft)} hrs left`
        colorClass = 'text-orange-600 bg-orange-50'
    } else if (hoursLeft < 24) {
        text = `${Math.round(hoursLeft)} hrs left`
        colorClass = 'text-yellow-600 bg-yellow-50'
    } else {
        text = `${Math.round(hoursLeft / 24)} days left`
        colorClass = 'text-green-600 bg-green-50'
    }

    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass} ${className}`}>
            ⏰ {text}
        </span>
    )
}

interface DistanceBadgeProps {
    distanceKm: number | null
    className?: string
}

export function DistanceBadge({ distanceKm, className = '' }: DistanceBadgeProps) {
    if (distanceKm === null) return null

    let text: string
    if (distanceKm < 1) {
        text = `${Math.round(distanceKm * 1000)}m away`
    } else {
        text = `${distanceKm.toFixed(1)} km away`
    }

    return (
        <span className={`text-xs text-gray-500 ${className}`}>
            📍 {text}
        </span>
    )
}
