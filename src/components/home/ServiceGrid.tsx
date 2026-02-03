import { cn } from "../../lib/utils"
import { useNavigate } from "react-router-dom"

interface ServiceGridProps {
    onCategorySelect?: (category: string) => void;
    activeCategories?: string[];
}

export function ServiceGrid({ onCategorySelect, activeCategories = [] }: ServiceGridProps) {
    const navigate = useNavigate()
    const services = [
        { icon: "oil_barrel", label: "Engine Oil" },
        { icon: "tire_repair", label: "Tires" },
        { icon: "battery_charging_full", label: "Battery" },
        { icon: "ac_unit", label: "Air-cond" },
        { icon: "monitor_heart", label: "Diagnostics" },
        { icon: "local_car_wash", label: "Car Wash" },
        { icon: "local_shipping", label: "Towing" },
        { icon: "grid_view", label: "More", isMore: true },
    ]

    const handleServiceClick = (label: string, isMore?: boolean) => {
        if (isMore) {
            navigate('/category-more')
            return
        }
        if (onCategorySelect) {
            onCategorySelect(label);
            return;
        }
        const slug = label.toLowerCase().replace(/\s+/g, '-')
        navigate(`/category/${slug}`)
    }

    return (
        <div className="px-4 pb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                Service Categories
            </h2>
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                {services.map((service) => {
                    const isActive = activeCategories.includes(service.label);
                    return (
                        <div
                            key={service.label}
                            className="flex flex-col items-center gap-2 cursor-pointer group"
                            onClick={() => handleServiceClick(service.label, service.isMore)}
                        >
                            <div
                                className={cn(
                                    "size-14 rounded-full border shadow-sm flex items-center justify-center transition-all duration-200 relative",
                                    service.isMore
                                        ? "bg-slate-100 dark:bg-zinc-700 border-transparent group-hover:bg-slate-200 dark:group-hover:bg-zinc-600 shadow-none"
                                        : isActive
                                            ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-110"
                                            : "bg-white dark:bg-zinc-800 border-slate-100 dark:border-zinc-700 group-hover:bg-primary/5 dark:group-hover:bg-primary/20 group-hover:border-primary/30"
                                )}
                            >
                                <span
                                    className={cn(
                                        "material-symbols-outlined",
                                        service.isMore ? "text-slate-600 dark:text-slate-300" : isActive ? "text-white" : "text-primary"
                                    )}
                                    style={{ fontSize: "28px" }}
                                >
                                    {service.icon}
                                </span>
                                {isActive && (
                                    <div className="absolute -top-1 -right-1 bg-white dark:bg-zinc-900 text-primary rounded-full size-5 flex items-center justify-center border border-primary animate-in zoom-in-50 duration-200">
                                        <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                    </div>
                                )}
                            </div>
                            <span className={cn(
                                "text-xs font-semibold text-center leading-tight transition-colors",
                                isActive ? "text-primary dark:text-primary-light" : "text-slate-700 dark:text-slate-300"
                            )}>
                                {service.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
