'use client'

import { useState } from 'react'

interface UserRolePieChartProps {
    data: {
        role: string
        count: number
        color: string
    }[]
}

export function UserRolePieChart({ data }: UserRolePieChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    const total = data.reduce((sum, item) => sum + item.count, 0)

    // Calculate pie segments
    let currentAngle = 0
    const segments = data.map((item, index) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0
        const angle = (percentage / 100) * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + angle
        currentAngle = endAngle

        // Calculate path for pie segment
        const startRad = (startAngle - 90) * (Math.PI / 180)
        const endRad = (endAngle - 90) * (Math.PI / 180)

        const x1 = 50 + 40 * Math.cos(startRad)
        const y1 = 50 + 40 * Math.sin(startRad)
        const x2 = 50 + 40 * Math.cos(endRad)
        const y2 = 50 + 40 * Math.sin(endRad)

        const largeArc = angle > 180 ? 1 : 0

        const pathData = angle >= 360
            ? `M 50,10 A 40,40 0 1,1 49.99,10 Z`
            : `M 50,50 L ${x1},${y1} A 40,40 0 ${largeArc},1 ${x2},${y2} Z`

        return {
            ...item,
            percentage,
            pathData,
            index
        }
    })

    const roleLabels: Record<string, string> = {
        'resident': '🏠 Residents',
        'restaurant': '🍽️ Restaurants',
        'volunteer': '🤝 Volunteers',
        'ngo': '🏛️ NGOs'
    }

    return (
        <div className="flex flex-col items-center">
            {/* Pie Chart */}
            <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-0">
                    {segments.map((segment, index) => (
                        <path
                            key={index}
                            d={segment.pathData}
                            fill={segment.color}
                            className="transition-all duration-300 cursor-pointer origin-center"
                            style={{
                                transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                                transformOrigin: '50% 50%',
                                filter: hoveredIndex === index ? 'brightness(1.1) drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none'
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        />
                    ))}
                    {/* Center circle for donut effect */}
                    <circle cx="50" cy="50" r="20" fill="white" />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        {hoveredIndex !== null ? (
                            <>
                                <p className="text-2xl font-bold text-gray-900">{segments[hoveredIndex].count}</p>
                                <p className="text-xs text-gray-500">{segments[hoveredIndex].percentage.toFixed(0)}%</p>
                            </>
                        ) : (
                            <>
                                <p className="text-2xl font-bold text-gray-900">{total}</p>
                                <p className="text-xs text-gray-500">Total</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                {segments.map((segment, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${hoveredIndex === index ? 'bg-gray-100 scale-105' : 'hover:bg-gray-50'
                            }`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: segment.color }}
                        />
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">
                                {roleLabels[segment.role] || segment.role}
                            </p>
                            <p className="text-xs text-gray-500">
                                {segment.count} ({segment.percentage.toFixed(0)}%)
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
