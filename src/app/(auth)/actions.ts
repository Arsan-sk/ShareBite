'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { type Provider } from '@supabase/supabase-js'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Check if it's social login
    const provider = formData.get('provider') as Provider
    if (provider) {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
            },
        })

        if (error) {
            return redirect('/login?message=Could not authenticate user')
        }

        return redirect(data.url)
    }

    // Email/Password Login
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/feed', 'layout')
    redirect('/feed')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const roleRaw = formData.get('role') as string || 'resident'
    // Enforce lowercase and valid enum values
    const validRoles = ['resident', 'restaurant', 'ngo', 'volunteer', 'admin']
    let role = roleRaw.toLowerCase()

    if (!validRoles.includes(role)) {
        role = 'resident'
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: role,
            },
        },
    })

    // We should create a profile entry here if the trigger fails or for robust handling, 
    // but the 'on_auth_user_created' trigger handles it. 
    // Ideally, we force the role update here if needed.

    if (error) {
        return redirect(`/signup?message=${encodeURIComponent(error.message)}`)
    }

    // If email confirmation is required (default), user is created but cant login yet
    if (data?.user && !data.user.identities?.length) {
        return redirect('/signup?message=User already registered')
    }

    revalidatePath('/feed', 'layout')
    redirect('/login?message=Check email to continue sign in process')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/login')
}
