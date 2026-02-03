import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Coordinates, simulateReverseGeocode } from "../lib/geoUtils";

export type LocationSource = "gps" | "manual" | "fallback" | "loading";

interface LocationState {
    coords: Coordinates;
    city: string; // Initially empty
    source: LocationSource;
    accuracy?: number;
    resolvedAt?: number;
    isLocked: boolean;
    isLoading: boolean;
    error: string | null;
}

interface LocationContextType extends LocationState {
    refreshLocation: (force?: boolean) => void;
    setManualLocation: (coords: Coordinates, city: string) => void;
}

const FALLBACK_LOCATION: Coordinates = { lat: 3.1073, lng: 101.6067 }; // Still used for map centering if GPS fails
const STORAGE_KEY = "mycar_user_location_v3"; // Version bump to wipe "Petaling Jaya" legacy data
const ACCURACY_THRESHOLD = 500;

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<LocationState>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.coords) {
                    return { ...parsed, isLoading: false };
                }
            }
        } catch (e) {
            console.error("[Location] Storage parse failed:", e);
        }

        return {
            coords: FALLBACK_LOCATION,
            city: "", // No hardcoded city
            source: "loading",
            isLocked: false,
            isLoading: true,
            error: null,
        };
    });

    const updateLocation = (newState: Partial<LocationState>) => {
        setState(prev => {
            const updated = { ...prev, ...newState };
            if (updated.source === "gps" || updated.source === "manual") {
                updated.isLocked = true;
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const resolveLocation = (coords: Coordinates, source: LocationSource, accuracy?: number) => {
        try {
            const result = simulateReverseGeocode(coords);
            const cityName = `${result.city}, MY`;
            console.log(`[Location] Display Name Resolved: ${cityName}`);

            updateLocation({
                coords,
                city: cityName,
                source,
                accuracy,
                resolvedAt: Date.now(),
                isLoading: false,
                error: null
            });
        } catch (e) {
            console.error("[Location] Reverse geocode failed:", e);
            updateLocation({ isLoading: false, source: "fallback", city: "" });
        }
    };

    const fetchGPS = (force: boolean = false) => {
        if (!force && state.isLocked && state.source !== "loading") return;

        if (!navigator.geolocation) {
            resolveLocation(FALLBACK_LOCATION, "fallback");
            return;
        }

        setState(prev => ({ ...prev, isLoading: true }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                if (accuracy > ACCURACY_THRESHOLD && !force) {
                    resolveLocation(FALLBACK_LOCATION, "fallback", accuracy);
                    return;
                }
                resolveLocation({ lat: latitude, lng: longitude }, "gps", accuracy);
            },
            (error) => {
                console.error("[Location] GPS Error:", error.message);
                if (state.source === "loading" || force) {
                    updateLocation({
                        source: "fallback",
                        isLoading: false,
                        city: "",
                        error: "Permission Denied"
                    });
                } else {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const setManualLocation = (coords: Coordinates, city: string) => {
        updateLocation({
            coords,
            city: city.includes(", MY") ? city : `${city}, MY`,
            source: "manual",
            isLocked: true,
            accuracy: 0,
            resolvedAt: Date.now(),
            isLoading: false
        });
    };

    useEffect(() => {
        if (state.source === "loading") {
            fetchGPS();
        }
    }, []);

    return (
        <LocationContext.Provider value={{
            ...state,
            refreshLocation: (force) => fetchGPS(force),
            setManualLocation
        }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error("useLocation must be used within a LocationProvider");
    }
    return context;
}
