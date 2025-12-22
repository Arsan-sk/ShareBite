'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

// Since we might not have radix installed, let's create a pure Tailwind version for simplicity and speed (no npm install needed).
// Actually, user might not have Radix.
// Let's check package.json? No, let's build a simple custom Tabs component to be safe and dependency-free.

const TabsContext = React.createContext<{
    activeTab: string;
    setActiveTab: (value: string) => void;
}>({ activeTab: '', setActiveTab: () => { } });

export function Tabs({ defaultValue, children, className }: { defaultValue: string, children: React.ReactNode, className?: string }) {
    const [activeTab, setActiveTab] = React.useState(defaultValue)
    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    )
}

export function TabsList({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
            {children}
        </div>
    )
}

export function TabsTrigger({ value, children, className }: { value: string, children: React.ReactNode, className?: string }) {
    const { activeTab, setActiveTab } = React.useContext(TabsContext)
    const isActive = activeTab === value
    return (
        <button
            type="button"
            onClick={() => setActiveTab(value)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
            ${isActive ? 'bg-white text-gray-950 shadow-sm' : 'hover:bg-gray-200 hover:text-gray-700'} ${className}`}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, children, className }: { value: string, children: React.ReactNode, className?: string }) {
    const { activeTab } = React.useContext(TabsContext)
    if (activeTab !== value) return null
    return (
        <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>
            {children}
        </div>
    )
}
