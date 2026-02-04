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

export function getWorkshopStatus(businessHours: {
    open: string,
    close: string,
    closedDays?: string[],
    schedules?: Record<string, { open: string; close: string; isClosed: boolean }>
}) {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });

    // 1. Check day-specific schedule
    const schedule = businessHours.schedules?.[day];
    if (schedule) {
        if (schedule.isClosed) return { isOpen: false, message: "Closed Today" };
        const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        const isOpen = timeStr >= schedule.open && timeStr < schedule.close;
        return {
            isOpen,
            message: isOpen ? `Open until ${schedule.close}` : (timeStr < schedule.open ? `Opens at ${schedule.open}` : "Closed now"),
            closesAt: schedule.close
        };
    }

    // 2. Fallback to legacy/global logic
    const isClosedToday = businessHours.closedDays?.includes(day);
    if (isClosedToday) return { isOpen: false, message: "Closed Today" };

    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    const isOpen = timeStr >= businessHours.open && timeStr < businessHours.close;

    return {
        isOpen,
        message: isOpen ? `Open until ${businessHours.close}` : (timeStr < businessHours.open ? `Opens at ${businessHours.open}` : "Closed now"),
        closesAt: businessHours.close
    };
}

export function getNextAvailableSlot(businessHours: {
    open: string,
    close: string,
    closedDays?: string[],
    schedules?: Record<string, { open: string; close: string; isClosed: boolean }>
}): string {
    const status = getWorkshopStatus(businessHours);
    if (status.isOpen) {
        // Suggest 1 hour from now
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        let h = nextHour.getHours();
        let m = nextHour.getMinutes() < 30 ? '30' : '00';
        if (m === '00') h++;

        const slotTime = `${h.toString().padStart(2, '0')}:${m}`;
        if (status.closesAt && slotTime >= status.closesAt) return 'Tomorrow, ' + businessHours.open;

        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `Today, ${h12}:${m} ${ampm}`;
    }

    return (status.message.includes("Closed Today") || !status.message.includes("Opens at"))
        ? 'Tomorrow, ' + businessHours.open
        : 'Today, ' + status.message.replace('Opens at ', '');
}
