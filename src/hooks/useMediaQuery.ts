'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia(query)

        // Set initial value
        setMatches(media.matches)

        // Create listener
        const listener = (e: MediaQueryListEvent) => setMatches(e.matches)

        // Add listener
        media.addEventListener('change', listener)

        // Cleanup
        return () => media.removeEventListener('change', listener)
    }, [query])

    return matches
}

// Predefined breakpoint hooks
export function useIsMobile() {
    return useMediaQuery('(max-width: 767px)')
}

export function useIsTablet() {
    return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

export function useIsDesktop() {
    return useMediaQuery('(min-width: 1024px)')
}
