'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveRequest(requestId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // RPC defined in schema_phase6_admin.sql
    const { error } = await supabase.rpc('approve_verification', {
        p_request_id: requestId,
        p_admin_id: user.id
    })

    if (error) {
        console.error('Approval failed:', error)
        return { error: 'Failed to approve request' }
    }

    revalidatePath('/admin/verification')
    return { success: true }
}

export async function rejectRequest(requestId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase.rpc('reject_verification', {
        p_request_id: requestId,
        p_admin_id: user.id,
        p_reason: reason
    })

    if (error) {
        console.error('Rejection failed:', error)
        return { error: 'Failed to reject request' }
    }

    revalidatePath('/admin/verification')
    return { success: true }
}
