import { supabase } from '../lib/supabaseClient'

export interface Quote {
    id: string
    booking_id: string
    workshop_id: string
    items: { name: string; price: number }[]
    labor: number
    tax: number
    total: number
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    diagnosis: { type: string; title: string; desc: string; img: string }[] | null
    note: string | null
    created_at: string
}

export const quoteService = {
    async getById(id: string): Promise<Quote | null> {
        const { data, error } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    async getByBooking(bookingId: string): Promise<Quote | null> {
        const { data, error } = await supabase
            .from('quotes')
            .select('*')
            .eq('booking_id', bookingId)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data
    },

    async getByWorkshop(workshopId: string): Promise<Quote[]> {
        const { data, error } = await supabase
            .from('quotes')
            .select('*')
            .eq('workshop_id', workshopId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async create(quote: Omit<Quote, 'id' | 'created_at'> & { id?: string }): Promise<Quote> {
        const { data, error } = await supabase
            .from('quotes')
            .insert(quote)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateStatus(id: string, status: Quote['status']): Promise<Quote> {
        const { data, error } = await supabase
            .from('quotes')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('quotes')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
