import { useNavigate } from "react-router-dom"

export function MoreCategories() {
    const navigate = useNavigate()

    const allCategories = [
        {
            group: "Popular Services", items: [
                { icon: "oil_barrel", label: "Engine Oil", specialty: "Engine" },
                { icon: "tire_repair", label: "Tires", specialty: "Tires" },
                { icon: "battery_charging_full", label: "Battery", specialty: "Battery" },
                { icon: "ac_unit", label: "Air-cond", specialty: "Air-cond" },
            ]
        },
        {
            group: "Maintenance & Repair", items: [
                { icon: "monitor_heart", label: "Diagnostics", specialty: "General" },
                { icon: "settings_suggest", label: "Major Service", specialty: "Engine" },
                { icon: "build", label: "Brakes", specialty: "Brakes" },
                { icon: "handyman", label: "Suspension", specialty: "Suspension" },
                { icon: "settings_input_component", label: "Transmission", specialty: "Transmission" },
            ]
        },
        {
            group: "Exterior & Others", items: [
                { icon: "local_car_wash", label: "Car Wash", specialty: "Wash" },
                { icon: "palette", label: "Body Paint", specialty: "Body Paint" },
                { icon: "local_shipping", label: "Towing", specialty: "Towing" },
                { icon: "security", label: "Shielding", specialty: "General" },
            ]
        }
    ]

    const handleSelectCategory = (slug: string) => {
        navigate(`/category/${slug}`)
    }

    return (
        <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-background-light dark:bg-background-dark overflow-x-hidden shadow-2xl pb-24">
            <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontSize: "24px" }}>arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">All Categories</h1>
            </div>

            <div className="p-4 flex flex-col gap-8">
                {allCategories.map((group) => (
                    <div key={group.group} className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-1">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{group.group}</h2>
                            <div className="h-[1px] flex-1 bg-slate-100 dark:bg-zinc-800"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {group.items.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => handleSelectCategory(item.label.toLowerCase().replace(/\s+/g, '-'))}
                                    className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-700 shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all text-center group active:scale-95"
                                >
                                    <div className="size-12 rounded-full bg-slate-50 dark:bg-zinc-700/50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-primary group-hover:text-white" style={{ fontSize: "28px" }}>{item.icon}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
