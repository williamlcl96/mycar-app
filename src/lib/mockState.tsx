import { useState, useEffect, createContext, useContext, useRef, type ReactNode } from "react"
import { useNotifications } from "./notifications"
import { useUser } from "../contexts/UserContext"
import { authService, type UserAccount } from "./authService"
import { supabase } from "./supabaseClient"
import {
    USE_SUPABASE,
    vehicleDataProvider,
    bookingDataProvider,
    quoteDataProvider,
    reviewDataProvider,
    refundDataProvider,
    workshopDataProvider
} from "./dataProvider"
import { calculateStartingPrice, isUUID, generateUUID } from "./utils"

const STORAGE_KEY_BOOKINGS = 'mycar_bookings'
const STORAGE_KEY_QUOTES = 'mycar_quotes'
const STORAGE_KEY_WORKSHOPS = 'mycar_workshops'

export interface Booking {
    id: string;
    customerId: string;
    workshopId: string;
    workshopName: string;
    workshopImage?: string;
    customerName: string;
    vehicleName: string;
    vehiclePlate?: string;
    serviceType: string;
    services: string[];
    date: string;
    time: string;
    status: 'PENDING' | 'ACCEPTED' | 'QUOTED' | 'PAID' | 'REPAIRING' | 'READY' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
    totalAmount?: number;
    createdAt: string;
    quoteId?: string;
}

export interface Quote {
    id: string;
    bookingId: string;
    workshopId: string;
    items: { name: string; price: number }[];
    labor: number;
    tax: number;
    total: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    diagnosis?: { type: string; title: string; desc: string; img: string }[];
    note?: string;
    createdAt: string;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    workshopId: string;
    bookingId: string;
    rating: number; // Overall
    pricingRating: number;
    attitudeRating: number;
    professionalRating: number;
    comment: string;
    reply?: string;
    repliedAt?: string;
    createdAt: string;
}

export type RefundStatus = 'Requested' | 'Under Review' | 'Shop Responded' | 'Approved' | 'Rejected' | 'Completed';

export interface RefundTimelineItem {
    status: RefundStatus;
    label: string;
    timestamp: string;
    description?: string;
}

export interface RefundComment {
    id: string;
    authorRole: 'user' | 'owner';
    text: string;
    timestamp: string;
}

export interface RefundCase {
    id: string;
    bookingId: string;
    workshopId: string;
    amount: number;
    reason: string;
    description: string;
    evidence?: string;
    status: RefundStatus;
    timeline: RefundTimelineItem[];
    comments: RefundComment[];
    createdAt: string;
}

export interface ServiceDetail {
    name: string;
    category: string;
    description?: string;
    price: string;
    icon: string;
    trending?: boolean;
}

export interface BusinessHours {
    open: string;  // "09:00"
    close: string; // "18:00"
    closedDays: string[]; // ["Sunday"]
}

export interface Vehicle {
    id: string;
    userId: string;
    name: string;
    plate: string;
    image: string;
    brand: string;
    model: string;
    year: string;
    capacity: string;
    isPrimary: boolean;
    createdAt: string;
}

export interface Workshop {
    id: string;
    name: string;
    rating: number;
    reviews: number;
    location: string;
    address: string;
    distance: string;
    image: string;
    specialties: string[];
    price: number;
    lat: number;
    lng: number;
    isVerified: boolean;
    experience: string;
    response: string;
    completed: string;
    businessHours: BusinessHours;
    services: ServiceDetail[];
    status: 'ACTIVE' | 'INACTIVE';
    ownerId?: string;
}

