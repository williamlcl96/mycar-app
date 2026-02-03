import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"

export function BottomNav() {
    const location = useLocation()

    const navItems = [
        { icon: "home", label: "Home", path: "/" },
        { icon: "calendar_month", label: "Bookings", path: "/bookings" },
        { icon: "chat_bubble", label: "Messages", path: "/messages" },
        { icon: "person", label: "Profile", path: "/profile" },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 px-6 py-3 pb-6 flex justify-between items-center z-50">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                    <Link
                        key={item.label}
                        to={item.path}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-colors group",
                            isActive ? "text-primary" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                    >
                        <span
                            className={cn("material-symbols-outlined", isActive && "fill-current")}
                            style={{ fontSize: "26px", fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                        >
                            {item.icon}
                        </span>
                        <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>
                            {item.label}
                        </span>
                    </Link>
                )
            })}
        </div>
    )
}
