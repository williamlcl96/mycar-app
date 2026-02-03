import { useNavigate } from "react-router-dom"
import { useUser } from "../../contexts/UserContext"
import { shopService } from "../../lib/shopService"
import { useMockState } from "../../lib/mockState"
import { useNotifications, type AppNotification } from "../../lib/notifications"

export function OwnerProfilePage() {
    const navigate = useNavigate()
    const { user, switchRole } = useUser()
    const { clearAllData } = useMockState()
    const { notifications } = useNotifications()
    const shopData = user ? shopService.getShopData(user.email) : null

    const unreadCount = notifications.filter((n: AppNotification) => n.userId === user?.id && n.role === 'owner' && !n.isRead).length

    const managementItems = [
        {
            icon: 'edit_square',
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            label: 'Edit Workshop Profile',
            sub: 'Update name, location, and hours',
            path: '/owner/profile/edit'
        },
        {
            icon: 'notifications',
            color: 'text-orange-600',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            label: 'Notification Settings',
            sub: 'Job alerts and system updates',
            path: '/owner/profile/notification-settings'
        },
        {
            icon: 'rate_review',
            color: 'text-yellow-600',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            label: 'Shop Reviews & Feedback',
            sub: 'View performance and reply to users',
            path: '/owner/reviews'
        },
        {
            icon: 'gavel',
            color: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-900/20',
            label: 'Disputes & Refunds',
            sub: 'Manage customer complaints',
            path: '/owner/disputes'
        },
    ]

    const accountItems = [
        {
            icon: 'security',
            color: 'text-purple-600',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            label: 'Security & Password',
            sub: 'Manage account access',
            path: '/owner/profile/security'
        },
        {
            icon: 'account_balance',
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-900/20',
            label: 'Payout Settings',
            sub: 'Bank details and revenue',
            path: '/owner/wallet'
        },
        {
            icon: 'help',
            color: 'text-slate-600',
            bg: 'bg-slate-50 dark:bg-zinc-800',
            label: 'Help & Support',
            sub: 'FAQs and owner support',
            path: '/profile/support'
        },
    ]

    return (
        <div className="relative flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 flex items-center bg-white dark:bg-zinc-900 px-5 py-4 justify-between border-b border-slate-200 dark:border-zinc-800">
                <div className="flex flex-col">
                    <h2 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">Shop Profile</h2>
                    <p className="text-xs text-slate-500 font-medium">Manage your business presence</p>
                </div>
                <div
                    onClick={() => navigate('/owner/notifications')}
                    className="flex items-center justify-end cursor-pointer text-slate-900 dark:text-white hover:text-primary transition-colors relative"
                >
                    <span className="material-symbols-outlined text-2xl">notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border-2 border-white dark:border-zinc-900">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col px-4 pt-6 gap-6">
                {/* Profile Card */}
                <div className="flex flex-col items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary">share</span>
                    </div>
                    <div className="relative mb-4 group">
                        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-4 border-white dark:border-zinc-700 shadow-lg overflow-hidden">
                            <img
                                alt="Shop Logo"
                                className="w-full h-full object-cover"
                                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${shopData?.workshopName || 'Ali'}`}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {shopData?.workshopName || "Shop info not set yet"}
                        </h3>
                        {shopData && (
                            <span className="material-symbols-outlined text-blue-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mb-5 line-clamp-1">
                        {shopData?.address || "Location not set"}
                    </p>
                </div>

                {/* Management Section */}
                <div>
                    <h3 className="text-slate-900 dark:text-gray-200 text-sm font-bold uppercase tracking-wider mb-3 px-1">Workshop Management</h3>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800">
                        {managementItems.map((item) => (
                            <button key={item.label} onClick={() => navigate(item.path)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors group text-left">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Account Section */}
                <div>
                    <h3 className="text-slate-900 dark:text-gray-200 text-sm font-bold uppercase tracking-wider mb-3 px-1">Account & Support</h3>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800">
                        {accountItems.map((item) => (
                            <button key={item.label} onClick={() => navigate(item.path)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors group text-left">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* User Mode Switcher */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 flex items-center justify-between shadow-sm mt-2 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-gray-200">
                            <span className="material-symbols-outlined text-xl">switch_account</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">User Mode</p>
                            <p className="text-xs text-slate-500">View app as a customer</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            className="sr-only peer"
                            type="checkbox"
                            checked={false} // Since we are in owner mode, the 'user mode' toggle should be off/unchecked representing switching away from owner
                            onChange={() => {
                                console.log("Attempting to switch to customer role...");
                                const result = switchRole('customer')
                                console.log("Switch result:", result);

                                if (result.success) {
                                    navigate('/')
                                } else {
                                    alert(result.message || "Failed to switch role");
                                }
                            }}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>

                {/* Reset Data Button */}
                <div className="px-1 mb-8">
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to clear all shop orders and data? This cannot be undone.")) {
                                clearAllData();
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-600 border border-red-500/20 text-sm font-bold hover:bg-red-500/20 transition-colors"
                    >
                        <span className="material-symbols-outlined">delete_forever</span>
                        Reset All Platform Data
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                        Clears all bookings, quotes, and refund cases.
                    </p>
                </div>
            </div>
        </div>
    )
}
