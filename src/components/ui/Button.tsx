import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline" | "ghost"
    size?: "default" | "sm" | "lg" | "icon"
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", isLoading = false, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={props.disabled || isLoading}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-primary text-white hover:bg-blue-600 shadow-md shadow-blue-500/20 active:scale-[0.98]": variant === "primary",
                        "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50": variant === "outline",
                        "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50": variant === "ghost",
                        "h-12 px-5 py-2": size === "default",
                        "h-9 px-3 text-xs": size === "sm",
                        "h-14 px-8": size === "lg",
                        "h-10 w-10": size === "icon",
                        "opacity-70": isLoading,
                    },
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                    </div>
                ) : props.children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
