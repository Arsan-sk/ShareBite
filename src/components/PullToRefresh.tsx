'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface PullToRefreshProps {
    onRefresh: () => Promise<void>
    children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [pullDistance, setPullDistance] = useState(0)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [startY, setStartY] = useState(0)

    const threshold = 80 // Pull distance needed to trigger refresh

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY === 0) {
                setStartY(e.touches[0].clientY)
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (window.scrollY === 0 && startY > 0) {
                const currentY = e.touches[0].clientY
                const distance = Math.max(0, currentY - startY)
                setPullDistance(Math.min(distance, threshold * 1.5))
            }
        }

        const handleTouchEnd = async () => {
            if (pullDistance >= threshold && !isRefreshing) {
                setIsRefreshing(true)
                await onRefresh()
                setIsRefreshing(false)
            }
            setPullDistance(0)
            setStartY(0)
        }

        document.addEventListener('touchstart', handleTouchStart)
        document.addEventListener('touchmove', handleTouchMove)
        document.addEventListener('touchend', handleTouchEnd)

        return () => {
            document.removeEventListener('touchstart', handleTouchStart)
            document.removeEventListener('touchmove', handleTouchMove)
            document.removeEventListener('touchend', handleTouchEnd)
        }
    }, [startY, pullDistance, isRefreshing, onRefresh])

    return (
        <div className="relative">
            {/* Pull indicator */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{
                    opacity: pullDistance > 0 ? 1 : 0,
                    y: pullDistance > 0 ? pullDistance / 2 : -50,
                }}
                className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
            >
                <div className="bg-white rounded-full p-3 shadow-lg">
                    <motion.div
                        animate={{ rotate: isRefreshing ? 360 : 0 }}
                        transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
                    >
                        <svg
                            className="h-6 w-6 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </motion.div>
                </div>
            </motion.div>

            {/* Content */}
            <motion.div
                animate={{ y: pullDistance > 0 ? pullDistance / 3 : 0 }}
                transition={{ type: 'spring', damping: 20 }}
            >
                {children}
            </motion.div>
        </div>
    )
}
