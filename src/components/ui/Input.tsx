import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, startIcon, endIcon, ...props }, ref) => {
        return (
            <div className="relative flex items-center w-full">
                {startIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {startIcon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-slate-200 bg-surface-light px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surface-dark dark:border-slate-700 dark:text-white",
                        startIcon && "pl-12",
                        endIcon && "pr-12",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {endIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {endIcon}
                    </div>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
