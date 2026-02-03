import { useNavigate } from "react-router-dom"
import { useLocation } from "../../contexts/LocationContext"
import { useNotifications } from "../../lib/notifications"
import { useUser } from "../../contexts/UserContext"

export function Header() {
    const navigate = useNavigate()
    const { city, isLoading, source, refreshLocation } = useLocation()
    const { user } = useUser()
    const { notifications } = useNotifications()

    const unreadCount = notifications.filter(n => n.userId === user?.id && n.role === 'customer' && !n.isRead).length

    return (
        <div className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between transition-colors duration-200">
            <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => refreshLocation(true)}
            >
                {/* ... (location content) */}
                <span className={`material-symbols-outlined ${source === 'gps' ? 'text-primary' : 'text-slate-400'}`} style={{ fontSize: "24px" }}>
                    {isLoading ? 'autorenew' : 'location_on'}
                </span>
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        {isLoading ? 'Locating...' : source === 'gps' ? 'Current Location' : source === 'manual' ? 'Selected Location' : 'No Access'}
                    </span>
                    <div className="flex items-center gap-1">
                        <h2 className={`text-slate-900 dark:text-white text-sm font-bold leading-tight ${isLoading ? 'animate-pulse opacity-50' : ''}`}>
                            {isLoading ? 'Identifying area...' : city || 'Location unavailable'}
                        </h2>
                        {!isLoading && (
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors" style={{ fontSize: "16px" }}>
                                refresh
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <button
                onClick={() => navigate('/profile/notifications')}
                className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm relative active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontSize: "24px" }}>
                    notifications
                </span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-zinc-800 animate-in zoom-in duration-200">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
        </div>
    )
}
