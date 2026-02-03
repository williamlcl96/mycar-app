import { supabase } from '../lib/supabaseClient'

export interface Message {
    id: string
    conversation_id: string
    sender_id: string
    sender_role: 'customer' | 'owner'
    content: string
    created_at: string
}

export interface Conversation {
    id: string
    customer_id: string
    workshop_id: string
    booking_id: string | null
    last_message: string | null
    last_message_at: string | null
    created_at: string
    // Joined data
    workshop?: { id: string; name: string; image: string | null }
    customer?: { id: string; name: string }
    messages?: Message[]
}

export const messageService = {
    async getConversations(userId: string, role: 'customer' | 'owner'): Promise<Conversation[]> {

        let query = supabase
            .from('conversations')
            .select(`
                *,
                workshop:workshops(id, name, image),
                customer:profiles!customer_id(id, name)
            `)
            .order('last_message_at', { ascending: false, nullsFirst: false })

        if (role === 'customer') {
            query = query.eq('customer_id', userId)
        } else {
            // For owners, we need to find conversations where their workshop is involved
            query = query.eq('workshop_id', userId) // This assumes userId is workshop_id for owner context
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    async getConversationsByWorkshop(workshopId: string): Promise<Conversation[]> {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                customer:profiles!customer_id(id, name)
            `)
            .eq('workshop_id', workshopId)
            .order('last_message_at', { ascending: false, nullsFirst: false })

        if (error) throw error
        return data || []
    },

    async getOrCreateConversation(customerId: string, workshopId: string, bookingId?: string): Promise<Conversation> {
        // Try to find existing conversation
        const { data: existing, error: findError } = await supabase
            .from('conversations')
            .select('*')
            .eq('customer_id', customerId)
            .eq('workshop_id', workshopId)
            .maybeSingle()

        if (findError) {
            console.warn("Conversation lookup error:", findError.message)
        }

        if (existing) return existing

        // Create new conversation
        const { data, error } = await supabase
            .from('conversations')
            .insert({
                customer_id: customerId,
                workshop_id: workshopId,
                booking_id: bookingId || null
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async getMessages(conversationId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data || []
    },

    async sendMessage(conversationId: string, senderId: string, senderRole: 'customer' | 'owner', content: string): Promise<Message> {
        // Insert message
        const { data: message, error: msgError } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                sender_role: senderRole,
                content
            })
            .select()
            .single()

        if (msgError) throw msgError

        // Update conversation with last message
        await supabase
            .from('conversations')
            .update({
                last_message: content,
                last_message_at: new Date().toISOString()
            })
            .eq('id', conversationId)

        return message
    },

    subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
        return supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => callback(payload.new as Message)
            )
            .subscribe()
    },

    async deleteConversation(id: string): Promise<void> {
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('id', id)
        if (error) throw error
    },

    async deleteMessage(id: string): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', id)
        if (error) throw error
    }
}
