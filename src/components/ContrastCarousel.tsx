'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/utils/cn'

const images = [
    '/images/contrast.png',
    '/images/contrast2.png'
]

export function ContrastCarousel() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
        }, 5000) // Change image every 5 seconds (5000ms)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative w-full h-full">
            {images.map((src, index) => (
                <div
                    key={src}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                        index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                    <Image
                        src={src}
                        alt={`Contrast between scarcity and waste ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0} // Prioritize first image
                        quality={90}
                    />
                </div>
            ))}

            {/* Optional: Simple Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {images.map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all shadow-sm",
                            index === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                        )}
                    />
                ))}
            </div>
        </div>
    )
}
