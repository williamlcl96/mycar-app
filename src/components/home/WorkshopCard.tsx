import { Button } from "../ui/Button"
import { useNavigate } from "react-router-dom"
import { VALID_CATEGORIES } from "../../lib/utils"
import { useLocation } from "../../contexts/LocationContext"
import { getDistance } from "../../lib/geoUtils"

interface WorkshopCardProps {
    image: string
    name: string
    rating: number
    reviews: number
    distance: string
    location: string
    tags: string[]
    price: number
    lat: number
    lng: number
    isPromo?: boolean
    isOpen?: boolean
    closesAt?: string
}

export function WorkshopCard({
    image,
    name,
    rating,
    reviews,
    distance: initialDistance,
    location,
    tags = [],
    price,
    lat,
    lng,
    isPromo,
    isOpen,
    closesAt,
}: WorkshopCardProps) {
    const navigate = useNavigate()
    const { coords, source } = useLocation()

    const displayDistance = (() => {
        if (source === "loading" || source === "fallback") return initialDistance;

        const dist = getDistance(coords, { lat, lng });
        if (dist < 1) return `${(dist * 1000).toFixed(0)} m`;
        return `${dist.toFixed(1)} km`;
    })();

    // Helper to extract display name from potentially JSON stringified tags
    const getTagDisplay = (tag: string) => {
        try {
            // Check if it looks like JSON
            if (tag.startsWith('{')) {
                const parsed = JSON.parse(tag);
                return parsed.name || parsed.NAME || tag;
            }
            return tag;
        } catch {
            return tag;
        }
    };

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-zinc-700 hover:shadow-md transition-shadow duration-300">
            <div className="h-40 w-full relative">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <span
                        className="material-symbols-outlined text-yellow-500 fill-current"
                        style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}
                    >
                        star
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {rating}
                    </span>
                    <span className="text-xs text-slate-500">({reviews})</span>
                </div>
                {isPromo && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm">
                        Promo
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                            {name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                                    near_me
                                </span>{" "}
                                {displayDistance}
                            </span>
                            <span>•</span>
                            {isOpen ? (
                                <span className="text-green-600 dark:text-green-400 font-medium">Open now</span>
                            ) : (
                                <span>Closes {closesAt}</span>
                            )}
                            <span>•</span>
                            <span>{location}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {tags
                        .filter(tag => {
                            const display = getTagDisplay(tag);
                            return VALID_CATEGORIES.some(cat => cat.toLowerCase() === display.toLowerCase());
                        })
                        .slice(0, 3)
                        .map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 rounded-md bg-slate-100 dark:bg-zinc-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide"
                            >
                                {getTagDisplay(tag)}
                            </span>
                        ))}
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-medium uppercase">
                            Starting from
                        </span>
                        <span className="text-base font-bold text-primary">RM {price}</span>
                    </div>
                    <Button onClick={() => navigate("/bookings")} variant="primary" size="sm" className="rounded-lg h-auto py-2 px-5">
                        Book Now
                    </Button>
                </div>
            </div>
        </div>
    )
}
