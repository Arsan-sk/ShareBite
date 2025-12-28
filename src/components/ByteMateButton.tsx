'use client'

import { useState, useTransition } from 'react'
import { Button } from './ui/button'
import { UserPlus, UserCheck, Users } from 'lucide-react'
import { addByteMate, removeByteMate } from '@/app/(dashboard)/actions/bytemate-actions'

interface ByteMateButtonProps {
    targetUserId: string
    initialIsFollowing: boolean
    initialIsFollowedBy: boolean
    variant?: 'default' | 'compact'
}

export function ByteMateButton({
    targetUserId,
    initialIsFollowing,
    initialIsFollowedBy,
    variant = 'default'
}: ByteMateButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [isFollowedBy] = useState(initialIsFollowedBy)
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        startTransition(async () => {
            if (isFollowing) {
                const result = await removeByteMate(targetUserId)
                if (!result.error) {
                    setIsFollowing(false)
                }
            } else {
                const result = await addByteMate(targetUserId)
                if (!result.error) {
                    setIsFollowing(true)
                }
            }
        })
    }

    // Determine button text and style
    const getButtonContent = () => {
        if (isFollowing) {
            return {
                text: variant === 'compact' ? 'Following' : 'ByteMate',
                icon: <UserCheck className="h-4 w-4" />,
                className: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }
        } else if (isFollowedBy) {
            return {
                text: variant === 'compact' ? 'ByteBack' : 'ByteBack 🤝',
                icon: <Users className="h-4 w-4" />,
                className: 'bg-green-600 hover:bg-green-700 text-white'
            }
        } else {
            return {
                text: variant === 'compact' ? 'Add' : 'Add ByteMate',
                icon: <UserPlus className="h-4 w-4" />,
                className: 'bg-green-600 hover:bg-green-700 text-white'
            }
        }
    }

    const buttonContent = getButtonContent()

    if (variant === 'compact') {
        return (
            <Button
                onClick={handleToggle}
                disabled={isPending}
                size="sm"
                variant={null}
                className={`${buttonContent.className} transition-colors min-h-[44px]`}
            >
                {buttonContent.icon}
                <span className="ml-1.5">{buttonContent.text}</span>
            </Button>
        )
    }

    return (
        <Button
            onClick={handleToggle}
            disabled={isPending}
            variant={null}
            className={`${buttonContent.className} transition-colors font-medium min-h-[44px] md:min-h-[40px]`}
        >
            {buttonContent.icon}
            <span className="ml-2">{buttonContent.text}</span>
        </Button>
    )
}
