/**
 * Framework-agnostic geographic utilities.
 * These functions use standard mathematical formulas (Haversine) 
 * and do not rely on Web-only or React Native-specific APIs.
 */

export interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Calculates the distance between two points in kilometers using the Haversine formula.
 */
export function getDistance(pt1: Coordinates, pt2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = (pt2.lat - pt1.lat) * Math.PI / 180;
    const dLng = (pt2.lng - pt1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pt1.lat * Math.PI / 180) * Math.cos(pt2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Determines a search radius (in meters) based on the current map zoom level.
 */
export function calculateRadiusFromZoom(zoom: number): number {
    const baseRadius = 40000; // Radius at zoom 0 in meters (abstract)
    const radius = baseRadius / Math.pow(2, zoom - 8);
    return Math.min(Math.max(radius, 500), 50000);
}

/**
 * Checks if a point is within visible map bounds.
 */
export interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

export function isWithinBounds(point: Coordinates, bounds: MapBounds): boolean {
    const isLatWithin = point.lat <= bounds.north && point.lat >= bounds.south;
    if (bounds.west <= bounds.east) {
        return isLatWithin && point.lng >= bounds.west && point.lng <= bounds.east;
    } else {
        return isLatWithin && (point.lng >= bounds.west || point.lng <= bounds.east);
    }
}

/**
 * Simulates a geocoding service.
 * Returns slightly randomized coordinates around KL for any address.
 */
export function simulateGeocode(address: string, city?: string): Coordinates {
    // Deterministic randomness based on address string
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offsetLat = (hash % 200) / 2000 - 0.05;
    const offsetLng = (hash % 200) / 2000 - 0.05;

    // Default to KL
    let baseLat = 3.1390;
    let baseLng = 101.6869;

    const lowerCity = (city || address).toLowerCase();
    if (lowerCity.includes("penang") || lowerCity.includes("george town")) {
        baseLat = 5.4141; baseLng = 100.3288;
    } else if (lowerCity.includes("johor") || lowerCity.includes("bahru")) {
        baseLat = 1.4927; baseLng = 103.7414;
    } else if (lowerCity.includes("sabah") || lowerCity.includes("kinabalu")) {
        baseLat = 5.9804; baseLng = 116.0735;
    } else if (lowerCity.includes("sarawak") || lowerCity.includes("kuching")) {
        baseLat = 1.5533; baseLng = 110.3592;
    } else if (lowerCity.includes("ipoh") || lowerCity.includes("perak")) {
        baseLat = 4.5975; baseLng = 101.0901;
    }

    return {
        lat: baseLat + offsetLat,
        lng: baseLng + offsetLng
    };
}

export interface ReverseGeocodeResult {
    address: string;
    city: string;
    postcode: string;
}

/**
 * Simulates reverse geocoding.
 * Returns a structured Malaysian address based on coordinates.
 */
export function simulateReverseGeocode(coords: Coordinates): ReverseGeocodeResult {
    const streetNames = [
        "Jalan Ampang", "Jalan Sultan Ismail", "Jalan Tun Razak", "Jalan Gasing",
        "Jalan SS2/6", "Jalan Telawi", "Jalan Bangsar", "Jalan Kiara",
        "Jalan Hutton", "Jalan Gurney", "Jalan Wong Ah Fook", "Jalan Gaya",
        "Jalan Satok", "Jalan Merdeka", "Jalan Birch", "Jalan Sultan Abu Bakar"
    ];
    const cities = [
        "Kuala Lumpur", "Petaling Jaya", "Subang Jaya", "Shah Alam",
        "George Town", "Butterworth", "Johor Bahru", "Kota Kinabalu",
        "Kuching", "Ipoh", "Melaka", "Kuantan", "Seremban", "Alor Setar",
        "Kota Bharu", "Kuala Terengganu"
    ];
    const postcodes = [
        "50450", "47300", "47500", "40000",
        "10050", "12000", "80000", "88000",
        "93000", "30000", "75000", "25000", "70000", "05000",
        "15000", "20000"
    ];

    // Deterministic selection based on coordinates
    const seed = Math.abs(Math.floor(coords.lat * 10000 + coords.lng * 10000));
    const streetIndex = seed % streetNames.length;

    // Better city selection based on latitude zones (rough approximation for Malaysia)
    let cityIndex = seed % cities.length;

    // Rough heuristic to keep northern cities north, southern cities south etc.
    if (coords.lat > 5) cityIndex = (seed % 4) + 4; // Northern/Borneo (Penang/Sabah/Sarawak/Kedah)
    else if (coords.lat < 2) cityIndex = 6; // Johor Bahru
    else if (coords.lng > 110) cityIndex = (seed % 2) + 7; // Sabah/Sarawak

    return {
        address: `No. ${(seed % 150) + 1}, ${streetNames[streetIndex]}`,
        city: cities[cityIndex],
        postcode: postcodes[cityIndex]
    };
}
