import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import type { Workshop } from "../../lib/mockState"
import type { Coordinates } from "../../lib/geoUtils"
import { calculateRadiusFromZoom } from "../../lib/geoUtils"

interface MapSearchProps {
    center: Coordinates;
    workshops: Workshop[];
    onCenterChange: (center: Coordinates, radius: number) => void;
    onWorkshopSelect: (id: string) => void;
}

export function MapSearch({ center, workshops, onCenterChange, onWorkshopSelect }: MapSearchProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const markers = useRef<maplibregl.Marker[]>([])
    const lastReported = useRef<string>("")
    const [hasError, setHasError] = useState(false)

    // Reactive jump to center when prop changes
    useEffect(() => {
        if (map.current && center) {
            console.log("[Map] Reactive jump to:", center)
            map.current.jumpTo({ center: [center.lng, center.lat] })
        }
    }, [center.lat, center.lng])

    const [zoom] = useState(13)

    useEffect(() => {
        if (!mapContainer.current) return

        try {
            // Initialize Map
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
                    layers: [
                        {
                            id: 'osm-layer',
                            type: 'raster',
                            source: 'osm',
                        },
                    ],
                },
                center: [center.lng, center.lat],
                zoom: zoom,
                // Performance and stability
                trackResize: true,
            })

            const m = map.current;
            if (!m) return;

            // Add Navigation Control safely
            m.addControl(new maplibregl.NavigationControl(), 'top-right')

            // Move End Handler - Framework agnostic logic trigger
            m.on('moveend', () => {
                const newCenter = m.getCenter()
                const newZoom = m.getZoom()
                const radiusMeters = calculateRadiusFromZoom(newZoom)

                // Avoid redundant updates
                const reportKey = `${newCenter.lat.toFixed(5)},${newCenter.lng.toFixed(5)},${newZoom.toFixed(1)}`
                if (lastReported.current !== reportKey) {
                    lastReported.current = reportKey
                    onCenterChange({ lat: newCenter.lat, lng: newCenter.lng }, radiusMeters)
                }
            })

        } catch (error) {
            console.error("MapLibre initialization failed:", error);
            setHasError(true)
        }

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [])

    // Update Markers when workshops change
    useEffect(() => {
        if (!map.current || hasError) return

        // Clear existing markers
        markers.current.forEach(m => m.remove())
        markers.current = []

        // Add new markers
        workshops.forEach(workshop => {
            // Defensive check: Skip workshops without valid coordinates
            if (workshop.lat === undefined || workshop.lng === undefined) return;

            const el = document.createElement('div')
            el.className = 'w-10 h-10 bg-primary text-white rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform'
            el.innerHTML = `<span class="material-symbols-outlined" style="font-size: 20px">home_repair_service</span>`

            el.onclick = () => onWorkshopSelect(workshop.id)

            if (!map.current) return;
            try {
                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat([workshop.lng, workshop.lat])
                    .addTo(map.current)

                markers.current.push(marker)
            } catch (e) {
                console.warn("Failed to add marker for workshop:", workshop.id, e);
            }
        })
    }, [workshops, hasError])

    if (hasError) {
        return (
            <div className="w-full h-[400px] rounded-2xl bg-slate-100 dark:bg-zinc-800 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 dark:border-zinc-700">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">map_off</span>
                <p className="font-bold text-slate-600 dark:text-slate-300">Map failed to load</p>
                <p className="text-sm text-slate-500 mt-1">Please ensure WebGL is enabled in your browser or use List View.</p>
            </div>
        )
    }

    return (
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-zinc-800">
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Overlay Info */}
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/20 inline-block pointer-events-auto">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Search Range</p>
                    <p className="text-sm font-bold text-primary">
                        {(calculateRadiusFromZoom(map.current?.getZoom() || 13) / 1000).toFixed(1)} km Radius
                    </p>
                </div>
            </div>
        </div>
    )
}
