import { supabase } from '../lib/supabaseClient'

export interface Workshop {
    id: string
    owner_id: string
    name: string
    rating: number
    reviews_count: number
    location: string
    address: string
    image: string | null
    specialties: string[]
    lat: number
    lng: number
    is_verified: boolean
    experience: string
    response_time: string
    completed_jobs: string
    business_hours: {
        open: string
        close: string
        closed_days: string[]
    }
    services: {
        name: string;
        category: string;
        price: string;
        icon: string;
        description?: string;
        trending?: boolean;
    }[]
    status: 'ACTIVE' | 'INACTIVE'
    created_at: string
}

export const workshopService = {
    async getAll(): Promise<Workshop[]> {
        const { data, error } = await supabase
            .from('workshops')
            .select('*')
            .eq('status', 'ACTIVE')
            .order('rating', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getById(id: string): Promise<Workshop | null> {
        const { data, error } = await supabase
            .from('workshops')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (error) {
            console.warn("getById error:", error.message)
            return null
        }
        return data
    },

    async getByOwner(ownerId: string): Promise<Workshop | null> {
        const { data, error } = await supabase
            .from('workshops')
            .select('*')
            .eq('owner_id', ownerId)
            .limit(1)

        if (error) {
            console.warn("getByOwner error:", error.message)
            return null
        }
        return data && data.length > 0 ? data[0] : null
    },

    async create(workshop: Omit<Workshop, 'id' | 'created_at' | 'rating' | 'reviews_count'>): Promise<Workshop> {
        const { data, error } = await supabase
            .from('workshops')
            .insert(workshop)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async update(id: string, updates: Partial<Workshop>): Promise<Workshop> {
        const { data, error } = await supabase
            .from('workshops')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async search(query: string): Promise<Workshop[]> {
        const { data, error } = await supabase
            .from('workshops')
            .select('*')
            .eq('status', 'ACTIVE')
            .or(`name.ilike.%${query}%,location.ilike.%${query}%,specialties.cs.{${query}}`)
            .order('rating', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getNearby(lat: number, lng: number, radiusKm: number = 10): Promise<Workshop[]> {
        // Using simple bounding box for now - could use PostGIS for better accuracy
        const latDelta = radiusKm / 111 // ~111km per degree lat
        const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))

        const { data, error } = await supabase
            .from('workshops')
            .select('*')
            .eq('status', 'ACTIVE')
            .gte('lat', lat - latDelta)
            .lte('lat', lat + latDelta)
            .gte('lng', lng - lngDelta)
            .lte('lng', lng + lngDelta)
            .order('rating', { ascending: false })

        if (error) throw error
        return data || []
    }
}
