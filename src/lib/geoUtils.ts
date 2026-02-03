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
export function simulateGeocode(address: string, _city?: string): Coordinates {
    // Deterministic randomness based on address string
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offsetLat = (hash % 100) / 1000;
    const offsetLng = (hash % 80) / 1000;

    // Base KL coordinates
    return {
        lat: 3.1390 + offsetLat - 0.05,
        lng: 101.6869 + offsetLng - 0.04
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
    const streetNames = ["Jalan Ampang", "Jalan Sultan Ismail", "Jalan Tun Razak", "Jalan Gasing", "Jalan SS2/6", "Jalan Telawi", "Jalan Bangsar", "Jalan Kiara"];
    const cities = ["Kuala Lumpur", "Petaling Jaya", "Subang Jaya", "Shah Alam", "Puchong", "Cheras", "Ampang", "Mont Kiara"];
    const postcodes = ["50450", "47300", "47500", "40000", "47100", "56000", "68000", "50480"];

    // Deterministic selection based on coordinates
    const seed = Math.abs(Math.floor(coords.lat * 10000 + coords.lng * 10000));
    const streetIndex = seed % streetNames.length;
    const regionIndex = seed % cities.length;
    const houseNumber = (seed % 150) + 1;

    return {
        address: `No. ${houseNumber}, ${streetNames[streetIndex]}`,
        city: cities[regionIndex],
        postcode: postcodes[regionIndex]
    };
}
