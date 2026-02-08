import { useState, useEffect, createContext, useContext, type ReactNode, useMemo, useCallback } from "react"
import { messageDataProvider, USE_SUPABASE } from "./dataProvider"
import { useUser } from "../contexts/UserContext"
import { isUUID } from "./utils"

export type ContextType = 'consultation' | 'booking'

export interface ChatMessage {
    id: string
    senderRole: 'user' | 'workshop'
    senderId: string
    text: string
    createdAt: string
}

export interface Conversation {
    id: string
    contextType: ContextType
    userId: string
    userName?: string
    userAvatar?: string
    workshopId: string
    workshopName?: string
    bookingId?: string
    messages: ChatMessage[]
    updatedAt: string
    lastMessage?: string
}

interface ChatContextType {
    conversations: Conversation[]
    sendMessage: (conversationId: string, text: string, senderRole: 'user' | 'workshop', senderId: string) => Promise<void>
    deleteMessage: (conversationId: string, messageId: string) => void
    deleteConversation: (conversationId: string) => void
    getOrCreateConsultation: (userId: string, workshopId: string, userName?: string, workshopName?: string, userAvatar?: string) => Promise<string>
    getOrCreateBookingChat: (userId: string, workshopId: string, bookingId: string, userName?: string, workshopName?: string, userAvatar?: string) => Promise<string>
    getConversation: (id: string) => Conversation | undefined
    refreshConversations: () => Promise<void>
}

