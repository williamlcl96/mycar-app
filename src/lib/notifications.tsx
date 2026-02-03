import { useState, createContext, useContext, useCallback, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { USE_SUPABASE } from "./dataProvider";
import type { ReactNode } from "react";

export type NotificationType = 'booking' | 'quote' | 'payment' | 'repair' | 'pickup' | 'info';

export interface AppNotification {
    id: string;
    userId: string;
    role: 'customer' | 'owner';
    type: NotificationType;
    title: string;
    message: string;
    relatedBookingId?: string;
    isRead: boolean;
    createdAt: number;
    autoDismiss?: boolean;
}

export interface NotificationPreferences {
    enabled: boolean;
    milestones: boolean;    // progressReachKey
    statusChanges: boolean; // dataStatusChange
    system: boolean;        // systemMessages
    importantOnly: boolean;
}

interface NotificationContextType {
    notifications: AppNotification[];
    activeToasts: AppNotification[];
    settings: NotificationPreferences;
    notify: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
    dismiss: (id: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: (userId: string, role: 'customer' | 'owner') => void;
    clearAll: (userId?: string, role?: 'customer' | 'owner') => void;
    updateSettings: (settings: Partial<NotificationPreferences>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATION_SETTINGS_KEY = 'mycar_notification_settings';
const NOTIFICATIONS_STORAGE_KEY = 'mycar_notifications_list';

const defaultSettings: NotificationPreferences = {
    enabled: true,
    milestones: true,
    statusChanges: true,
    system: true,
    importantOnly: false
};

// UUID validation helper
const isValidUUID = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};

// Type mapping for database constraints
const mapTypeForDB = (type: NotificationType): string => {
    const supportedTypes = ['info', 'success', 'warning', 'booking', 'quote', 'payment', 'review', 'refund', 'message'];
    if (supportedTypes.includes(type)) return type;
    if (type === 'repair' || type === 'pickup') return 'booking';
    return 'info';
};

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    // We'll use a separate state for active toasts to avoid cluttering the UI
    const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);

    const [settings, setSettings] = useState<NotificationPreferences>(() => {
        const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        try {
            return stored ? JSON.parse(stored) : defaultSettings;
        } catch (e) {
            return defaultSettings;
        }
    });
    const lastNotified = useRef<Record<string, number>>({});

    // Fetch notifications from Supabase if enabled
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!USE_SUPABASE) {
                const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
                try {
                    setNotifications(stored ? JSON.parse(stored) : []);
                } catch (e) {
                    setNotifications([]);
                }
                return;
            }

            const { data: authData } = await supabase.auth.getUser();
            const user = authData?.user;

            if (user) {
                const { data, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    const mapped: AppNotification[] = data.map(n => ({
                        id: n.id,
                        userId: n.user_id,
                        role: n.role as 'customer' | 'owner',
                        type: n.type as NotificationType,
                        title: n.title,
                        message: n.message,
                        relatedBookingId: n.link, // Using link field for booking ID
                        isRead: n.is_read,
                        createdAt: new Date(n.created_at).getTime()
                    }));
                    setNotifications(mapped);
                }
            }
        };

        fetchNotifications();
    }, []);

    const dismissToast = useCallback((id: string) => {
        setActiveToasts(prev => prev.filter(n => n.id !== id));
    }, []);

    const notify = useCallback((n: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
        // Settings Check
        if (!settings.enabled) return;

        const id = Math.random().toString(36).substring(2, 9);
        const createdAt = Date.now();

        // Deduplication: Avoid spanning same message within 2 seconds
        const dedupeKey = `${n.userId}:${n.role}:${n.type}:${n.message}`;
        if (lastNotified.current[dedupeKey] && createdAt - lastNotified.current[dedupeKey] < 2000) {
            return;
        }
        lastNotified.current[dedupeKey] = createdAt;

        const newNotification: AppNotification = {
            ...n,
            id,
            createdAt,
            isRead: false,
            autoDismiss: n.autoDismiss ?? true
        };

        // Add to persistent storage
        const saveNotification = async () => {
            let finalId = id;
            if (USE_SUPABASE && isValidUUID(n.userId)) {
                try {
                    const { data, error } = await supabase.from('notifications').insert({
                        user_id: n.userId,
                        role: n.role,
                        type: mapTypeForDB(n.type),
                        title: n.title,
                        message: n.message,
                        link: n.relatedBookingId,
                        is_read: false
                    }).select('id').single();

                    if (!error && data) {
                        finalId = data.id;
                    }
                } catch (err) {
                    console.error('Failed to sync notification to Supabase:', err);
                }
            }

            const notificationToStore: AppNotification = {
                ...newNotification,
                id: finalId
            };

            setNotifications(prev => {
                const updated = [notificationToStore, ...prev];
                localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        };

        saveNotification();

        // Show toast
        setActiveToasts(prev => [newNotification, ...prev].slice(0, 5));

        if (newNotification.autoDismiss) {
            setTimeout(() => {
                dismissToast(id);
            }, 5000);
        }
    }, [settings.enabled, dismissToast]);

    const markAsRead = useCallback((id: string) => {
        const updateSync = async () => {
            if (USE_SUPABASE && isValidUUID(id)) {
                await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('id', id);
            }

            setNotifications(prev => {
                const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
                localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        };
        updateSync();
    }, []);

    const markAllAsRead = useCallback((userId: string, role: 'customer' | 'owner') => {
        const updateAllSync = async () => {
            if (USE_SUPABASE && isValidUUID(userId)) {
                await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('user_id', userId)
                    .eq('role', role);
            }

            setNotifications(prev => {
                const updated = prev.map(n => (n.userId === userId && n.role === role) ? { ...n, isRead: true } : n);
                localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        };
        updateAllSync();
    }, []);

    const clearAll = useCallback((userId?: string, role?: 'customer' | 'owner') => {
        const clearSync = async () => {
            if (USE_SUPABASE && userId && isValidUUID(userId)) {
                const query = supabase.from('notifications').delete().eq('user_id', userId);
                if (role) query.eq('role', role);
                await query;
            }

            setNotifications(prev => {
                const updated = userId
                    ? prev.filter(n => !(n.userId === userId && (role ? n.role === role : true)))
                    : [];

                if (updated.length === 0) {
                    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
                } else {
                    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
                }
                return updated;
            });
        };
        clearSync();
    }, []);

    const updateSettings = useCallback((newSettings: Partial<NotificationPreferences>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            activeToasts,
            settings,
            notify,
            dismiss: dismissToast,
            markAsRead,
            markAllAsRead,
            clearAll,
            updateSettings
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
