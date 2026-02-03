import { supabase } from '../lib/supabaseClient'

export interface Notification {
    id: string
    user_id: string
    role: 'customer' | 'owner'
    type: 'info' | 'success' | 'warning' | 'booking' | 'quote' | 'payment' | 'review' | 'refund' | 'message'
    title: string
    message: string
    link: string | null
    is_read: boolean
    created_at: string
}

export const notificationService = {
    async getByUser(userId: string, role: 'customer' | 'owner'): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('role', role)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getUnreadCount(userId: string, role: 'customer' | 'owner'): Promise<number> {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('role', role)
            .eq('is_read', false)

        if (error) throw error
        return count || 0
    },

    async create(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification> {
        const { data, error } = await supabase
            .from('notifications')
            .insert({ ...notification, is_read: false })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async markAsRead(id: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (error) throw error
    },

    async markAllAsRead(userId: string, role: 'customer' | 'owner'): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('role', role)

        if (error) throw error
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    async clearAll(userId: string, role: 'customer' | 'owner'): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', userId)
            .eq('role', role)

        if (error) throw error
    },

    subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
        return supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => callback(payload.new as Notification)
            )
            .subscribe()
    }
}
