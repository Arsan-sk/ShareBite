'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, UtensilsCrossed, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-900 font-sans p-4 text-center selection:bg-green-100 selection:text-green-900">

            {/* Animated Elements */}
            <div className="relative mb-8">
                {/* Background Circle */}
                <div className="absolute inset-0 bg-green-100 rounded-full scale-150 blur-3xl opacity-50 animate-pulse-slow"></div>

                {/* Main Icon */}
                <div className="relative z-10 bg-white p-6 rounded-full shadow-xl shadow-green-200 ring-1 ring-green-100 animate-bounce-slow">
                    <UtensilsCrossed className="w-24 h-24 text-green-600 opacity-80" strokeWidth={1.5} />
                </div>

                {/* Error Code */}
                <div className="absolute -top-4 -right-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12">
                    404
                </div>
            </div>

            {/* Text Content */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
                Oops! Plate Empty.
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                We looked everywhere—the kitchen, the pantry, even under the fridge—but we couldn&apos;t find that page.
            </p>

            {/* Interactive Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto">
                <Button asChild size="lg" className="rounded-xl bg-green-600 hover:bg-green-700 text-white h-12 shadow-lg shadow-green-200 transition-transform hover:scale-105">
                    <Link href="/">
                        <Home className="w-4 h-4 mr-2" />
                        Go Home
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl border-2 border-gray-200 text-gray-700 hover:border-green-600 hover:text-green-600 h-12 bg-white hover:bg-green-50 transition-all">
                    <button onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </button>
                </Button>
            </div>

            {/* Search Hint (Optional Interactive Element) */}
            <div className="mt-12 bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3 w-full max-w-md mx-auto opacity-75 hover:opacity-100 transition-opacity">
                <Search className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500 font-medium">Lost? Try searching for "fresh meals" or "volunteer"</span>
            </div>

            {/* Footer Branding */}
            <div className="mt-16 text-sm text-gray-400">
                ShareBite - Connecting Food to People.
            </div>
        </div>
    )
}