const initialWorkshops: Workshop[] = [
    {
        id: "w1",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbSmxVDPKZDivZe0LbrH5RtHH_48XqAPN4DrnZJ7oOaWlI2E5SCHNBH6hla2BUExxbx5hOJ-6jNvIl5kxFgbsjqSZFv6JtIOLiQ-S8__Rgiu4gWTKvKJsmzPE2GGPWVvdis9c7sQt5eRgGG-4p5btXkfD-_F1ia2hECz8APJ1j7KcEkYhcs3w1wdyNuQ6HcS7pkvk0IQJfgYpPWTOIE3srFtcvoETqT9TaRSnROR8ZOoihePXCP5Rb0bDszOCUPIgjkzQJ-Y4xiFs",
        name: "Ah Seng Auto Services",
        rating: 4.8,
        reviews: 128,
        distance: "1.2 km",
        location: "Petaling Jaya",
        address: "No. 12, Jalan SS2/67, 47300 Petaling Jaya, Selangor",
        specialties: ["Honda Specialist", "Air-cond", "Engine", "Brakes"],
        price: 80,
        lat: 3.1186,
        lng: 101.6215,
        isVerified: true,
        experience: "15+ Years",
        response: "< 10 mins",
        completed: "3.1k+ jobs",
        status: 'ACTIVE',
        businessHours: { open: "08:30", close: "18:30", closedDays: ["Sunday"] },
        services: [
            { name: "Executive Oil Change", category: "Engine", price: "RM 150", icon: "oil_barrel", trending: true, description: "Includes 21-point check and synthetic oil." },
            { name: "Brake Disc Turning", category: "Brakes", price: "RM 80", icon: "minor_crash", description: "Improve braking performance and eliminate vibration." }
        ]
    },
    {
        id: "w2",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXWI2dxMLGikSOa400FSFMqVYH2zXQZnnrq52NvE2D4Em-InE7uFLgEAnsjpt8N6PpGpJ0TuBpzQk3dnIPr6fuuXpUCOMDuegIvfdcE5Njsd5n5rpI7rqmEP-JDVqIsL6mkNRGNUgpGvPpEyomsZ7P2Xx1zd1QOBPI6l9yqwWm6Ya4UjoBcNwsM4q5HkTJzVSZXk5SuGwsd6WrbxHMVeMgo60vbYT8g5WhIhV4nNbGZWxnbnRarBnXztxqfKMVt9RTaAyJ4D46gQM",
        name: "ProTyre & Service Center",
        rating: 4.5,
        reviews: 84,
        distance: "3.5 km",
        location: "Damansara Uptown",
        address: "No. 45, Jalan SS 21/37, Damansara Utama, 47400 Petaling Jaya",
        specialties: ["Tires & Rims", "Alignment", "Balancing", "Suspension"],
        price: 50,
        lat: 3.1352,
        lng: 101.6231,
        isVerified: true,
        experience: "8+ Years",
        response: "< 20 mins",
        completed: "1.5k+ jobs",
        status: 'ACTIVE',
        businessHours: { open: "09:00", close: "19:00", closedDays: [] },
        services: [
            { name: "4-Wheel Alignment", category: "Tires", price: "RM 60", icon: "settings_input_component", trending: true },
            { name: "Tire Rotation", category: "Tires", price: "RM 20", icon: "published_with_changes" }
        ]
    },
    {
        id: "w3",
        image: "https://lh3.googleusercontent.com/p/AF1QipNivJpQv77G9t98f2u3XqX3V1_V9K9G9Y9Z9X9Z=s1360-w1360-h1020",
        name: "Ali's Auto Expert",
        rating: 4.9,
        reviews: 210,
        distance: "2.5 km",
        location: "Kuala Lumpur",
        address: "No. 42, Jalan Ampang Utama 1/2, 68000 Ampang Jaya, Selangor",
        specialties: ["Engine", "Major Service", "Transmission"],
        price: 150,
        lat: 3.1408,
        lng: 101.6841,
        isVerified: true,
        experience: "12+ Years",
        response: "< 15 mins",
        completed: "2.4k+ jobs",
        status: 'ACTIVE',
        businessHours: { open: "09:00", close: "19:00", closedDays: ["Sunday"] },
        services: [
            { name: "Oil Change Package", category: "Engine", price: "RM 120", icon: "oil_barrel", trending: true, description: "Fully Synthetic 4L + Filter" },
            { name: "Brake Pad Replace", category: "Brakes", price: "RM 180", icon: "minor_crash", description: "Front pair, high quality" },
            { name: "AC Gas Refill", category: "Air-cond", price: "RM 80", icon: "ac_unit", description: "R134a Recharge & Check" }
        ]
    },
    {
        id: "w4",
        image: "https://lh3.googleusercontent.com/p/AF1QipOiG3qXv9P_W4N1C9C7U6y8X9Q7O9N9Y9W9Z9X9=s1360-w1360-h1020",
        name: "Modern Car Care",
        rating: 4.6,
        reviews: 89,
        distance: "4.2 km",
        location: "Petaling Jaya",
        address: "Lot 5, Jalan Tandang, 46050 Petaling Jaya, Selangor",
        specialties: ["Body Paint", "Air-cond", "General", "Wash"],
        price: 200,
        lat: 3.1073,
        lng: 101.6067,
        isVerified: false,
        experience: "5+ Years",
        response: "< 30 mins",
        completed: "800+ jobs",
        status: 'ACTIVE',
        businessHours: { open: "10:00", close: "20:00", closedDays: ["Monday"] },
        services: [
            { name: "Full Body Respray", category: "Bodywork", price: "RM 2500", icon: "format_paint", trending: true },
            { name: "Deep Interior Cleaning", category: "General", price: "RM 150", icon: "cleaning_services" }
        ]
    }
]

const initialBookings: Booking[] = []

