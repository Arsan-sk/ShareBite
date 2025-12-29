'use client'

import { motion } from 'framer-motion'
import { ListingCard } from './ListingCard'
import { useEffect, useState } from 'react'

interface ReelCardProps {
    listing: any
    index: number
}

export function ReelCard({ listing, index }: ReelCardProps) {
    const [isActive, setIsActive] = useState(false)

    return (
        <div
            data-reel-card
            data-index={index}
            className="snap-center snap-always h-full flex items-center justify-center px-4"
        >
            <motion.div
                initial={{ opacity: 0.9, scale: 0.95 }}
                animate={{
                    opacity: isActive ? 1 : 0.9,
                    scale: isActive ? 1 : 0.95,
                }}
                transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                }}
                className="w-full max-w-md"
            >
                <ListingCard listing={listing} />
            </motion.div>
        </div>
    )
}
