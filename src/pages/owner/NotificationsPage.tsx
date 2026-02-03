import { useNavigate } from "react-router-dom"
import { useNotifications } from "../../lib/notifications"
import { useUser } from "../../contexts/UserContext"

export function OwnerNotificationsPage() {
    const navigate = useNavigate()
    const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications()
    const { user } = useUser()

    // Filter notifications for current user, current role and sort by newest
    const userNotifications = notifications
        .filter(n => n.userId === user?.id && n.role === 'owner')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const handleNotificationClick = (notif: any) => {
        markAsRead(notif.id)
        if (notif.relatedBookingId) {
            navigate(`/owner/jobs/${notif.relatedBookingId}`)
        }
    }

    return (
        <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen font-display pb-20">
            <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
                <div onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer">
                    <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back_ios_new</span>
                </div>
                <h1 className="font-bold text-lg text-slate-900 dark:text-white flex-1 text-center pr-8">Notifications</h1>
            </div>

            {/* Action Bar */}
            {userNotifications.length > 0 && (
                <div className="sticky top-[53px] z-40 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-2.5 flex justify-between items-center border-b border-slate-200/50 dark:border-zinc-800/50">
                    <button
                        onClick={() => user?.id && markAllAsRead(user.id, 'owner')}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">done_all</span>
                        Mark read
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm("Clear all notifications?")) {
                                user?.id && clearAll(user.id, 'owner')
                            }
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-red-500/80 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">delete_sweep</span>
                        Clear All
                    </button>
                </div>
            )}

            <div className="p-4 flex flex-col gap-3">
                {userNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">notifications_off</span>
                        <p className="font-bold uppercase tracking-widest text-[10px]">No notifications yet</p>
                    </div>
                ) : (
                    userNotifications.map(notif => (
                        <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border transition-all cursor-pointer relative ${notif.isRead
                                ? "border-slate-100 dark:border-zinc-800"
                                : "border-blue-100 dark:border-blue-900/30 ring-1 ring-blue-50 dark:ring-blue-900/10"
                                }`}
                        >
                            {!notif.isRead && (
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            )}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase text-slate-400">
                                        {new Date(notif.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    </span>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${notif.type === 'booking' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        notif.type === 'payment' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            notif.type === 'quote' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-400'
                                        }`}>
                                        {notif.type}
                                    </span>
                                </div>
                                <h4 className={`font-bold text-slate-900 dark:text-white text-sm pr-4 ${!notif.isRead ? "" : "opacity-80"}`}>
                                    {notif.title}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {notif.message}
                                </p>
                            </div>
                        </div>
                    ))
                )}

                <div className="text-center py-8">
                    <button
                        onClick={() => navigate('/owner/profile/notification-settings')}
                        className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest flex items-center justify-center gap-1 mx-auto"
                    >
                        <span className="material-symbols-outlined text-sm">settings</span>
                        Manage settings
                    </button>
                </div>
            </div>
        </div>
    )
}