const initialReviews: Review[] = [
    {
        id: "rev1",
        userId: "u1",
        userName: "Ahmad Ali",
        workshopId: "w1",
        bookingId: "b-legacy-1",
        rating: 5,
        pricingRating: 5,
        attitudeRating: 5,
        professionalRating: 5,
        comment: "Excellent service! Ah Seng was very professional and the pricing was very fair. Highly recommended!",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
        id: "rev2",
        userId: "u3",
        userName: "Sarah Tan",
        workshopId: "w1",
        bookingId: "b-legacy-2",
        rating: 4,
        pricingRating: 4,
        attitudeRating: 5,
        professionalRating: 4,
        comment: "Good experience overall. Very friendly staff, though the wait was a bit long.",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
]

interface MockStateContextType {
    bookings: Booking[];
    quotes: Quote[];
    workshops: Workshop[];
    updateBookingStatus: (id: string, status: Booking['status']) => void;
    createQuote: (quote: Omit<Quote, 'id' | 'createdAt'>) => Promise<Quote>;
    addBooking: (booking: Booking) => Promise<void>;
    setWorkshops: (workshops: Workshop[]) => void;
    refunds: RefundCase[];
    createRefundCase: (data: Omit<RefundCase, 'id' | 'status' | 'timeline' | 'comments' | 'createdAt'>) => Promise<RefundCase>;
    resolveRefund: (caseId: string, resolution: 'Approved' | 'Rejected', shopMessage: string) => void;
    addRefundComment: (caseId: string, text: string, role: 'user' | 'owner') => void;
    clearAllData: () => void;
    reviews: Review[];
    addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
    withdrawQuote: (quoteId: string) => void;
    resendQuote: (quoteId: string) => void;
    rejectQuote: (quoteId: string) => void;
    cancelBooking: (bookingId: string) => void;
    replyToReview: (reviewId: string, reply: string) => void;
    vehicles: Vehicle[];
    addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => Promise<void>;
    deleteVehicle: (id: string) => void;
    updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
    setPrimaryVehicle: (id: string) => void;
}

const MockStateContext = createContext<MockStateContextType | undefined>(undefined);

export function MockStateProvider({ children }: { children: ReactNode }) {
    const { notify } = useNotifications();
    const { user } = useUser();
    const [bookings, setBookings] = useState<Booking[]>(() => {
        try {
            const b = localStorage.getItem(STORAGE_KEY_BOOKINGS);
            return b ? JSON.parse(b) : initialBookings;
        } catch (e) {
            console.error("Failed to parse bookings from localStorage:", e);
            return initialBookings;
        }
    });

    const [quotes, setQuotes] = useState<Quote[]>(() => {
        try {
            const q = localStorage.getItem(STORAGE_KEY_QUOTES);
            return q ? JSON.parse(q) : [];
        } catch (e) {
            console.error("Failed to parse quotes from localStorage:", e);
            return [];
        }
    });

    const [workshops, setWorkshops] = useState<Workshop[]>(() => {
        try {
            const w = localStorage.getItem(STORAGE_KEY_WORKSHOPS);
            const storedWorkshops = w ? JSON.parse(w) : initialWorkshops;

            // Healing: ensure all workshops have the new required fields
            // For new workshops (not in initialWorkshops), preserve their data from localStorage
            return storedWorkshops.map((sw: any) => {
                const initial = initialWorkshops.find(iw => iw.id === sw.id);
                return {
                    ...sw,
                    // If missing new fields, take from initial or use defaults
                    // IMPORTANT: Preserve sw.services from localStorage, only fallback to initial if missing
                    businessHours: sw.businessHours || initial?.businessHours || { open: "09:00", close: "18:00", closedDays: [] },
                    services: sw.services && sw.services.length > 0 ? sw.services : (initial?.services || []),
                    address: sw.address || initial?.address || sw.location || "Malaysia",
                    experience: sw.experience || initial?.experience || "10+ Years",
                    response: sw.response || initial?.response || "< 15 mins",
                    completed: sw.completed || initial?.completed || "1k+ jobs",
                    isVerified: sw.isVerified ?? initial?.isVerified ?? false,
                    status: sw.status || initial?.status || 'ACTIVE'
                };
            });
        } catch (e) {
            console.error("Failed to parse workshops from localStorage:", e);
            return initialWorkshops;
        }
    });

    const [reviews, setReviews] = useState<Review[]>(() => {
        try {
            const r = localStorage.getItem('mycar_reviews');
            const storedReviews = r ? JSON.parse(r) : initialReviews;

            // Healing: ensure all reviews have the required fields
            return storedReviews.map((sr: any) => ({
                ...sr,
                userName: sr.userName || "Anonymous",
                pricingRating: sr.pricingRating ?? 5,
                attitudeRating: sr.attitudeRating ?? 5,
                professionalRating: sr.professionalRating ?? 5,
                comment: sr.comment || "",
                createdAt: sr.createdAt || new Date().toISOString()
            }));
        } catch (e) {
            console.error("Failed to parse reviews from localStorage:", e);
            return initialReviews;
        }
    });

    const [refunds, setRefunds] = useState<RefundCase[]>(() => {
        try {
            const r = localStorage.getItem('mycar_refunds');
            const data = r ? JSON.parse(r) : [];
            // For this specific request, we force a clear if it's the first time
            return data;
        } catch (e) {
            console.error("Failed to parse refunds from localStorage:", e);
            return [];
        }
    });

    const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
        try {
            const v = localStorage.getItem('mycar_vehicles');
            return v ? JSON.parse(v) : [
                {
                    id: "v1",
                    userId: "u1",
                    name: "Proton X50",
                    plate: "WWA 1234",
                    brand: "proton",
                    model: "X50",
                    year: "2023",
                    capacity: "1500",
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIp3e3lqxq-7eAJnqR7LyaNMaZtNf1ICeYyPPPHAEMJu5HUqNIqnvpUnqX4meAcLmTdUrlOcdX1V4bFmy9UwdlPwaynuQ0z_6iHM5tIzR5dWNXTZA6HZNXLaNDp8lO_jiicPVzZ-60acGsU6Dexq-BAvQMEh_2hxHsp9-MUi54PUt5BDHv9WkZ9aQxHqz1d-NT3cGFJpd_OEg-Ilkpb-6bUkhDXKsT4iFtT7KHDPnOya50Ruw4G35--pzbJlolmYfG3T65ibm2tWk",
                    isPrimary: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: "v2",
                    userId: "u1",
                    name: "Perodua Myvi",
                    plate: "VBN 8829",
                    brand: "perodua",
                    model: "Myvi",
                    year: "2022",
                    capacity: "1300",
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_WQ4k4a-Wsn419CWooe8phQc7_CR1-OUDNJb8bkk-r7Lbc8S83M5tO3svbTk8zdpUKeWO2-lwe6p0u48cIlD8v2rwS6dH3HDrTQ9iJMHy6GqYWjw7N5vXx44SaHBIKAAvYoZg3FE_12dVjPqQblrYntFlf2K1s6YwmZfDqq3xDG4ZG9JzRz92gyhUYGewYc0Ueybxm82TYx9AOKunnR1ED-zAWHfEGs-QmiVHTfRtOSFIGQWC0mNJOvd3g5SR9ZibawXhNmrL-v4",
                    isPrimary: false,
                    createdAt: new Date().toISOString()
                }
            ];
        } catch (e) {
            console.error("Failed to parse vehicles from localStorage:", e);
            return [];
        }
    });

    // Supabase Data Sync
    useEffect(() => {
        const syncData = async () => {
            if (USE_SUPABASE && user?.id) {
                // Get the real Supabase Auth UUID (not the mock user ID)
                const { data: authData } = await supabase.auth.getUser();
                const supabaseUserId = authData?.user?.id;

                if (!supabaseUserId) {
                    console.log('ℹ️ No Supabase auth session - skipping data sync');
                    return;
                }

                console.log('🔄 Syncing data from Supabase for user:', supabaseUserId);
                try {
                    // Fetch Vehicles
                    const dbVehicles = await vehicleDataProvider.getAll(supabaseUserId);
                    if (dbVehicles) {
                        setVehicles(dbVehicles.map((v: any) => ({
                            id: v.id,
                            userId: v.user_id,
                            name: v.model || v.make + ' ' + v.model,
                            plate: v.plate_number,
                            brand: v.make,
                            model: v.model,
                            year: v.year?.toString() || '',
                            capacity: v.engine_capacity || '',
                            image: v.photo_url || 'https://placehold.co/150x150?text=Vehicle',
                            isPrimary: v.is_primary,
                            createdAt: v.created_at
                        })) as any);
                        console.log('✅ Synced vehicles:', dbVehicles.length);
                    }

                    // Fetch Bookings
                    console.log('🔄 Syncing bookings for user:', supabaseUserId);
                    const dbBookings = await bookingDataProvider.getByCustomer(supabaseUserId);
                    if (dbBookings) {
                        console.log('📦 Fetched bookings from Supabase:', dbBookings.map((b: any) => ({
                            id: b.id,
                            status: b.status,
                            quote_id: b.quote_id
                        })));

                        setBookings(dbBookings.map((b: any) => ({
                            id: b.id,
                            customerId: b.customer_id,
                            workshopId: b.workshop_id,
                            workshopName: b.workshop?.name || 'Unknown Workshop',
                            workshopImage: b.workshop?.image,
                            customerName: user?.name || 'Customer',
                            vehicleName: b.vehicle_name,
                            vehiclePlate: b.vehicle_plate,
                            serviceType: b.service_type,
                            services: b.services || [],
                            date: b.date,
                            time: b.time,
                            status: b.status,
                            totalAmount: b.total_amount,
                            createdAt: b.created_at,
                            quoteId: b.quote_id
                        })) as any);
                        console.log('✅ Synced bookings:', dbBookings.length);
                    }

                    // Fetch Workshops
                    const dbWorkshops = await workshopDataProvider.getAll();
                    if (dbWorkshops && dbWorkshops.length > 0) {
                        setWorkshops(dbWorkshops.map((w: any) => ({
                            id: w.id,
                            name: w.name,
                            rating: w.rating || 4.5,
                            reviews: w.reviews_count || 0,
                            location: w.location,
                            address: w.address,
                            distance: '0 km',
                            image: w.image || 'https://placehold.co/400x200?text=Workshop',
                            specialties: (w.specialties || []).filter(Boolean),
                            price: calculateStartingPrice(w.services || []),
                            lat: w.lat || 0,
                            lng: w.lng || 0,
                            isVerified: w.is_verified || false,
                            experience: w.experience || 'New',
                            response: w.response_time || '< 30 mins',
                            completed: w.completed_jobs || '0',
                            businessHours: w.business_hours || { open: '09:00', close: '18:00', closedDays: [] },
                            services: w.services || [],
                            status: w.status || 'ACTIVE',
                            ownerId: w.owner_id
                        })) as any);
                        console.log('✅ Synced workshops:', dbWorkshops.length);
                    }

                    // Fetch Refunds
                    const dbRefunds = await refundDataProvider.getByUser(supabaseUserId);
                    if (dbRefunds && dbRefunds.length > 0) {
                        setRefunds(dbRefunds.map((r: any) => ({
                            id: r.id,
                            bookingId: r.booking_id,
                            workshopId: r.workshop_id,
                            amount: r.amount,
                            reason: r.reason,
                            description: r.description,
                            evidence: r.evidence,
                            status: r.status,
                            timeline: r.timeline || [],
                            comments: (r.comments || []).map((c: any) => ({
                                id: c.id,
                                authorRole: c.author_role,
                                text: c.text,
                                timestamp: c.timestamp
                            })),
                            createdAt: r.created_at
                        })) as any);
                        console.log('✅ Synced refunds:', dbRefunds.length);
                    }

                    // Fetch Reviews
                    let allDbReviews: any[] = [];

                    // 1. If owner, fetch reviews for their workshop
                    if (user?.workshopId) {
                        const workshopReviews = await reviewDataProvider.getByWorkshop(user.workshopId);
                        if (workshopReviews) allDbReviews = [...allDbReviews, ...workshopReviews];
                    }

                    // 2. Also fetch reviews written by this user
                    const userReviews = await reviewDataProvider.getByUser(supabaseUserId);
                    if (userReviews) {
                        // Avoid duplicates if user is owner of their own workshop
                        const existingIds = new Set(allDbReviews.map(r => r.id));
                        const uniqueUserReviews = userReviews.filter(r => !existingIds.has(r.id));
                        allDbReviews = [...allDbReviews, ...uniqueUserReviews];
                    }

                    if (allDbReviews.length > 0) {
                        setReviews(allDbReviews.map((r: any) => ({
                            id: r.id,
                            userId: r.user_id,
                            userName: r.user_name,
                            workshopId: r.workshop_id,
                            bookingId: r.booking_id,
                            rating: r.rating,
                            pricingRating: r.pricing_rating,
                            attitudeRating: r.attitude_rating,
                            professionalRating: r.professional_rating,
                            comment: r.comment,
                            reply: r.reply || undefined,
                            repliedAt: r.replied_at || undefined,
                            createdAt: r.created_at
                        })));
                        console.log('✅ Synced reviews:', allDbReviews.length);
                    }
                } catch (err) {
                    console.error("❌ Failed to sync Supabase data:", err);
                }
            }
        }

        syncData();
    }, [user?.id]);

    const clearAllData = () => {
        setBookings([]);
        setQuotes([]);
        setRefunds([]);
        setReviews([]);
        setVehicles([]);
        localStorage.removeItem(STORAGE_KEY_BOOKINGS);
        localStorage.removeItem(STORAGE_KEY_QUOTES);
        localStorage.removeItem('mycar_refunds');
        localStorage.removeItem('mycar_reviews');
        localStorage.removeItem('mycar_vehicles');
        notify({
            userId: user?.id || 'system',
            role: 'customer',
            type: 'info',
            title: 'Data Reset',
            message: 'All bookings and quotes have been cleared.',
        });
    };

    const isInternalUpdate = useRef(false);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            try {
                if (e.key === STORAGE_KEY_BOOKINGS && e.newValue) {
                    isInternalUpdate.current = true;
                    setBookings(JSON.parse(e.newValue));
                }
                if (e.key === STORAGE_KEY_QUOTES && e.newValue) {
                    isInternalUpdate.current = true;
                    setQuotes(JSON.parse(e.newValue));
                }
                if (e.key === STORAGE_KEY_WORKSHOPS && e.newValue) {
                    isInternalUpdate.current = true;
                    setWorkshops(JSON.parse(e.newValue));
                }
            } catch (err) {
                console.error("Storage change sync failed:", err);
            }
        };

        // One-time reset requested by user
        const hasReset = localStorage.getItem('mycar_reset_v1');
        if (!hasReset) {
            clearAllData();
            localStorage.setItem('mycar_reset_v1', 'true');
        }

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
    }, [bookings]);

    useEffect(() => {
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(quotes));
    }, [quotes]);

    useEffect(() => {
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        localStorage.setItem(STORAGE_KEY_WORKSHOPS, JSON.stringify(workshops));
    }, [workshops]);

    useEffect(() => {
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        localStorage.setItem('mycar_refunds', JSON.stringify(refunds));
    }, [refunds]);

    useEffect(() => {
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        localStorage.setItem('mycar_reviews', JSON.stringify(reviews));
    }, [reviews]);

    useEffect(() => {
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        localStorage.setItem('mycar_vehicles', JSON.stringify(vehicles));
    }, [vehicles]);

    const updateBookingStatus = async (id: string, status: Booking['status']) => {
        // Optimistic update
        setBookings(prev => prev.map(b => b.id === id ? { ...b, ...status === 'QUOTED' ? b : { status } } : b));

        // Sync with Supabase (Only if ID is valid UUID)
        if (USE_SUPABASE) {
            if (isUUID(id)) {
                try {
                    await bookingDataProvider.updateStatus(id, status);
                    console.log(`✅ Booking ${id} status updated to ${status} in Supabase`);
                } catch (err: any) {
                    console.error('❌ Failed to update booking status in Supabase:', err);
                    alert(`Sync Error: Failed to update status to ${status}. Data may revert. Details: ${err.message || JSON.stringify(err)}`);
                }
            } else {
                console.warn(`⚠️ Skipped Supabase sync for booking ${id} (Mock ID)`);
            }
        }

        const booking = bookings.find(b => b.id === id);
        if (booking) {
            if (status === 'READY') {
                notify({
                    userId: booking.customerId,
                    role: 'customer',
                    type: 'pickup',
                    relatedBookingId: id,
                    title: 'Vehicle Ready',
                    message: `Your ${booking.vehicleName} is ready for pickup!`,
                });
            } else if (status === 'REPAIRING') {
                notify({
                    userId: booking.customerId,
                    role: 'customer',
                    type: 'repair',
                    relatedBookingId: id,
                    title: 'Repair Started',
                    message: `Work has started on your ${booking.vehicleName}.`,
                });
            } else if (status === 'PAID') {
                notify({
                    userId: booking.customerId,
                    role: 'customer',
                    type: 'payment',
                    relatedBookingId: id,
                    title: 'Payment Successful',
                    message: `Payment of RM ${booking.totalAmount?.toFixed(2) || '0.00'} confirmed for ${id}.`,
                });
                // Notify Owner
                const workshop = workshops.find(w => w.name === booking.workshopName || w.id === booking.workshopId);
                const ownerId = workshop?.ownerId || authService.getAccounts().find((a: UserAccount) => a.role === 'owner' && a.workshopName === booking.workshopName)?.id;

                if (ownerId) {
                    notify({
                        userId: ownerId,
                        role: 'owner',
                        type: 'payment',
                        relatedBookingId: id,
                        title: 'Payment Received',
                        message: `Customer ${booking.customerName} has paid RM ${booking.totalAmount?.toFixed(2) || '0.00'} for ${booking.vehicleName}.`,
                    });
                }
            } else if (status === 'ACCEPTED' && booking.status === 'QUOTED') {
                notify({
                    userId: booking.customerId,
                    role: 'customer',
                    type: 'booking',
                    relatedBookingId: id,
                    title: 'Quote Accepted',
                    message: `You have accepted the quote for ${id}.`,
                });
                // Notify Owner
                const workshop = workshops.find(w => w.name === booking.workshopName || w.id === booking.workshopId);
                const ownerId = workshop?.ownerId || authService.getAccounts().find((a: UserAccount) => a.role === 'owner' && a.workshopName === booking.workshopName)?.id;

                if (ownerId) {
                    notify({
                        userId: ownerId,
                        role: 'owner',
                        type: 'booking',
                        relatedBookingId: id,
                        title: 'Quote Approved',
                        message: `Customer ${booking.customerName} has approved your quote for RM ${booking.totalAmount?.toFixed(2) || '0.00'}.`,
                    });
                }
            } else if (status === 'COMPLETED') {
                // Notify Owner about revenue release from escrow
                const workshop = workshops.find(w => w.name === booking.workshopName || w.id === booking.workshopId);
                const ownerId = workshop?.ownerId || authService.getAccounts().find((a: UserAccount) => a.role === 'owner' && a.workshopName === booking.workshopName)?.id;

                if (ownerId) {
                    notify({
                        userId: ownerId,
                        role: 'owner',
                        type: 'payment',
                        relatedBookingId: id,
                        title: 'Payment Released',
                        message: `Funds for ${booking.vehicleName} (RM ${booking.totalAmount?.toFixed(2) || '0.00'}) have been released to your available balance.`,
                    });
                }
            }
        }

        if (['PAID', 'REPAIRING', 'READY', 'COMPLETED'].includes(status)) {
            setQuotes(prevQuotes => {
                const booking = bookings.find(b => b.id === id);
                if (booking && booking.quoteId) {
                    return prevQuotes.map(q => q.id === booking.quoteId ? { ...q, status: 'ACCEPTED' as const } : q);
                }
                return prevQuotes;
            });
        }
    };

    const createQuote = async (quote: Omit<Quote, 'id' | 'createdAt'>) => {
        const newQuote: Quote = {
            ...quote,
            id: generateUUID(),
            createdAt: new Date().toISOString()
        };

        // Push to Supabase if enabled
        if (USE_SUPABASE) {
            if (isUUID(quote.bookingId)) {
                try {
                    const created = await quoteDataProvider.create({
                        id: newQuote.id, // Explicit ID
                        booking_id: quote.bookingId,
                        workshop_id: quote.workshopId,
                        items: quote.items,
                        labor: quote.labor,
                        tax: quote.tax,
                        total: quote.total,
                        status: quote.status,
                        diagnosis: quote.diagnosis || [],
                        note: quote.note || null
                    });

                    if (created && created.id) {
                        console.log('✅ Quote pushed to Supabase with ID:', created.id);

                        // Link quote to booking in Supabase
                        try {
                            await bookingDataProvider.linkQuote(quote.bookingId, created.id);
                            console.log('✅ Quote linked to booking in Supabase');
                        } catch (linkErr: any) {
                            console.error('❌ Failed to link quote to booking:', linkErr);
                            alert(`Sync Error: Failed to link quote to booking. Details: ${linkErr.message}`);
                        }
                    }
                } catch (err: any) {
                    console.error('❌ Failed to push quote to Supabase:', err);
                    alert(`Sync Error: Failed to create quote. Details: ${err.message}`);
                }
            } else {
                console.warn(`⚠️ Skipped Supabase quote creation for booking ${quote.bookingId} (Mock ID)`);
            }
        }

        setQuotes(prev => [...prev, newQuote]);
        setBookings(prev => prev.map(b =>
            b.id === quote.bookingId ? { ...b, status: 'QUOTED', quoteId: newQuote.id, totalAmount: newQuote.total } : b
        ));

        // Notify user about the new quote
        const b = bookings.find(b => b.id === quote.bookingId);
        if (b) {
            notify({
                userId: b.customerId,
                role: 'customer',
                type: 'quote',
                relatedBookingId: b.id,
                title: 'New Quote Received',
                message: `${b.workshopName} has submitted a quote for RM ${newQuote.total.toFixed(2)}.`,
            });
        }

        return newQuote;
    };

    const addBooking = async (booking: Booking) => {
        // Generate a real UUID client-side to replace any Mock ID
        const realId = generateUUID();
        const newBooking = { ...booking, id: realId };

        // Always update local state for immediate UI feedback (using Real ID)
        setBookings(prev => [newBooking, ...prev]);

        // Push to Supabase if enabled
        if (USE_SUPABASE) {
            try {
                // Get the real Supabase auth user UUID
                const { data: authData } = await supabase.auth.getUser();
                const supabaseUserId = authData?.user?.id;

                if (supabaseUserId) {
                    const created = await bookingDataProvider.create({
                        id: newBooking.id, // Pass Explicit Real UUID
                        customer_id: supabaseUserId, // Use real UUID
                        workshop_id: booking.workshopId,
                        vehicle_id: null,
                        vehicle_name: booking.vehicleName,
                        vehicle_plate: booking.vehiclePlate || null,
                        service_type: booking.serviceType,
                        services: booking.services,
                        date: booking.date,
                        time: booking.time,
                        status: booking.status,
                        total_amount: booking.totalAmount || null,
                        quote_id: booking.quoteId || null
                    });

                    if (created && created.id) {
                        console.log('✅ Booking pushed to Supabase with ID:', created.id);
                    }
                    console.log('✅ Booking pushed to Supabase');
                } else {
                    console.error('❌ No Supabase auth user - cannot push booking');
                }
            } catch (err) {
                console.error('❌ Failed to push booking to Supabase:', err);
                alert(`Sync Error: Failed to create booking. Details: ${err}`);
            }
        }

        // Notify user about successful booking creation (Using Real ID)
        notify({
            userId: newBooking.customerId,
            role: 'customer',
            type: 'booking',
            relatedBookingId: newBooking.id,
            title: 'Booking Confirmed',
            message: `Your booking #${newBooking.id} with ${newBooking.workshopName} is being reviewed.`,
        });

        // Notify owner about the new job request
        const workshop = workshops.find(w => w.id === newBooking.workshopId || w.name === newBooking.workshopName);
        const ownerId = workshop?.ownerId || authService.getAccounts().find((a: UserAccount) => a.role === 'owner' && a.workshopName === newBooking.workshopName)?.id;

        if (ownerId) {
            notify({
                userId: ownerId,
                role: 'owner',
                type: 'booking',
                relatedBookingId: newBooking.id,
                title: 'New Job Request',
                message: `You have a new booking request for ${newBooking.vehicleName}.`,
            });
        }
    };

    const value: MockStateContextType = {
        bookings,
        quotes,
        workshops,
        updateBookingStatus,
        createQuote,
        addBooking,
        setWorkshops,
        refunds,
        createRefundCase: async (data: Omit<RefundCase, 'id' | 'status' | 'timeline' | 'comments' | 'createdAt'>) => {
            const newCase: RefundCase = {
                ...data,
                id: generateUUID(),
                status: 'Requested',
                timeline: [{
                    status: 'Requested',
                    label: 'Refund Requested',
                    timestamp: new Date().toISOString(),
                    description: 'Your refund request has been submitted and is under review.'
                }],
                comments: [],
                createdAt: new Date().toISOString()
            };

            // Push to Supabase if enabled
            if (USE_SUPABASE) {
                try {
                    // Get the real Supabase auth user UUID
                    const { data: authData } = await supabase.auth.getUser();
                    const supabaseUserId = authData?.user?.id;

                    if (supabaseUserId) {
                        await refundDataProvider.create({
                            id: newCase.id, // Explicit ID
                            booking_id: data.bookingId,
                            workshop_id: data.workshopId,
                            user_id: supabaseUserId, // Use real UUID
                            amount: data.amount,
                            reason: data.reason,
                            description: data.description,
                            evidence: data.evidence || null,
                            status: 'Requested',
                            timeline: newCase.timeline,
                            comments: []
                        });
                        console.log('✅ Refund pushed to Supabase');
                    } else {
                        console.error('❌ No Supabase auth user - cannot push refund');
                    }
                } catch (err) {
                    console.error('❌ Failed to push refund to Supabase:', err);
                }
            }

            setRefunds(prev => [...prev, newCase]);
            return newCase;
        },
        resolveRefund: async (caseId: string, resolution: 'Approved' | 'Rejected', shopMessage: string) => {
            // Sync with Supabase
            if (USE_SUPABASE) {
                if (isUUID(caseId)) {
                    try {
                        await refundDataProvider.updateStatus(caseId, resolution === 'Approved' ? 'Approved' : 'Rejected', shopMessage);

                        if (resolution === 'Approved') {
                            const rCase = refunds.find(r => r.id === caseId);
                            if (rCase?.bookingId) {
                                await bookingDataProvider.updateStatus(rCase.bookingId, 'CANCELLED');
                            }
                        }
                        console.log('✅ Refund resolved in Supabase');
                    } catch (err) {
                        console.error('❌ Failed to resolve refund in Supabase:', err);
                    }
                } else {
                    console.warn(`⚠️ Skipped Supabase update for refund ${caseId} (Mock ID)`);
                }
            }

            setRefunds(prev => prev.map(r => {
                if (r.id === caseId) {
                    const newStatus = resolution === 'Approved' ? 'Approved' : 'Rejected';
                    return {
                        ...r,
                        status: newStatus,
                        timeline: [
                            ...r.timeline,
                            {
                                status: 'Shop Responded',
                                label: 'Shop Responded',
                                timestamp: new Date().toISOString(),
                                description: shopMessage
                            },
                            {
                                status: newStatus,
                                label: resolution === 'Approved' ? 'Refund Approved' : 'Refund Rejected',
                                timestamp: new Date().toISOString(),
                                description: resolution === 'Approved'
                                    ? 'The shop has approved your refund. The amount will be credited back shortly.'
                                    : 'The shop has rejected your refund request.'
                            }
                        ]
                    };
                }
                return r;
            }));

            if (resolution === 'Approved') {
                setBookings(prev => prev.map(b => {
                    const rCase = refunds.find(r => r.id === caseId);
                    if (rCase && b.id === rCase.bookingId) {
                        return { ...b, status: 'CANCELLED' };
                    }
                    return b;
                }));
            }
        },
        addRefundComment: (caseId: string, text: string, role: 'user' | 'owner') => {
            setRefunds(prev => prev.map(r => {
                if (r.id === caseId) {
                    return {
                        ...r,
                        comments: [
                            ...r.comments,
                            {
                                id: Math.random().toString(36).substr(2, 9),
                                authorRole: role,
                                text,
                                timestamp: new Date().toISOString()
                            }
                        ]
                    };
                }
                return r;
            }));
        },
        clearAllData,
        reviews,
        addReview: async (review: Omit<Review, 'id' | 'createdAt'>) => {
            // Prevent duplicate reviews for the same booking
            if (reviews.some(r => r.bookingId === review.bookingId)) {
                console.warn(`Review already exists for booking ${review.bookingId}`);
                return;
            }

            const newReview: Review = {
                ...review,
                id: generateUUID(),
                createdAt: new Date().toISOString()
            };

            // Push to Supabase if enabled
            if (USE_SUPABASE) {
                try {
                    // Get the real Supabase auth user UUID
                    const { data: authData } = await supabase.auth.getUser();
                    const supabaseUserId = authData?.user?.id;

                    if (supabaseUserId) {
                        await reviewDataProvider.create({
                            user_id: supabaseUserId, // Use real UUID
                            user_name: review.userName,
                            workshop_id: review.workshopId,
                            booking_id: review.bookingId,
                            rating: review.rating,
                            pricing_rating: review.pricingRating,
                            attitude_rating: review.attitudeRating,
                            professional_rating: review.professionalRating,
                            comment: review.comment
                        });
                        console.log('✅ Review pushed to Supabase');
                    } else {
                        console.error('❌ No Supabase auth user - cannot push review');
                    }
                } catch (err) {
                    console.error('❌ Failed to push review to Supabase:', err);
                }
            }

            setReviews(prev => [newReview, ...prev]);

            // Update workshop rating and count locally
            setWorkshops(prev => prev.map(w => {
                if (w.id === review.workshopId) {
                    const shopReviews = [...reviews, newReview].filter(r => r.workshopId === w.id);
                    const newRating = shopReviews.reduce((acc, r) => acc + r.rating, 0) / shopReviews.length;
                    return {
                        ...w,
                        rating: Number(newRating.toFixed(1)),
                        reviews: shopReviews.length
                    };
                }
                return w;
            }));
        },
        replyToReview: (reviewId: string, reply: string) => {
            setReviews(prev => prev.map(r =>
                r.id === reviewId
                    ? { ...r, reply, repliedAt: new Date().toISOString() }
                    : r
            ));
        },
        withdrawQuote: async (quoteId: string) => {
            const quote = quotes.find(q => q.id === quoteId);
            if (!quote) return;

            // Sync with Supabase
            if (USE_SUPABASE) {
                if (isUUID(quoteId)) {
                    try {
                        await quoteDataProvider.delete(quoteId);
                        await bookingDataProvider.updateStatus(quote.bookingId, 'PENDING', { quote_id: null } as any);
                        console.log('✅ Quote withdrawn and booking reset in Supabase');
                    } catch (err) {
                        console.error('❌ Failed to withdraw quote in Supabase:', err);
                    }
                } else {
                    console.warn(`⚠️ Skipped Supabase delete for quote ${quoteId} (Mock ID)`);
                }
            }

            setQuotes(prev => prev.filter(q => q.id !== quoteId));
            setBookings(prev => prev.map(b =>
                b.id === quote.bookingId
                    ? { ...b, status: 'PENDING', quoteId: undefined }
                    : b
            ));

            // Notify user about quote withdrawal
            const b = bookings.find(b => b.id === quote.bookingId);
            if (b) {
                notify({
                    userId: b.customerId,
                    role: 'customer',
                    type: 'quote',
                    relatedBookingId: b.id,
                    title: 'Quote Withdrawn',
                    message: `${b.workshopName} has withdrawn their quote. Your booking is back to pending.`,
                });
            }
        },
        resendQuote: (quoteId: string) => {
            const quote = quotes.find(q => q.id === quoteId);
            if (!quote) return;

            const b = bookings.find(b => b.id === quote.bookingId);
            if (b) {
                notify({
                    userId: b.customerId,
                    role: 'customer',
                    type: 'quote',
                    relatedBookingId: b.id,
                    title: 'Quote Resubmitted',
                    message: `${b.workshopName} has resubmitted their quote for RM ${quote.total.toFixed(2)}.`,
                });
            }
        },
        rejectQuote: (quoteId: string) => {
            const quote = quotes.find(q => q.id === quoteId);
            if (!quote) return;

            setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'REJECTED' } : q));
            setBookings(prev => prev.map(b =>
                b.id === quote.bookingId
                    ? { ...b, status: 'PENDING', quoteId: undefined }
                    : b
            ));

            // Notify owner about rejection
            const booking = bookings.find(b => b.id === quote.bookingId);
            if (booking) {
                const ownerAcc = authService.getAccounts().find((a: UserAccount) => a.role === 'owner' && a.workshopName === booking.workshopName);
                if (ownerAcc?.id) {
                    notify({
                        userId: ownerAcc.id,
                        role: 'owner',
                        type: 'booking',
                        relatedBookingId: booking.id,
                        title: 'Quote Rejected',
                        message: `Customer ${booking.customerName} has rejected your quote for ${booking.vehicleName}.`,
                    });
                }
            }
        },
        cancelBooking: async (bookingId: string) => {
            // Sync with Supabase
            if (USE_SUPABASE) {
                if (isUUID(bookingId)) {
                    try {
                        await bookingDataProvider.updateStatus(bookingId, 'CANCELLED');
                        console.log('✅ Booking cancelled in Supabase:', bookingId);
                    } catch (err) {
                        console.error('❌ Failed to cancel booking in Supabase:', err);
                    }
                }
            }

            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));

            const booking = bookings.find(b => b.id === bookingId);
            if (booking) {
                // Notify Owner
                const ownerAcc = authService.getAccounts().find((a: UserAccount) => a.role === 'owner' && a.workshopName === booking.workshopName);
                if (ownerAcc?.id) {
                    notify({
                        userId: ownerAcc.id,
                        role: 'owner',
                        type: 'booking',
                        relatedBookingId: bookingId,
                        title: 'Booking Cancelled',
                        message: `Customer ${booking.customerName} has cancelled their booking for ${booking.vehicleName}.`,
                    });
                }
            }
        },
        vehicles,
        addVehicle: async (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => {
            const newVehicle: Vehicle = {
                ...vehicle,
                id: generateUUID(),
                createdAt: new Date().toISOString()
            };

            // Push to Supabase if enabled
            if (USE_SUPABASE) {
                // Get the real Supabase auth user UUID (not the mock user ID)
                const { data: authData } = await supabase.auth.getUser();
                const supabaseUserId = authData?.user?.id;

                if (!supabaseUserId) {
                    console.error('❌ No Supabase auth user found - cannot push vehicle');
                } else {
                    const vehiclePayload = {
                        id: newVehicle.id, // Explicit ID
                        user_id: supabaseUserId, // Use real UUID from Supabase Auth
                        name: vehicle.name,
                        plate: vehicle.plate,
                        image: vehicle.image || null,
                        brand: vehicle.brand || 'Unknown',
                        model: vehicle.model || 'Unknown',
                        year: vehicle.year || 'N/A',
                        capacity: vehicle.capacity || 'N/A',
                        is_primary: vehicle.isPrimary || false
                    };
                    console.log('📤 Attempting to push vehicle to Supabase:', JSON.stringify(vehiclePayload, null, 2));

                    try {
                        const result = await vehicleDataProvider.create(vehiclePayload);
                        console.log('✅ Vehicle pushed to Supabase, result:', result);
                    } catch (err: any) {
                        console.error('❌ Failed to push vehicle to Supabase');
                        console.error('Error:', err?.message || JSON.stringify(err));
                    }
                }
            }

            // If this is set as primary, unset others
            if (newVehicle.isPrimary) {
                setVehicles(prev => {
                    const updated = prev.map(v => ({ ...v, isPrimary: false }));
                    return [newVehicle, ...updated];
                });
            } else {
                setVehicles(prev => [...prev, newVehicle]);
            }

            notify({
                userId: vehicle.userId,
                role: 'customer',
                type: 'info',
                title: 'Vehicle Added',
                message: `Your ${vehicle.name} has been added successfully.`,
            });
        },
        deleteVehicle: async (id: string) => {
            // Delete from Supabase if enabled
            if (USE_SUPABASE) {
                try {
                    await vehicleDataProvider.delete(id);
                    console.log('✅ Vehicle deleted from Supabase:', id);
                } catch (err) {
                    console.error('❌ Failed to delete vehicle from Supabase:', err);
                }
            }
            setVehicles(prev => prev.filter(v => v.id !== id));
        },
        updateVehicle: async (id: string, updates: Partial<Vehicle>) => {
            // Push to Supabase if enabled
            if (USE_SUPABASE) {
                try {
                    const payload: any = {};
                    if (updates.name) payload.name = updates.name;
                    if (updates.plate) payload.plate = updates.plate;
                    if (updates.brand) payload.brand = updates.brand;
                    if (updates.model) payload.model = updates.model;
                    if (updates.year) payload.year = updates.year;
                    if (updates.capacity) payload.capacity = updates.capacity;
                    if (updates.isPrimary !== undefined) payload.is_primary = updates.isPrimary;
                    if (updates.image) payload.image = updates.image;

                    await vehicleDataProvider.update(id, payload);
                } catch (err) {
                    console.error('❌ Failed to update vehicle in Supabase:', err);
                }
            }

            setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));

            notify({
                userId: user?.id || 'system',
                role: 'customer',
                type: 'info',
                title: 'Vehicle Updated',
                message: `Your vehicle details have been updated.`,
            });
        },
        setPrimaryVehicle: (id: string) => {
            setVehicles(prev => prev.map(v => ({
                ...v,
                isPrimary: v.id === id
            })));
        }
    };

    return (
        <MockStateContext.Provider value={value}>
            {children}
        </MockStateContext.Provider>
    );
}

export function useMockState() {
    const context = useContext(MockStateContext);
    if (!context) {
        throw new Error("useMockState must be used within a MockStateProvider");
    }
    return context;
}
