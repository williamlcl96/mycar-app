import { supabase } from '../lib/supabaseClient'

export interface Booking {
    id: string
    customer_id: string
    workshop_id: string
    vehicle_id: string | null
    vehicle_name: string
    vehicle_plate: string | null
    service_type: string
    services: string[]
    date: string
    time: string
    status: 'PENDING' | 'ACCEPTED' | 'QUOTED' | 'PAID' | 'REPAIRING' | 'READY' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
    total_amount: number | null
    quote_id: string | null
    created_at: string
    // Joined data
    workshop?: {
        id: string
        name: string
        image: string | null
        location: string
    }
    customer?: {
        id: string
        name: string
        email: string
    }
}

export const bookingService = {
    async getByCustomer(customerId: string): Promise<Booking[]> {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                workshop:workshops(id, name, image, location)
            `)
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getByWorkshop(workshopId: string): Promise<Booking[]> {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                customer:profiles!customer_id(id, name, email)
            `)
            .eq('workshop_id', workshopId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getById(id: string): Promise<Booking | null> {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                workshop:workshops(id, name, image, location),
                customer:profiles!customer_id(id, name, email)
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    async create(booking: Omit<Booking, 'id' | 'created_at' | 'workshop' | 'customer'> & { id?: string }): Promise<Booking> {
        const { data, error } = await supabase
            .from('bookings')
            .insert(booking)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateStatus(id: string, status: Booking['status'], additionalUpdates?: Partial<Booking>): Promise<Booking> {
        const { data, error } = await supabase
            .from('bookings')
            .update({ status, ...additionalUpdates })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async linkQuote(bookingId: string, quoteId: string): Promise<void> {
        const { error } = await supabase
            .from('bookings')
            .update({ quote_id: quoteId, status: 'QUOTED' })
            .eq('id', bookingId)

        if (error) throw error
    }
}
