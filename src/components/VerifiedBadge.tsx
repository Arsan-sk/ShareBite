export function VerifiedBadge({ className = "" }: { className?: string }) {
    return (
        <svg
            className={`inline-block w-4 h-4 ${className}`}
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Verified"
        >
            <circle cx="9" cy="9" r="9" fill="#10B981" />
            <path
                d="M6 9L8 11L12 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