const STORAGE_KEY = 'mycar_chat_v2'

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const { user, role: activeRole } = useUser()

    // Load from localStorage/Supabase on mount or user change
    const refreshConversations = useCallback(async () => {
        if (USE_SUPABASE && user && isUUID(user.id)) {
            try {
                // Determine the correct ID to lookup conversations
                // Owners fetch by workshopId, customers by userId (profile id)
                const lookupId = (activeRole === 'owner' && user.workshopId) ? user.workshopId : user.id;

                const supabaseConversations = await messageDataProvider.getConversations(lookupId, activeRole === 'owner' ? 'owner' : 'customer')
                if (supabaseConversations) {
                    const mapped: Conversation[] = supabaseConversations.map(sc => ({
                        id: sc.id,
                        contextType: sc.booking_id ? 'booking' : 'consultation',
                        userId: sc.customer_id,
                        userName: sc.customer?.name,
                        workshopId: sc.workshop_id,
                        workshopName: sc.workshop?.name,
                        bookingId: sc.booking_id || undefined,
                        messages: (sc.messages || []).map(sm => ({
                            id: sm.id,
                            senderRole: sm.sender_role === 'owner' ? 'workshop' : 'user',
                            senderId: sm.sender_id,
                            text: sm.content,
                            createdAt: sm.created_at
                        })),
                        updatedAt: sc.last_message_at || sc.created_at,
                        lastMessage: sc.last_message || undefined
                    }))
                    setConversations(mapped)
                    return
                }
            } catch (error) {
                console.error("Failed to fetch conversations from Supabase:", error)
            }
        }

        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                setConversations(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse chat data", e)
            }
        }
    }, [user, activeRole])

    useEffect(() => {
        refreshConversations()
    }, [refreshConversations])

    // Local Persistence fallback
    useEffect(() => {
        if (!USE_SUPABASE && conversations.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
        }
    }, [conversations])

    const getOrCreateConsultation = useCallback(async (userId: string, workshopId: string, userName?: string, workshopName?: string, userAvatar?: string) => {
        // 1. Check existing local/cached state
        const existing = conversations.find(c =>
            c.contextType === 'consultation' &&
            c.userId === userId &&
            c.workshopId === workshopId
        )
        if (existing) return existing.id

        // 2. Try Supabase if enabled and IDs are valid UUIDs
        if (USE_SUPABASE && isUUID(userId) && isUUID(workshopId)) {
            try {
                const supabaseConv = await messageDataProvider.getOrCreateConversation(userId, workshopId)
                if (supabaseConv) {
                    // Trigger a refresh to get the new conversation into state
                    await refreshConversations()
                    return supabaseConv.id
                }
            } catch (error) {
                console.error("Failed to get/create Supabase consultation:", error)
            }
        }

        // 3. Fallback to local
        const newId = `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newConv: Conversation = {
            id: newId,
            contextType: 'consultation',
            userId,
            userName: userName || "Customer",
            userAvatar,
            workshopId,
            workshopName: workshopName || "Workshop",
            messages: [],
            updatedAt: new Date().toISOString()
        }
        setConversations(prev => [...prev, newConv])
        return newId
    }, [conversations, refreshConversations])

    const getOrCreateBookingChat = useCallback(async (userId: string, workshopId: string, bookingId: string, userName?: string, workshopName?: string, userAvatar?: string) => {
        // 1. Check existing
        const existing = conversations.find(c =>
            c.contextType === 'booking' &&
            c.bookingId === bookingId
        )
        if (existing) return existing.id

        // 2. Try Supabase
        if (USE_SUPABASE && isUUID(userId) && isUUID(workshopId) && isUUID(bookingId)) {
            try {
                const supabaseConv = await messageDataProvider.getOrCreateConversation(userId, workshopId, bookingId)
                if (supabaseConv) {
                    await refreshConversations()
                    return supabaseConv.id
                }
            } catch (error) {
                console.error("Failed to get/create Supabase booking chat:", error)
            }
        }

        // 3. Fallback
        const newId = `b-${bookingId}`
        const newConv: Conversation = {
            id: newId,
            contextType: 'booking',
            userId,
            userName: userName || "Customer",
            userAvatar,
            workshopId,
            workshopName: workshopName || "Workshop",
            bookingId,
            messages: [],
            updatedAt: new Date().toISOString()
        }
        setConversations(prev => [...prev, newConv])
        return newId
    }, [conversations, refreshConversations])

    const sendMessage = useCallback(async (conversationId: string, text: string, senderRole: 'user' | 'workshop', senderId: string) => {
        // Optimistic update
        const newMessage: ChatMessage = {
            id: `m-${Date.now()}`,
            senderRole,
            senderId,
            text,
            createdAt: new Date().toISOString()
        }

        setConversations(prev => prev.map(c =>
            c.id === conversationId
                ? {
                    ...c,
                    messages: [...c.messages, newMessage],
                    lastMessage: text,
                    updatedAt: new Date().toISOString()
                }
                : c
        ))

        // Push to Supabase if configured and IDs are valid UUIDs
        if (USE_SUPABASE && isUUID(senderId)) {
            // Strip any prefixes like 'b-' or 'c-' from the local conversation ID
            const cleanConvId = conversationId.replace(/^[bc]-/, '')

            if (isUUID(cleanConvId)) {
                try {
                    await messageDataProvider.sendMessage(
                        cleanConvId,
                        senderId,
                        senderRole === 'workshop' ? 'owner' : 'customer',
                        text
                    )
                } catch (error) {
                    console.error("Failed to send message to Supabase:", error)
                }
            }
        }
    }, [])

    const deleteMessage = useCallback(async (conversationId: string, messageId: string) => {
        // Delete from Supabase if enabled
        if (USE_SUPABASE) {
            // Strip prefix if present
            const cleanId = messageId.replace(/^m-/, '');
            if (isUUID(cleanId)) {
                try {
                    await messageDataProvider.deleteMessage(cleanId);
                    console.log('✅ Message deleted from Supabase:', cleanId);
                } catch (err) {
                    console.error('❌ Failed to delete message from Supabase:', err);
                }
            }
        }

        setConversations(prev => prev.map(c => {
            if (c.id !== conversationId) return c
            const newMessages = c.messages.filter(m => m.id !== messageId)
            const lastMsg = newMessages.length > 0 ? newMessages[newMessages.length - 1].text : undefined
            return {
                ...c,
                messages: newMessages,
                lastMessage: lastMsg,
                updatedAt: new Date().toISOString()
            }
        }))
    }, [])

    const deleteConversation = useCallback(async (conversationId: string) => {
        console.log('[DEBUG] chatState: deleteConversation called', { conversationId });
        // Delete from Supabase if enabled
        if (USE_SUPABASE) {
            // Strip prefix if present (e.g. c-timestamp or b-uuid)
            const cleanId = conversationId.replace(/^[bc]-/, '');
            if (isUUID(cleanId)) {
                try {
                    await messageDataProvider.deleteConversation(cleanId);
                    console.log('✅ Conversation deleted from Supabase:', cleanId);
                } catch (err) {
                    console.error('❌ Failed to delete conversation from Supabase:', err);
                }
            }
        }

        // Always remove from local state immediately
        setConversations(prev => prev.filter(c => c.id !== conversationId))

        // Also clear from localStorage
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                const filtered = parsed.filter((c: any) => c.id !== conversationId)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
            } catch (e) {
                console.error("Failed to update localStorage after deletion", e)
            }
        }
    }, [])

    const getConversation = useCallback((id: string) => conversations.find(c => c.id === id), [conversations])

    const value = useMemo(() => ({
        conversations,
        sendMessage,
        deleteMessage,
        deleteConversation,
        getOrCreateConsultation,
        getOrCreateBookingChat,
        getConversation,
        refreshConversations
    }), [conversations, sendMessage, deleteMessage, deleteConversation, getOrCreateConsultation, getOrCreateBookingChat, getConversation, refreshConversations])

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    const context = useContext(ChatContext)
    if (!context) throw new Error("useChat must be used within a ChatProvider")
    return context
}
