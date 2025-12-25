'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error'

interface ToastProps {
    message: string
    type?: ToastType
    isVisible: boolean
    onClose: () => void
}

export function SimpleToast({ message, type = 'success', isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose()
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [isVisible, onClose])

    if (!isVisible) return null

    return (
        <div className={cn(
            "fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in",
            type === 'success' ? "bg-white border-green-100 text-gray-800" : "bg-white border-red-100 text-gray-800"
        )}>
            {type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
                <XCircle className="h-5 w-5 text-red-500" />
            )}
            <p className="text-sm font-medium">{message}</p>
            <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
