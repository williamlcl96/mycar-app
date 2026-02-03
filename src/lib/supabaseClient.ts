import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if credentials are valid (not placeholders)
const isConfigured = supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('YOUR_PROJECT') &&
    !supabaseAnonKey.includes('YOUR_')

let supabase: SupabaseClient

if (isConfigured) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
    // Create a dummy client that won't be used
    console.warn('⚠️ Supabase not configured. Using localStorage mode.')
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export { supabase }

// Database types generated from schema
export type Tables = {
    profiles: {
        Row: {
            id: string
            email: string
            name: string
            phone: string | null
            role: 'customer' | 'owner'
            avatar_url: string | null
            workshop_id: string | null
            created_at: string
        }
        Insert: Omit<Tables['profiles']['Row'], 'created_at'>
        Update: Partial<Tables['profiles']['Insert']>
    }
    workshops: {
        Row: {
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
            status: 'ACTIVE' | 'INACTIVE'
            created_at: string
        }
        Insert: Omit<Tables['workshops']['Row'], 'id' | 'created_at' | 'rating' | 'reviews_count'>
        Update: Partial<Tables['workshops']['Insert']>
    }
    vehicles: {
        Row: {
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
        Insert: Omit<Tables['vehicles']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['vehicles']['Insert']>
    }
    bookings: {
        Row: {
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
        }
        Insert: Omit<Tables['bookings']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['bookings']['Insert']>
    }
    quotes: {
        Row: {
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
        Insert: Omit<Tables['quotes']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['quotes']['Insert']>
    }
    reviews: {
        Row: {
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
        Insert: Omit<Tables['reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['reviews']['Insert']>
    }
    refunds: {
        Row: {
            id: string
            booking_id: string
            workshop_id: string
            user_id: string
            amount: number
            reason: string
            description: string
            evidence: string | null
            status: 'Requested' | 'Under Review' | 'Shop Responded' | 'Approved' | 'Rejected' | 'Completed'
            timeline: { status: string; label: string; timestamp: string; description?: string }[]
            comments: { id: string; author_role: string; text: string; timestamp: string }[]
            created_at: string
        }
        Insert: Omit<Tables['refunds']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['refunds']['Insert']>
    }
    messages: {
        Row: {
            id: string
            conversation_id: string
            sender_id: string
            sender_role: 'customer' | 'owner'
            content: string
            created_at: string
        }
        Insert: Omit<Tables['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['messages']['Insert']>
    }
    conversations: {
        Row: {
            id: string
            customer_id: string
            workshop_id: string
            booking_id: string | null
            last_message: string | null
            last_message_at: string | null
            created_at: string
        }
        Insert: Omit<Tables['conversations']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['conversations']['Insert']>
    }
}
