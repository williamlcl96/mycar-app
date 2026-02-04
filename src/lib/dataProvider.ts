/**
 * Data Provider - Hybrid State Management
 * 
 * This module provides a unified data layer that:
 * 1. Uses Supabase when credentials are configured
 * 2. Falls back to localStorage (mockState) when Supabase is not available
 * 
 * This allows the app to work in both development (offline) and production (Supabase) modes.
 */

import { supabase } from './supabaseClient'
import * as services from '../services'

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    return url && key && !url.includes('YOUR_PROJECT') && !key.includes('YOUR_')
}

export const USE_SUPABASE = isSupabaseConfigured()

// Log which mode we're using
if (USE_SUPABASE) {
    console.log('🔌 Using Supabase backend')
} else {
    console.log('💾 Using localStorage (mock mode)')
}

/**
 * Hybrid Vehicle Service
 */
export const vehicleDataProvider = {
    async getAll(userId: string) {
        if (USE_SUPABASE) {
            return services.vehicleService.getAll(userId)
        }
        // Fallback handled by mockState
        return null
    },

    async create(vehicle: Omit<services.Vehicle, 'id' | 'created_at'>) {
        if (USE_SUPABASE) {
            return services.vehicleService.create(vehicle)
        }
        return null
    },

    async delete(id: string) {
        if (USE_SUPABASE) {
            return services.vehicleService.delete(id)
        }
        return null
    },

    async update(id: string, updates: Partial<services.Vehicle>) {
        if (USE_SUPABASE) {
            return services.vehicleService.update(id, updates)
        }
        return null
    },
    async setPrimary(id: string, userId: string) {
        if (USE_SUPABASE) {
            return services.vehicleService.setPrimary(id, userId)
        }
        return null
    }
}

/**
 * Hybrid Booking Service
 */
export const bookingDataProvider = {
    async getByCustomer(customerId: string) {
        if (USE_SUPABASE) {
            return services.bookingService.getByCustomer(customerId)
        }
        return null
    },

    async getByWorkshop(workshopId: string) {
        if (USE_SUPABASE) {
            return services.bookingService.getByWorkshop(workshopId)
        }
        return null
    },

    async create(booking: Parameters<typeof services.bookingService.create>[0]) {
        if (USE_SUPABASE) {
            return services.bookingService.create(booking)
        }
        return null
    },

    async updateStatus(id: string, status: services.Booking['status'], additionalUpdates?: Partial<services.Booking>) {
        if (USE_SUPABASE) {
            return services.bookingService.updateStatus(id, status, additionalUpdates)
        }
        return null
    },

    async linkQuote(bookingId: string, quoteId: string) {
        if (USE_SUPABASE) {
            return services.bookingService.linkQuote(bookingId, quoteId)
        }
        return null
    }
}

/**
 * Hybrid Workshop Service
 */
export const workshopDataProvider = {
    async getAll() {
        if (USE_SUPABASE) {
            return services.workshopService.getAll()
        }
        return null
    },

    async getById(id: string) {
        if (USE_SUPABASE) {
            return services.workshopService.getById(id)
        }
        return null
    },

    async getByOwner(ownerId: string) {
        if (USE_SUPABASE) {
            return services.workshopService.getByOwner(ownerId)
        }
        return null
    },

    async search(query: string) {
        if (USE_SUPABASE) {
            return services.workshopService.search(query)
        }
        return null
    }
}

/**
 * Hybrid Review Service
 */
export const reviewDataProvider = {
    async getByWorkshop(workshopId: string) {
        if (USE_SUPABASE) {
            return services.reviewService.getByWorkshop(workshopId)
        }
        return null
    },

    async getByUser(userId: string) {
        if (USE_SUPABASE) {
            return services.reviewService.getByUser(userId)
        }
        return null
    },

    async create(review: Parameters<typeof services.reviewService.create>[0]) {
        if (USE_SUPABASE) {
            return services.reviewService.create(review)
        }
        return null
    },

    async addReply(id: string, reply: string) {
        if (USE_SUPABASE) {
            return services.reviewService.addReply(id, reply)
        }
        return null
    }
}

