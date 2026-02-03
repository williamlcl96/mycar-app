import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import type { Coordinates } from "../../lib/geoUtils"
import { simulateGeocode } from "../../lib/geoUtils"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"

interface LocationPickerProps {
    initialCenter: Coordinates;
    onLocationChange: (coords: Coordinates) => void;
    placeholderAddress?: string;
}

export function LocationPicker({ initialCenter, onLocationChange, placeholderAddress }: LocationPickerProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const marker = useRef<maplibregl.Marker | null>(null)
    const [searchQuery, setSearchQuery] = useState(placeholderAddress || "")
    const [isLocating, setIsLocating] = useState(false)
    const [hasError, setHasError] = useState(false)

    // Sync search query when address changes from parent (e.g. pin move)
    useEffect(() => {
        if (placeholderAddress) {
            setSearchQuery(placeholderAddress);
        }
    }, [placeholderAddress]);

    useEffect(() => {
        if (!mapContainer.current) return

        try {
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: {
                    version: 8,
                    sources: {
                        'osm': {
                            type: 'raster',
                            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                            tileSize: 256,
                            attribution: '&copy; OpenStreetMap Contributors',
                        },
                    },
                    layers: [{ id: 'osm-layer', type: 'raster', source: 'osm' }],
                },
                center: [initialCenter.lng, initialCenter.lat],
                zoom: 15,
            })

            const m = map.current
            m.addControl(new maplibregl.NavigationControl(), 'top-right')

            // Create Draggable Marker
            const el = document.createElement('div')
            el.className = 'flex items-center justify-center'
            el.innerHTML = `
                <div class="relative flex flex-col items-center">
                    <div class="bg-primary text-white size-10 rounded-full border-4 border-white shadow-xl flex items-center justify-center mb-1">
                        <span class="material-symbols-outlined" style="font-size: 24px">location_on</span>
                    </div>
                    <div class="w-1.5 h-1.5 bg-primary rounded-full ring-4 ring-primary/20 animate-ping absolute -bottom-0.5"></div>
                </div>
            `

            marker.current = new maplibregl.Marker({
                element: el,
                draggable: true
            })
                .setLngLat([initialCenter.lng, initialCenter.lat])
                .addTo(m)

            marker.current.on('dragend', () => {
                const lngLat = marker.current?.getLngLat()
                if (lngLat) {
                    onLocationChange({ lat: lngLat.lat, lng: lngLat.lng })
                }
            })

            // Click to move pin
            m.on('click', (e) => {
                marker.current?.setLngLat(e.lngLat)
                onLocationChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })
            })

        } catch (error) {
            console.error("Map initialization failed:", error)
            setHasError(true)
        }

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [])

    const handleSearch = () => {
        if (!searchQuery.trim() || !map.current) return

        setIsLocating(true)
        // Simulate geocoding delay
        setTimeout(() => {
            const coords = simulateGeocode(searchQuery)
            map.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 16 })
            marker.current?.setLngLat([coords.lng, coords.lat])
            onLocationChange(coords)
            setIsLocating(false)
        }, 600)
    }

    if (hasError) {
        return (
            <div className="w-full h-[300px] rounded-2xl bg-slate-100 dark:bg-zinc-800 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 dark:border-zinc-700">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">map_off</span>
                <p className="font-bold text-slate-600 dark:text-slate-300">Map failed to load</p>
                <p className="text-sm text-slate-500 mt-1">Check your connection or try again later.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search address or landmark..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                    onClick={handleSearch}
                    isLoading={isLocating}
                    className="px-6"
                >
                    Locate
                </Button>
            </div>

            <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm">
                <div ref={mapContainer} className="absolute inset-0" />

                {/* Visual Guidance Overlay */}
                <div className="absolute top-4 left-4 right-4 pointer-events-none">
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20 shadow-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">touch_app</span>
                        Search or drag the pin to pinpoint your workshop location.
                    </div>
                </div>
            </div>
        </div>
    )
}
