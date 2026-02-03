import type { AppNotification } from "../../lib/notifications";
import { useNotifications } from "../../lib/notifications";
import { cn } from "../../lib/utils";
import { useState } from "react";

export function NotificationToast({ notification }: { notification: AppNotification }) {
    const { dismiss } = useNotifications();
    const [isExiting, setIsExiting] = useState(false);

    const typeConfig: Record<string, { icon: string; colors: string; progress: string }> = {
        booking: { icon: "calendar_today", colors: "text-blue-500 bg-blue-50 dark:bg-blue-900/20", progress: "bg-blue-500" },
        quote: { icon: "description", colors: "text-amber-500 bg-amber-50 dark:bg-amber-900/20", progress: "bg-amber-500" },
        payment: { icon: "payments", colors: "text-green-500 bg-green-50 dark:bg-green-900/20", progress: "bg-green-500" },
        repair: { icon: "build", colors: "text-purple-500 bg-purple-50 dark:bg-purple-900/20", progress: "bg-purple-500" },
        pickup: { icon: "directions_car", colors: "text-green-500 bg-green-50 dark:bg-green-900/20", progress: "bg-green-500" },
        info: { icon: "info", colors: "text-blue-500 bg-blue-50 dark:bg-blue-900/20", progress: "bg-blue-500" }
    };

    const config = typeConfig[notification.type] || typeConfig.info;

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => dismiss(notification.id), 300);
    };

    return (
        <div
            className={cn(
                "w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-700 pointer-events-auto overflow-hidden animate-in slide-in-from-right-full duration-300 ease-out",
                isExiting && "animate-out fade-out slide-out-to-right-full fill-mode-forwards"
            )}
        >
            <div className="p-4 flex gap-3">
                <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0", config.colors)}>
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                        {config.icon}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {notification.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {notification.message}
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 shrink-0 transition-colors"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
                </button>
            </div>
            <div className="h-1 w-full bg-slate-100 dark:bg-zinc-900/50">
                <div
                    className={cn("h-full transition-all linear", config.progress)}
                    style={{
                        animation: `progress 5000ms linear forwards`,
                    }}
                />
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}} />
        </div>
    );
}

export function NotificationContainer() {
    const { activeToasts } = useNotifications();

    return (
        <div className="fixed top-4 right-4 left-4 md:left-auto z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm ml-auto">
            {activeToasts.map(n => (
                <NotificationToast key={n.id} notification={n} />
            ))}
        </div>
    );
}
