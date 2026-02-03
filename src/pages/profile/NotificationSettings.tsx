import { useNavigate } from "react-router-dom"
import { useNotifications, type NotificationPreferences } from "../../lib/notifications"
import { cn } from "../../lib/utils"

export function NotificationSettings() {
    const navigate = useNavigate()
    const { settings, updateSettings } = useNotifications()

    interface SettingItem {
        id: keyof NotificationPreferences;
        label: string;
        description: string;
        icon: string;
        value: boolean;
        disabled?: boolean;
    }

    interface SettingSection {
        title: string;
        items: SettingItem[];
    }

    const sections: SettingSection[] = [
        {
            title: "General",
            items: [
                {
                    id: "enabled",
                    label: "Allow Notifications",
                    description: "Receive in-app alerts for updates",
                    icon: "notifications",
                    value: settings.enabled
                }
            ]
        },
        {
            title: "Notification Types",
            items: [
                {
                    id: "milestones",
                    label: "Progress Updates",
                    description: "Milestones like 'Repair Started'",
                    icon: "trending_up",
                    value: settings.milestones,
                    disabled: !settings.enabled
                },
                {
                    id: "statusChanges",
                    label: "Status Changes",
                    description: "Changes like 'Accepted' or 'Ready'",
                    icon: "sync",
                    value: settings.statusChanges,
                    disabled: !settings.enabled
                },
                {
                    id: "system",
                    label: "System Messages",
                    description: "Maintenance and app updates",
                    icon: "settings",
                    value: settings.system,
                    disabled: !settings.enabled
                }
            ]
        },
        {
            title: "Priority",
            items: [
                {
                    id: "importantOnly",
                    label: "Important Only",
                    description: "Only show high-priority alerts",
                    icon: "priority_high",
                    value: settings.importantOnly,
                    disabled: !settings.enabled
                }
            ]
        }
    ]

    return (
        <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-slate-50 dark:bg-zinc-950 shadow-2xl pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontSize: "24px" }}>arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Notification Settings</h1>
            </div>

            <div className="p-4 space-y-8">
                {sections.map((section) => (
                    <div key={section.title} className="space-y-3">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{section.title}</h2>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                            {section.items.map((item, idx) => (
                                <div
                                    key={item.id.toString()}
                                    className={cn(
                                        "p-4 flex items-center justify-between gap-4 transition-opacity",
                                        item.disabled && "opacity-50 pointer-events-none",
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
                                        onClick={() => updateSettings({ [item.id]: !item.value })}
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
                            ))}
                        </div>
                    </div>
                ))}

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[11px] text-primary/70 text-center leading-relaxed font-medium">
                        These settings only apply to in-app notifications. Push notifications and SMS alerts are currently under development.
                    </p>
                </div>
            </div>
        </div>
    )
}
