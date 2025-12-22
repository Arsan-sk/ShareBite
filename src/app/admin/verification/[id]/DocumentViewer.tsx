'use client'

import { useState } from 'react'

export function DocumentViewer({ documentUrl }: { documentUrl: string }) {
    const [imageError, setImageError] = useState(false)

    if (imageError) {
        return (
            <div className="text-center p-8 bg-white rounded-lg border border-gray-300">
                <p className="text-gray-500 mb-3">Unable to preview document</p>
                <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                >
                    Open Document →
                </a>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col">
            <img
                src={documentUrl}
                alt="Verification Document"
                className="max-w-full max-h-[450px] object-contain mx-auto rounded-lg shadow-md bg-white"
                onError={() => setImageError(true)}
            />
            <div className="mt-4 text-center">
                <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in New Tab
                </a>
            </div>
        </div>
    )
}
