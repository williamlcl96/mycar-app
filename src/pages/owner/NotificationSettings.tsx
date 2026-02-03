import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { cn } from "../../lib/utils"
import { useNotifications } from "../../lib/notifications"

interface OwnerNotificationPreferences {
    globalEnabled: boolean;
    orderUpdates: boolean;
    customerMessages: boolean;
    systemAnnouncements: boolean;
}

const DEFAULT_SETTINGS: OwnerNotificationPreferences = {
    globalEnabled: true,
    orderUpdates: true,
    customerMessages: true,
    systemAnnouncements: true
}

export function OwnerNotificationSettings() {
    const navigate = useNavigate()
    const { notify } = useNotifications()
    const [settings, setSettings] = useState<OwnerNotificationPreferences>(DEFAULT_SETTINGS)

    // Load settings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('mycar_owner_notification_settings')
        if (saved) {
            try {
                setSettings(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse owner settings", e)
            }
        }
    }, [])

    const updateSetting = (key: keyof OwnerNotificationPreferences, value: boolean) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
        localStorage.setItem('mycar_owner_notification_settings', JSON.stringify(newSettings))

        // Show immediate feedback
        notify({
            title: "Settings Updated",
            message: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been ${value ? 'enabled' : 'disabled'}.`,
            type: "success"
        })
    }

    const sections = [
        {
            title: "Master Control",
            items: [
                {
                    id: "globalEnabled",
                    label: "Push Notifications",
                    description: "Enable or disable all workshop alerts",
                    icon: "notifications",
                    value: settings.globalEnabled
                }
            ]
        },
        {
            title: "Workshop Alerts",
            items: [
                {
                    id: "orderUpdates",
                    label: "Order & Service Updates",
                    description: "New bookings and job status changes",
                    icon: "content_paste",
                    value: settings.orderUpdates,
                    disabled: !settings.globalEnabled
                },
                {
                    id: "customerMessages",
                    label: "Customer Messages",
                    description: "Direct inquiries from car owners",
                    icon: "chat",
                    value: settings.customerMessages,
                    disabled: !settings.globalEnabled
                },
                {
                    id: "systemAnnouncements",
                    label: "System Announcements",
                    description: "Platform updates and maintenance alerts",
                    icon: "campaign",
                    value: settings.systemAnnouncements,
                    disabled: !settings.globalEnabled
                }
            ]
        }
    ]

    return (
        <div className="relative flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontSize: "24px" }}>arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Workshop Notifications</h1>
            </div>

            <div className="p-4 space-y-8">
                {sections.map((section) => (
                    <div key={section.title} className="space-y-3">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{section.title}</h2>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                            {section.items.map((item, idx) => {
                                const isDisabled = 'disabled' in item ? item.disabled : false;
                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "p-4 flex items-center justify-between gap-4 transition-opacity",
                                            isDisabled && "opacity-50 pointer-events-none",
                                            idx !== section.items.length - 1 && "border-b border-slate-50 dark:border-zinc-800"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                                                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>{item.icon}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</span>
                                                <span className="text-[11px] text-slate-500 leading-tight">{item.description}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateSetting(item.id as keyof OwnerNotificationPreferences, !item.value)}
                                            className={cn(
                                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                                item.value ? "bg-primary" : "bg-slate-200 dark:bg-zinc-700"
                                            )}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={cn(
                                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                    item.value ? "translate-x-5" : "translate-x-0"
                                                )}
                                            />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <p className="text-[11px] text-blue-500/70 text-center leading-relaxed font-medium">
                        These settings are specific to your Workshop Owner account. Changing them here will not affect your personal customer notification preferences.
                    </p>
                </div>
            </div>
        </div>
    )
}
