import { supabase } from '../lib/supabaseClient'

export interface Review {
    id: string
    user_id: string
    user_name: string
    workshop_id: string
    booking_id: string
    rating: number
    pricing_rating: number
    attitude_rating: number
    professional_rating: number
    comment: string
    reply: string | null
    replied_at: string | null
    created_at: string
}

export const reviewService = {
    async getByWorkshop(workshopId: string): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('workshop_id', workshopId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getByUser(userId: string): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async create(review: Omit<Review, 'id' | 'created_at' | 'reply' | 'replied_at'> & { id?: string }): Promise<Review> {
        const { data, error } = await supabase
            .from('reviews')
            .insert(review)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async addReply(id: string, reply: string): Promise<Review> {
        const { data, error } = await supabase
            .from('reviews')
            .update({
                reply,
                replied_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }
}
