import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const VALID_CATEGORIES = ['General', 'Engine', 'Oil', 'Brakes', 'Tires', 'Aircond', 'Paint', 'Electrical', 'Accessories'];

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
export function calculateStartingPrice(services: any[]): number {
    if (!services || services.length === 0) return 100;

    const prices = services.map(s => {
        // Handle "RM 150" or "150" format
        const priceStr = typeof s.price === 'string' ? s.price : String(s.price || '');
        const numeric = parseFloat(priceStr.replace(/[^\d.]/g, ''));
        return isNaN(numeric) ? Infinity : numeric;
    });

    const min = Math.min(...prices);
    return min === Infinity ? 100 : min;
}

export function normalizeSpecialty(s: string): string {
    if (!s) return '';
    try {
        if (typeof s === 'string' && s.startsWith('{')) {
            const parsed = JSON.parse(s);
            return parsed.name || parsed.NAME || s;
        }
        return s;
    } catch {
        return s;
    }
}

export function isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

export function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function getNextAvailableSlot(businessHours: { open: string, close: string, closedDays?: string[] }): string {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const isClosedToday = businessHours.closedDays?.includes(day);

    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

    if (isClosedToday || timeStr >= businessHours.close) {
        // Find next open day
        return 'Tomorrow, ' + businessHours.open;
    }

    if (timeStr < businessHours.open) {
        return 'Today, ' + businessHours.open;
    }

    // If open now, suggest 1 hour from now or next half hour
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    let hour = nextHour.getHours();
    let mins: string | number = nextHour.getMinutes() < 30 ? '30' : '00';
    if (mins === '00') hour++;

    const slotTime = `${hour.toString().padStart(2, '0')}:${mins}`;
    if (slotTime >= businessHours.close) {
        return 'Tomorrow, ' + businessHours.open;
    }

    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `Today, ${hour12}:${mins} ${ampm}`;
}