/**
 * Hybrid Quote Service
 */
export const quoteDataProvider = {
    async getByBooking(bookingId: string) {
        if (USE_SUPABASE) {
            return services.quoteService.getByBooking(bookingId)
        }
        return null
    },

    async create(quote: Parameters<typeof services.quoteService.create>[0]) {
        if (USE_SUPABASE) {
            return services.quoteService.create(quote)
        }
        return null
    },

    async updateStatus(id: string, status: services.Quote['status']) {
        if (USE_SUPABASE) {
            return services.quoteService.updateStatus(id, status)
        }
        return null
    },

    async delete(id: string) {
        if (USE_SUPABASE) {
            return services.quoteService.delete(id)
        }
        return null
    }
}

/**
 * Hybrid Message Service
 */
export const messageDataProvider = {
    async getConversations(userId: string, role: 'customer' | 'owner') {
        if (USE_SUPABASE) {
            return services.messageService.getConversations(userId, role)
        }
        return null
    },

    async getMessages(conversationId: string) {
        if (USE_SUPABASE) {
            return services.messageService.getMessages(conversationId)
        }
        return null
    },

    async getOrCreateConversation(customerId: string, workshopId: string, bookingId?: string) {
        if (USE_SUPABASE) {
            return services.messageService.getOrCreateConversation(customerId, workshopId, bookingId)
        }
        return null
    },

    async sendMessage(conversationId: string, senderId: string, senderRole: 'customer' | 'owner', content: string) {
        if (USE_SUPABASE) {
            return services.messageService.sendMessage(conversationId, senderId, senderRole, content)
        }
        return null
    },

    subscribeToMessages(conversationId: string, callback: (message: services.Message) => void) {
        if (USE_SUPABASE) {
            return services.messageService.subscribeToMessages(conversationId, callback)
        }
        return null
    },

    async deleteConversation(id: string) {
        if (USE_SUPABASE) {
            return services.messageService.deleteConversation(id)
        }
    },

    async deleteMessage(id: string) {
        if (USE_SUPABASE) {
            return services.messageService.deleteMessage(id)
        }
    }
}

/**
 * Hybrid Refund Service
 */
export const refundDataProvider = {
    async getByUser(userId: string) {
        if (USE_SUPABASE) {
            return services.refundService.getByUser(userId)
        }
        return null
    },

    async getByWorkshop(workshopId: string) {
        if (USE_SUPABASE) {
            return services.refundService.getByWorkshop(workshopId)
        }
        return null
    },

    async create(refund: Parameters<typeof services.refundService.create>[0]) {
        if (USE_SUPABASE) {
            return services.refundService.create(refund)
        }
        return null
    },

    async updateStatus(id: string, status: services.RefundStatus, description?: string) {
        if (USE_SUPABASE) {
            return services.refundService.updateStatus(id, status, description)
        }
        return null
    },

    async addComment(id: string, authorRole: 'user' | 'owner', text: string) {
        if (USE_SUPABASE) {
            return services.refundService.addComment(id, authorRole, text)
        }
        return null
    }
}

/**
 * Hybrid Notification Service
 */
export const notificationDataProvider = {
    async getByUser(userId: string, role: 'customer' | 'owner') {
        if (USE_SUPABASE) {
            return services.notificationService.getByUser(userId, role)
        }
        return null
    },

    async markAsRead(id: string) {
        if (USE_SUPABASE) {
            return services.notificationService.markAsRead(id)
        }
        return null
    },

    async clearAll(userId: string, role: 'customer' | 'owner') {
        if (USE_SUPABASE) {
            return services.notificationService.clearAll(userId, role)
        }
        return null
    },

    subscribeToNotifications(userId: string, callback: (notification: services.Notification) => void) {
        if (USE_SUPABASE) {
            return services.notificationService.subscribeToNotifications(userId, callback)
        }
        return null
    }
}

// Re-export the supabase client for direct access if needed
export { supabase }
