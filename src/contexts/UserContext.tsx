import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { authService } from '../lib/authService';
import { supabase } from '../lib/supabaseClient';
import { USE_SUPABASE } from '../lib/dataProvider';

interface UserContextType {
    user: User | null;
    role: UserRole;
    login: (email: string, role?: UserRole, userData?: Partial<User>) => void;
    logout: () => void;
    switchRole: (targetRole?: UserRole) => { success: boolean; message?: string };
    updateProfile: (updates: Partial<User>) => void;
    isAuthenticated: boolean;
}

const STORAGE_KEY_USER = 'mycar_user_profile';
const STORAGE_KEY_ROLE = 'mycar_user_role';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored user', e);
            }
        }
        return null;
    });

    const [currentRole, setCurrentRole] = useState<UserRole>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_ROLE);
        return (stored as UserRole) || 'customer';
    });

    const login = (email: string, role: UserRole = 'customer', userData?: Partial<User>) => {
        const newUser: User = {
            id: userData?.id || 'u' + Math.random().toString(36).substr(2, 9),
            name: userData?.name || email.split('@')[0],
            email,
            role,
            avatar: userData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            gender: userData?.gender,
            phone: userData?.phone || '',
            address: userData?.address || ''
        };
        setUser(newUser);
        setCurrentRole(role);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
        localStorage.setItem(STORAGE_KEY_ROLE, role);
    };

    const logout = () => {
        setUser(null);
        setCurrentRole('customer');
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_ROLE);
    };

    // Sync with Supabase on mount/role change if enabled
    useEffect(() => {
        const syncProfile = async () => {
            console.log('🔄 Profile sync starting...', { USE_SUPABASE, hasUser: !!user });
            if (!USE_SUPABASE || !user) {
                console.log('⏭️ Skipping sync:', !USE_SUPABASE ? 'Supabase disabled' : 'No user');
                return;
            }

            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                console.log('🔐 Auth user:', authUser?.id);
                if (!authUser) {
                    console.log('⏭️ No auth user, skipping sync');
                    return;
                }

                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .limit(1)

                if (error) {
                    console.warn("Profile fetch error:", error.message);
                    return;
                }

                const profile = profileData && profileData.length > 0 ? profileData[0] : null;
                console.log('👤 Profile fetch result:', profile ? 'Found' : 'Not Found', profile?.id);

                // Try to find workshop: first from profile.workshop_id, then by owner_id (using authUser.id)
                let workshopId = profile?.workshop_id;
                let workshopName = 'My Workshop';

                if (!workshopId) {
                    console.log('🔍 No workshop_id (or profile), checking owner_id fallback for:', authUser.id);
                    // Fallback: lookup workshop by owner_id
                    const { data: workshops, error: wsError } = await supabase
                        .from('workshops')
                        .select('id, name')
                        .eq('owner_id', authUser.id) // Use authUser.id directly
                        .limit(1);

                    if (wsError) console.error('❌ Workshop fallback error:', wsError);

                    if (workshops && workshops.length > 0) {
                        workshopId = workshops[0].id;
                        workshopName = workshops[0].name;
                        console.log('✅ Found workshop by owner_id fallback:', workshopName, workshopId);
                    } else {
                        console.log('⚠️ No workshop found for owner_id:', authUser.id);
                    }
                } else {
                    // Fetch workshop name by workshop_id
                    const { data: workshop } = await supabase
                        .from('workshops')
                        .select('name')
                        .eq('id', workshopId)
                        .limit(1);

                    if (workshop && workshop.length > 0) {
                        workshopName = workshop[0].name;
                    }
                }

                // Update user info in state if we have new info (profile OR workshop)
                if (profile || workshopId) {
                    setUser(prev => {
                        if (!prev) return null;

                        const updated = {
                            ...prev,
                            id: profile?.id || prev.id,
                            name: profile?.name || prev.name,
                            email: profile?.email || prev.email,
                            avatar: profile?.avatar_url || prev.avatar,
                            workshopId: workshopId || undefined
                        };

                        // Persist if it changed
                        if (
                            updated.id !== prev.id ||
                            updated.name !== prev.name ||
                            updated.avatar !== prev.avatar ||
                            updated.workshopId !== prev.workshopId
                        ) {
                            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
                        }

                        return updated;
                    });

                    // If user has a workshop, ensure owner account exists in local authService
                    if (workshopId) {
                        const existingOwnerAccount = authService.getAccountByRole(profile?.email || user.email, 'owner');
                        if (!existingOwnerAccount) {
                            // Register owner account locally so role switching works
                            authService.registerAccount({
                                id: profile?.id || user.id,
                                email: profile?.email || user.email,
                                workshopName: workshopName,
                                role: 'owner',
                                createdAt: new Date().toISOString()
                            });
                            console.log('✅ Re-registered owner account from Supabase:', workshopName);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to sync profile with Supabase:", err);
            }
        };

        syncProfile();
    }, [currentRole, !!user]);

    const switchRole = (targetRole?: UserRole): { success: boolean; message?: string } => {
        if (!user) return { success: false, message: 'Not authenticated' };

        const nextRole = targetRole || (currentRole === 'customer' ? 'owner' : 'customer');

        // Verify if user has this role
        // Always allow switching to customer (everyone is a customer)
        if (nextRole !== 'customer') {
            const availableRoles = authService.getAvailableRoles(user.email);
            // Also allow if user has workshopId from Supabase sync
            const hasOwnerFromSupabase = nextRole === 'owner' && !!user.workshopId;
            if (!availableRoles.includes(nextRole) && !hasOwnerFromSupabase) {
                return {
                    success: false,
                    message: `You do not have a ${nextRole === 'owner' ? 'Workshop' : 'Customer'} account yet.`
                };
            }
        }

        // Load specific account data for this role
        const account = authService.getAccountByRole(user.email, nextRole);

        // UI-only user object (not for persistence)
        const uiUser: User = {
            ...user,
            id: (account as any)?.id || user.id,
            // DO NOT overwrite user name with workshop name here. 
            // The UI should handle displaying workshop name in relevant places (e.g. headers)
            // if (account?.role === 'owner') name: account.workshopName... -> NO.
            role: nextRole
        };
        setUser(uiUser);

        // Persistence: Only save the core profile (user.name stays original)
        const persistentUser: User = {
            ...user,
            id: user.id, // Keep base UID
            role: nextRole
        };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(persistentUser));

        setCurrentRole(nextRole);
        localStorage.setItem(STORAGE_KEY_ROLE, nextRole);
        return { success: true };
    };

    const updateProfile = (updates: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <UserContext.Provider value={{
            user,
            role: currentRole,
            login,
            logout,
            switchRole,
            updateProfile,
            isAuthenticated: !!user
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
