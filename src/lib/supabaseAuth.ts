import { supabase } from './supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

export interface UserProfile {
    id: string
    email: string
    name: string
    phone: string | null
    role: 'customer' | 'owner'
    avatar_url: string | null
    workshop_id: string | null
    created_at: string
}

export interface AuthState {
    user: User | null
    profile: UserProfile | null
    session: Session | null
    loading: boolean
}

export const supabaseAuth = {
    async signUp(email: string, password: string, name: string, role: 'customer' | 'owner' = 'customer', phone?: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role,
                    phone: phone || null
                }
            }
        })

        if (error) throw error

        // Also update the profile directly with phone if user was created
        if (data.user && phone) {
            try {
                await supabase
                    .from('profiles')
                    .update({ phone })
                    .eq('id', data.user.id)
            } catch (e) {
                console.warn('Could not update profile with phone:', e)
            }
        }

        return data
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw error
        return data
    },

    async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    async getSession() {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        return data.session
    },

    async getUser() {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        return data.user
    },

    async getProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .limit(1)

        if (error) {
            console.warn("getProfile error:", error.message)
            return null
        }
        return data && data.length > 0 ? data[0] : null
    },

    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        return supabase.auth.onAuthStateChange(callback)
    },

    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        })
        if (error) throw error
    },

    async updatePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        })
        if (error) throw error
    }
}
