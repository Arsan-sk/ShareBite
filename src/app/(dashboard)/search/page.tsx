'use client'

import { useState, useEffect } from 'react'
import { Search as SearchIcon, Users } from 'lucide-react'
import { searchUsers, getSuggestedUsers, UserSearchResult } from './actions'
import { UserSearchCard } from '@/components/UserSearchCard'
import { Input } from '@/components/ui/input'

export default function SearchPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<UserSearchResult[]>([])
    const [suggested, setSuggested] = useState<UserSearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // Load suggested users on mount
    useEffect(() => {
        getSuggestedUsers(10).then(setSuggested)
    }, [])

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }

        setIsSearching(true)
        const timer = setTimeout(() => {
            searchUsers(query).then(data => {
                setResults(data)
                setIsSearching(false)
            })
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const displayResults = query.trim() ? results : suggested
    const showSuggested = !query.trim() && suggested.length > 0

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Users</h1>
                <p className="text-gray-500">Find and connect with other ShareBite members</p>
            </div>

            {/* Search Input */}
            <div className="mb-8">
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search by name..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-green-400 focus:ring-green-400"
                    />
                </div>
                {isSearching && (
                    <p className="text-sm text-gray-500 mt-2">Searching...</p>
                )}
            </div>

            {/* Results Section */}
            <div>
                {showSuggested && (
                    <div className="mb-4 flex items-center gap-2 text-gray-600">
                        <Users className="h-5 w-5" />
                        <h2 className="text-lg font-semibold">Suggested for you</h2>
                    </div>
                )}

                {query.trim() && results.length === 0 && !isSearching && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No users found matching "{query}"</p>
                    </div>
                )}

                {displayResults.length > 0 && (
                    <div className="space-y-3">
                        {displayResults.map(user => (
                            <UserSearchCard key={user.id} user={user} />
                        ))}
                    </div>
                )}

                {!query.trim() && suggested.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Start typing to search for users</p>
                    </div>
                )}
            </div>
        </div>
    )
}
