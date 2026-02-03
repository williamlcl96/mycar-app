import { supabase } from '../lib/supabaseClient'

export interface Vehicle {
    id: string
    user_id: string
    name: string
    plate: string
    image: string | null
    brand: string
    model: string
    year: string
    capacity: string
    is_primary: boolean
    created_at: string
}

export const vehicleService = {
    async getAll(userId: string): Promise<Vehicle[]> {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getById(id: string): Promise<Vehicle | null> {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    async getPrimary(userId: string): Promise<Vehicle | null> {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('user_id', userId)
            .eq('is_primary', true)
            .single()

        if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
        return data
    },

    async create(vehicle: Omit<Vehicle, 'id' | 'created_at'> & { id?: string }): Promise<Vehicle> {
        // If setting as primary, unset other primaries first
        if (vehicle.is_primary) {
            await supabase
                .from('vehicles')
                .update({ is_primary: false })
                .eq('user_id', vehicle.user_id)
        }

        const { data, error } = await supabase
            .from('vehicles')
            .insert(vehicle)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async update(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
        const { data, error } = await supabase
            .from('vehicles')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async setPrimary(id: string, userId: string): Promise<void> {
        // Unset all primaries for user
        await supabase
            .from('vehicles')
            .update({ is_primary: false })
            .eq('user_id', userId)

        // Set new primary
        const { error } = await supabase
            .from('vehicles')
            .update({ is_primary: true })
            .eq('id', id)

        if (error) throw error
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
