'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface BottomSheetProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
    title?: string
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Sheet */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-hidden"
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                    {children}
                </div>
            </motion.div>
        </>
    )
}
