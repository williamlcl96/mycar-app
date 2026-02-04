import { useParams, useNavigate } from "react-router-dom"
import { WorkshopCard } from "../components/home/WorkshopCard"
import { useMockState } from "../lib/mockState"
import { useState } from "react"
import { FilterModal } from "../components/home/FilterModal"
import { filterWorkshops, type WorkshopFilters } from "../lib/search"
import { useLocation } from "../contexts/LocationContext"

export function CategoryListing() {
    const { id = "all" } = useParams()
    const navigate = useNavigate()
    const { workshops } = useMockState()
    const { city, isLoading: isLocating } = useLocation()
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filters, setFilters] = useState<WorkshopFilters>({})

    const mapping: Record<string, string> = {
        "engine-oil": "Engine",
        "tires": "Tires",
        "battery": "Battery",
        "air-cond": "Air-cond",
        "diagnostics": "General",
        "car-wash": "Wash",
        "towing": "Towing",
        "transmission": "Transmission",
        "brakes": "Brakes",
        "suspension": "Suspension",
        "body-paint": "Body Paint",
        "major-service": "Engine"
    };

    const targetSpecialty = mapping[id.toLowerCase()] || (id !== "all" ? id : null);

    // In-category search/filter:
    // 1. Initial category filter
    const categoryWorkshops = targetSpecialty
        ? workshops.filter(w => w.specialties.some(s => s.toLowerCase() === targetSpecialty.toLowerCase()))
        : workshops;

    // 2. Apply additional filters from Modal
    const finalResults = filterWorkshops(categoryWorkshops, filters);

    const categoryName = id === "all" ? "All Workshops" : id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())

    return (
        <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-background-light dark:bg-background-dark overflow-x-hidden shadow-2xl pb-24">
            <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontSize: "24px" }}>arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">{categoryName}</h1>
                </div>
            </div>

            <div className="sticky top-[64px] z-40 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 py-3 px-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{finalResults.length} workshops found</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                            {isLocating ? "Locating..." : (city || "Malaysia")} • Proximity Search
                        </span>
                    </div>
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-zinc-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700 active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>tune</span>
                        <span>Filter & Sort</span>
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-4">
                {finalResults.map((workshop) => (
                    <div key={workshop.id} onClick={() => navigate(`/workshops/${workshop.id}`)} className="cursor-pointer">
                        <WorkshopCard
                            image={workshop.image}
                            name={workshop.name}
                            rating={workshop.rating}
                            reviews={workshop.reviews}
                            distance={workshop.distance}
                            location={workshop.location}
                            tags={workshop.specialties}
                            price={workshop.price}
                            lat={workshop.lat}
                            lng={workshop.lng}
                            businessHours={workshop.businessHours}
                        />
                    </div>
                ))}
                {finalResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">search_off</span>
                        <p className="text-lg font-bold">No workshops found</p>
                        <p className="text-sm">Try a different filter or search term.</p>
                    </div>
                )}
            </div>

            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={(appliedFilters) => setFilters(appliedFilters)}
            />
        </div >
    )
}
