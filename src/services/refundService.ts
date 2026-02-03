import { supabase } from '../lib/supabaseClient'

export type RefundStatus = 'Requested' | 'Under Review' | 'Shop Responded' | 'Approved' | 'Rejected' | 'Completed'

export interface RefundTimelineItem {
    status: RefundStatus
    label: string
    timestamp: string
    description?: string
}

export interface RefundComment {
    id: string
    author_role: 'user' | 'owner'
    text: string
    timestamp: string
}

export interface Refund {
    id: string
    booking_id: string
    workshop_id: string
    user_id: string
    amount: number
    reason: string
    description: string
    evidence: string | null
    status: RefundStatus
    timeline: RefundTimelineItem[]
    comments: RefundComment[]
    created_at: string
}

export const refundService = {
    async getByUser(userId: string): Promise<Refund[]> {
        const { data, error } = await supabase
            .from('refunds')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getByWorkshop(workshopId: string): Promise<Refund[]> {
        const { data, error } = await supabase
            .from('refunds')
            .select('*')
            .eq('workshop_id', workshopId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getById(id: string): Promise<Refund | null> {
        const { data, error } = await supabase
            .from('refunds')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    async create(refund: Omit<Refund, 'id' | 'created_at'> & { id?: string }): Promise<Refund> {
        const { data, error } = await supabase
            .from('refunds')
            .insert(refund)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateStatus(id: string, status: RefundStatus, description?: string): Promise<Refund> {
        // First get current refund to update timeline
        const current = await this.getById(id)
        if (!current) throw new Error('Refund not found')

        const newTimelineItem: RefundTimelineItem = {
            status,
            label: status,
            timestamp: new Date().toISOString(),
            description
        }

        const { data, error } = await supabase
            .from('refunds')
            .update({
                status,
                timeline: [...current.timeline, newTimelineItem]
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async addComment(id: string, authorRole: 'user' | 'owner', text: string): Promise<Refund> {
        const current = await this.getById(id)
        if (!current) throw new Error('Refund not found')

        const newComment: RefundComment = {
            id: crypto.randomUUID(),
            author_role: authorRole,
            text,
            timestamp: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('refunds')
            .update({
                comments: [...current.comments, newComment]
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }
}
