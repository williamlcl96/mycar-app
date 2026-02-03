import { useUser } from "../contexts/UserContext"
import { useNavigate } from "react-router-dom"
import { cn } from "../lib/utils"
import { useNotifications } from "../lib/notifications"
import { useMockState } from "../lib/mockState"
import { authService } from "../lib/authService"

export function Profile() {
    const { user, switchRole, logout } = useUser()
    const navigate = useNavigate()
    const { notify } = useNotifications()
    const { clearAllData } = useMockState()

    // Check if user has a workshop owner account (from local authService OR Supabase sync)
    const hasOwnerAccount = user?.email
        ? (authService.getAvailableRoles(user.email).includes('owner') || !!user.workshopId)
        : false

    const handleSwitchToOwner = () => {
        const result = switchRole('owner')
        if (result.success) {
            navigate('/owner/dashboard')
        } else {
            notify({
                title: "Access Denied",
                message: result.message || "You do not have a Workshop account.",
                type: "info",
                userId: user?.id || 'system',
                role: 'customer'
            })
        }
    }

    interface MenuItem {
        icon: string;
        label: string;
        count?: number | null;
        path: string;
        badge?: string;
        value?: string;
    }

    const menuItems: MenuItem[] = [
        { icon: "person", label: "Personal Info", count: null, path: "/profile/edit" },
        { icon: "directions_car", label: "My Vehicles", count: null, path: "/garage" },
        { icon: "redeem", label: "Refer Friends", count: null, path: "/profile/referral" },
        { icon: "verified", label: "Subscription Status", badge: "BASIC", path: "/profile/subscription" },
        { icon: "lock", label: "Security", count: null, path: "/profile/security" },
        { icon: "settings", label: "Notification Settings", count: null, path: "/profile/notification-settings" },
        { icon: "language", label: "Language", value: "English", path: "/profile/language" },
        { icon: "chat", label: "Contact Support", count: null, path: "/profile/support" },
    ]

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {/* Header */}
            <div className="bg-white dark:bg-surface-dark p-6 pt-8 pb-8 flex flex-col items-center shadow-sm relative sticky top-0 z-10">
                <div className="flex w-full justify-between items-center mb-2 absolute top-4 px-6">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white mx-auto">Profile</h1>
                    <button
                        onClick={() => {
                            logout()
                            navigate('/login')
                        }}
                        className="text-primary font-semibold text-sm absolute right-6"
                    >
                        Logout
                    </button>
                </div>

                <div className="relative mt-8">
                    <div className="size-24 rounded-full bg-orange-100 flex items-center justify-center p-1 border-4 border-white dark:border-zinc-800 shadow-sm overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Ali'}`} alt="Avatar" className="w-full h-full" />
                    </div>
                    <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 border-4 border-white dark:border-zinc-800 shadow-sm hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-[16px] block">edit</span>
                    </button>
                </div>

                <div className="text-center mt-3">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {hasOwnerAccount ? (
                    <div
                        onClick={handleSwitchToOwner}
                        className="mt-6 mx-4 p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl flex items-center justify-between shadow-xl cursor-pointer hover:scale-[1.02] transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-blue-100/10 flex items-center justify-center text-blue-300 border border-blue-500/30">
                                <span className="material-symbols-outlined text-white">storefront</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Owner Dashboard</h3>
                                <p className="text-xs text-blue-200/70">Switch to workshop view</p>
                            </div>
                        </div>
                        <div className="size-8 rounded-full bg-white/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-sm">arrow_forward</span>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => navigate('/register-workshop')}
                        className="mt-6 mx-4 p-4 bg-gradient-to-r from-primary to-blue-600 rounded-2xl flex items-center justify-between shadow-xl cursor-pointer hover:scale-[1.02] transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                                <span className="material-symbols-outlined text-white">add_business</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Register Your Workshop</h3>
                                <p className="text-xs text-blue-100/80">Join MyCar Partner Network</p>
                            </div>
                        </div>
                        <div className="size-8 rounded-full bg-white/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-sm">arrow_forward</span>
                        </div>
                    </div>
                )}

                {/* Menu Items */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {menuItems.map((item, index) => (
                        <div
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors",
                                index !== menuItems.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "size-9 rounded-lg flex items-center justify-center",
                                    item.label === "Personal Info" ? "bg-teal-50 text-teal-600" :
                                        item.label === "My Vehicles" ? "bg-indigo-50 text-indigo-600" :
                                            item.label === "Refer Friends" ? "bg-rose-50 text-rose-600" :
                                                item.label === "Subscription Status" ? "bg-purple-50 text-purple-600" :
                                                    "bg-slate-50 text-slate-600 dark:bg-zinc-800 dark:text-slate-400"
                                )}>
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white text-sm">{item.label}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {item.count && <span className="text-xs text-slate-500 font-medium">{item.count}</span>}

                                {item.badge && (
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        {item.badge}
                                    </span>
                                )}

                                {item.value && <span className="text-xs text-slate-500 font-medium">{item.value}</span>}

                                <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reset Data Button */}
                <div className="px-4 mt-8 pb-8">
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to clear all your bookings and orders? This cannot be undone.")) {
                                clearAllData();
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-600 border border-red-500/20 text-sm font-bold hover:bg-red-500/20 transition-colors"
                    >
                        <span className="material-symbols-outlined">delete_forever</span>
                        Reset All Platform Data
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2 px-6">
                        This will clear all your active bookings, past service history, and active disputes.
                    </p>
                </div>
            </div>
        </div>
    )
}
