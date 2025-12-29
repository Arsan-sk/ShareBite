'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface ReelFeedContainerProps {
    children: React.ReactNode
}

export function ReelFeedContainer({ children }: ReelFeedContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.getAttribute('data-index') || '0')
                        setActiveIndex(index)
                    }
                })
            },
            {
                root: container,
                threshold: 0.75, // Card is considered active when 75% visible
            }
        )

        const cards = container.querySelectorAll('[data-reel-card]')
        cards.forEach((card) => observer.observe(card))

        return () => observer.disconnect()
    }, [children])

    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
            style={{
                scrollPaddingTop: '0',
                scrollPaddingBottom: '0',
            }}
        >
            {children}
        </div>
    )
}
