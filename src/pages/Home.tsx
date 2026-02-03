import { Header } from "../components/layout/Header"
import { PromoCarousel } from "../components/home/PromoCarousel"
import { ServiceGrid } from "../components/home/ServiceGrid"
import { WorkshopCard } from "../components/home/WorkshopCard"
import { Button } from "../components/ui/Button"
import { FilterModal } from "../components/home/FilterModal"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "../lib/utils"

import { useMockState } from "../lib/mockState"
import { searchWorkshops, filterWorkshops, type WorkshopFilters } from "../lib/search"
import { MapSearch } from "../components/home/MapSearch"
import { getDistance, type Coordinates } from "../lib/geoUtils"
import { useLocation } from "../contexts/LocationContext"

export function Home() {
    const navigate = useNavigate()
    const { workshops } = useMockState()
    const { coords: userCoords, isLoading: isLocating } = useLocation()

    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filters, setFilters] = useState<WorkshopFilters>({})
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
    const [mapCenter, setMapCenter] = useState<Coordinates | null>(null)
    const [mapRadius, setMapRadius] = useState<number>(5000)

    const hasResolvedInitial = useRef(false)

    // Sync map center to user location ONLY ONCE when it resolves
    useEffect(() => {
        if (!isLocating && userCoords && !hasResolvedInitial.current) {
            console.log("[Map] Initial resolution center jump:", userCoords)
            setMapCenter(userCoords)
            hasResolvedInitial.current = true
        }
    }, [userCoords, isLocating])

    // Pipeline: Search -> Filter (Category/Price/Rating) -> Map Filter
    const searchedWorkshops = searchTerm
        ? searchWorkshops(searchTerm, workshops).map(r => r.workshop)
        : workshops;

    let finalResults = filterWorkshops(searchedWorkshops, filters);

    // Sort by proximity to user location
    if (userCoords && !isLocating) {
        finalResults = [...finalResults].sort((a, b) => {
            const distA = getDistance(userCoords, { lat: a.lat || 0, lng: a.lng || 0 });
            const distB = getDistance(userCoords, { lat: b.lat || 0, lng: b.lng || 0 });
            return distA - distB;
        });
    }

    // Apply Map Filter if in Map Mode
    if (viewMode === 'map' && mapCenter) {
        finalResults = finalResults.filter(w => {
            const dist = getDistance({ lat: w.lat, lng: w.lng }, mapCenter);
            return dist <= (mapRadius / 1000); // dist is in km, mapRadius in m
        });
    }



    return (
        <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-background-light dark:bg-background-dark overflow-x-hidden shadow-2xl pb-24">
            <Header />

            {/* Search Bar */}
            <div className="px-4 py-4 bg-background-light dark:bg-background-dark">
                <div className="flex w-full items-center rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm h-12 px-3 gap-3 transition-colors duration-200 group focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors" style={{ fontSize: "24px" }}>
                        search
                    </span>
                    <input
                        className="flex-1 bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 text-base font-medium outline-none"
                        placeholder="Search workshops, services, or parts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="p-1" onClick={() => setIsFilterOpen(true)}>
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: "24px" }}>
                            tune
                        </span>
                    </button>
                </div>
            </div>

            {/* View Toggle */}
            <div className="px-4 pb-4">
                <div className="flex bg-slate-100 dark:bg-zinc-800/50 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                            viewMode === 'list'
                                ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <span className="material-symbols-outlined text-[18px]">list</span>
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                            viewMode === 'map'
                                ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <span className="material-symbols-outlined text-[18px]">map</span>
                        Map View
                    </button>
                </div>
            </div>

            {viewMode === 'map' ? (
                <div className="px-4 pb-6">
                    <MapSearch
                        center={mapCenter || userCoords || { lat: 3.1073, lng: 101.6067 }}
                        workshops={finalResults}
                        onCenterChange={(center, radius) => {
                            console.log("[Map] User changed center via interaction:", center);
                            setMapCenter(center);
                            setMapRadius(radius);
                        }}
                        onWorkshopSelect={(id) => navigate(`/workshops/${id}`)}
                    />
                </div>
            ) : (
                <PromoCarousel />
            )}

            <ServiceGrid />

            {/* Top Rated Near You */}
            <div className="px-4 pb-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        Top Rated Near You
                    </h2>
                    <div
                        className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-medium cursor-pointer"
                        onClick={() => setIsFilterOpen(true)}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                            filter_list
                        </span>
                        <span>Filter</span>
                    </div>
                </div>

                {isLocating ? (
                    <div className="flex flex-col gap-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-slate-100 dark:bg-zinc-800 rounded-xl h-64 w-full" />
                        ))}
                    </div>
                ) : finalResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                        <p className="text-sm font-medium">No workshops match your filters</p>
                        <button
                            onClick={() => { setFilters({}); setSearchTerm(""); }}
                            className="mt-4 text-primary font-bold text-sm"
                        >
                            Reset all filters
                        </button>
                    </div>
                ) : (
                    finalResults.map((workshop) => (
                        <div key={workshop.id} onClick={() => navigate(`/workshops/${workshop.id}`)} className="cursor-pointer transition-transform active:scale-[0.98]">
                            <WorkshopCard
                                {...workshop}
                                distance={`${getDistance(userCoords, { lat: workshop.lat, lng: workshop.lng }).toFixed(1)} km`}
                                tags={workshop.specialties || []}
                            />
                        </div>
                    ))
                )}

                <Button
                    variant="outline"
                    onClick={() => navigate("/category/all")}
                    className="w-full h-auto py-3 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold text-sm bg-transparent hover:bg-slate-50 dark:hover:bg-zinc-800"
                >
                    View All Workshops
                </Button>
            </div>

            <div className="h-4"></div>
            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={(appliedFilters) => setFilters(appliedFilters)}
            />
        </div>
    )
}
