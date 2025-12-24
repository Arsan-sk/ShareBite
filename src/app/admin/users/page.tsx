import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { UserManagementClient } from './UserManagementClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    // Auth Check
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/')

    // Fetch all users except admins
    const supabaseAdmin = createAdminClient()
    const { data: users } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .neq('role', 'admin')
        .order('created_at', { ascending: false })

    return <UserManagementClient users={users || []} />
}
