import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { useState, useMemo } from "react"
import { useMockState } from "../lib/mockState"
import { useChat } from "../lib/chatState"
import { useUser } from "../contexts/UserContext"
import { cn, calculateStartingPrice, normalizeSpecialty, getNextAvailableSlot, VALID_CATEGORIES } from "../lib/utils"
import { workshopDataProvider, USE_SUPABASE } from "../lib/dataProvider"
import type { Workshop as FrontendWorkshop } from "../lib/mockState"
import { useEffect } from "react"

export function WorkshopDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { workshops, reviews: allReviews } = useMockState()
    const { getOrCreateConsultation } = useChat()
    const { user, switchRole } = useUser()
    const [activeTab, setActiveTab] = useState<'services' | 'photos' | 'reviews'>('services')
    const [workshop, setWorkshop] = useState<FrontendWorkshop | null>(null)
    const [isFetchingLocal, setIsFetchingLocal] = useState(true)

    // Helper to transform Supabase workshop to Frontend workshop
    const transformWorkshop = (w: any): FrontendWorkshop => ({
        id: w.id,
        name: w.name,
        rating: w.rating || 0,
        reviews: w.reviews_count || 0,
        location: w.location,
        address: w.address,
        distance: '0 km',
        image: w.image || 'https://placehold.co/400x200?text=Workshop',
        specialties: (w.specialties || [])
            .map(normalizeSpecialty)
            .filter((s: string) => VALID_CATEGORIES.includes(s)),
        price: calculateStartingPrice(w.services || []),
        lat: w.lat || 0,
        lng: w.lng || 0,
        isVerified: w.is_verified || false,
        experience: w.experience || 'New',
        response: w.response_time || '< 30 mins',
        completed: w.completed_jobs || '0',
        businessHours: w.business_hours || { open: '09:00', close: '18:00', closedDays: [] },
        services: w.services || [],
        status: w.status || 'ACTIVE'
    });

    useEffect(() => {
        const loadWorkshop = async () => {
            if (!id) return;

            // 1. First try to find in existing mock state for immediate display
            const found = workshops.find(w => w.id === id);
            if (found) {
                setWorkshop(found);
            }

            // 2. Fetch fresh data from Supabase if configured
            if (USE_SUPABASE) {
                try {
                    const freshWorkshop = await workshopDataProvider.getById(id);
                    if (freshWorkshop) {
                        setWorkshop(transformWorkshop(freshWorkshop));
                    }
                } catch (err) {
                    console.error("Failed to fetch workshop details from Supabase:", err);
                }
            }
            setIsFetchingLocal(false);
        };

        loadWorkshop();
    }, [id, workshops]);

    const workshopReviews = useMemo(() => allReviews.filter(r => r.workshopId === id), [allReviews, id])

    const displayRating = useMemo(() => {
        if (!workshopReviews.length) return workshop?.rating || 0
        const sum = workshopReviews.reduce((acc, r) => acc + r.rating, 0)
        return (sum / workshopReviews.length).toFixed(1)
    }, [workshopReviews, workshop])

    const totalReviews = workshopReviews.length > 0 ? workshopReviews.length : (workshop?.reviews || 0)

    // Business Hours Logic
    const businessStatus = useMemo(() => {
        if (!workshop || !workshop.businessHours) return null;
        const now = new Date()
        const day = now.toLocaleDateString('en-US', { weekday: 'long' })
        const isClosedDay = workshop.businessHours.closedDays?.includes(day) || false

        const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0')
        const isOpenTime = timeStr >= workshop.businessHours.open && timeStr < workshop.businessHours.close

        return {
            isOpen: !isClosedDay && isOpenTime,
            message: isClosedDay ? "Closed Today" : (isOpenTime ? `Open until ${workshop.businessHours.close}` : `Opens at ${workshop.businessHours.open}`)
        }
    }, [workshop])

    if (!workshop && !isFetchingLocal) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">storefront</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Workshop Not Found</h2>
                <p className="text-sm text-slate-500 mb-6">The workshop you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => navigate('/')}>Back to Explore</Button>
            </div>
        )
    }

    if (!workshop && isFetchingLocal) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        )
    }

    // Safety check - workshop is guaranteed to be non-null here
    if (!workshop) return null;

    return (
        <div className="relative flex flex-col w-full max-w-md mx-auto bg-slate-50 dark:bg-zinc-950 shadow-xl min-h-screen overflow-x-hidden pb-24">
            {/* Header Image Section */}
            <div className="relative h-72 w-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%), url("${workshop.image}")`
                    }}
                />

                {/* Top Controls */}
                <div className="relative flex justify-between p-4 items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/40 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
                    </button>
                    <div className="flex gap-2">
                        <button className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/40 transition-colors">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                        <button className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/40 transition-colors">
                            <span className="material-symbols-outlined">favorite</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-6 left-5 right-5 flex justify-between items-end">
                    <div className="flex-1">
                        <h1 className="text-white text-3xl font-black leading-tight drop-shadow-lg">{workshop.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-md">
                                <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="text-white text-xs font-bold">{displayRating}</span>
                            </div>
                            <span className="text-white/80 text-xs font-medium">{totalReviews} Reviews</span>
                        </div>
                    </div>
                    {workshop.isVerified && (
                        <div className="bg-primary text-white p-2 rounded-full shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-xl">verified</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Quick Info */}
            <div className="p-4 bg-white dark:bg-zinc-900 grid grid-cols-3 divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex flex-col items-center gap-1 px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{workshop.experience || "10+ Years"}</span>
                </div>
                <div className="flex flex-col items-center gap-1 px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Response</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white tracking-tighter">{workshop.response || "< 15 mins"}</span>
                </div>
                <div className="flex flex-col items-center gap-1 px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{workshop.completed || "1k+ jobs"}</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 bg-white dark:bg-zinc-900 flex gap-3">
                <Button
                    onClick={() => navigate(`/workshops/${id}/book`)}
                    disabled={workshop.status === 'INACTIVE' || (workshop.services?.length || 0) === 0}
                    className="flex-1 h-14 rounded-2xl text-sm font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-xl">event_available</span>
                    {(workshop.services?.length || 0) === 0 ? "No Services Available" : "Book Service"}
                </Button>
                <button
                    onClick={async () => {
                        if (!user) return navigate('/login')
                        switchRole('customer')
                        const cid = await getOrCreateConsultation(user.id, workshop.id, user.name || user.email, workshop.name, user.avatar)
                        navigate(`/messages/${cid}`)
                    }}
                    className="size-14 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors border border-slate-100 dark:border-zinc-800"
                >
                    <span className="material-symbols-outlined">chat</span>
                </button>
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${workshop.lat},${workshop.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-14 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors border border-slate-100 dark:border-zinc-800"
                >
                    <span className="material-symbols-outlined">directions</span>
                </a>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-zinc-800 px-4">
                <div className="flex gap-8">
                    {['services', 'photos', 'reviews'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "py-4 text-xs font-black uppercase tracking-widest relative transition-all",
                                activeTab === tab
                                    ? "text-primary ml-1"
                                    : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_6px_rgba(59,130,246,0.3)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 pb-12">
                {/* Location & Contact Info Card */}
                <div className="p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-zinc-800 p-6 shadow-sm overflow-hidden relative">
                        {/* Map Gradient / Hint */}
                        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-slate-50 dark:from-zinc-800/50 to-transparent pointer-events-none opacity-50" />

                        <div className="flex gap-6 relative z-10">
                            <div className="flex-1">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    Where to Find Us
                                </h3>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-4 leading-relaxed">
                                    {workshop.address}
                                </p>

                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "size-2.5 rounded-full shadow-[0_0_6px]",
                                        businessStatus?.isOpen ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50"
                                    )} />
                                    <span className={cn(
                                        "text-xs font-black uppercase tracking-widest",
                                        businessStatus?.isOpen ? "text-green-500" : "text-red-500"
                                    )}>
                                        {businessStatus?.isOpen ? "Open Now" : "Closed Now"}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        • {businessStatus?.message}
                                    </span>
                                </div>
                                <div className="mt-3 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Operating Hours</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Mon - Sat: {workshop.businessHours.open} - {workshop.businessHours.close}
                                    </p>
                                    {workshop.businessHours.closedDays && workshop.businessHours.closedDays.length > 0 && (
                                        <p className="text-[10px] text-red-400 font-medium mt-1 italic">
                                            Closed on: {workshop.businessHours.closedDays.join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center border border-slate-100 dark:border-zinc-800 shadow-inner group cursor-pointer" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${workshop.lat},${workshop.lng}`, '_blank')}>
                                <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">map</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Categories (Specialties) */}
                {activeTab === 'services' && workshop.specialties && workshop.specialties.length > 0 && (
                    <div className="px-4 mt-4 space-y-3">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Categories Offered</h3>
                        <div className="flex flex-wrap gap-2 px-1">
                            {workshop.specialties.map((cat, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-wider"
                                >
                                    {cat}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Items Catalog */}
                {activeTab === 'services' && (
                    <div className="px-4 mt-6 space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Items & Pricing</h3>
                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</button>
                        </div>

                        <div className="space-y-3">
                            {(workshop.services?.length || 0) === 0 ? (
                                <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-zinc-800/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-zinc-800">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">shopping_basket</span>
                                    <p className="text-sm font-bold">No individual items listed yet</p>
                                    <p className="text-xs mt-1">Check back later for updates</p>
                                </div>
                            ) : (
                                (workshop.services || []).map((service, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-slate-100 dark:border-zinc-800 flex items-center gap-4 group cursor-pointer hover:border-primary/20 transition-all shadow-sm"
                                        onClick={() => navigate(`/workshops/${id}/book`)}
                                    >
                                        <div className="size-14 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-primary flex items-center justify-center border border-slate-100 dark:border-zinc-800 group-hover:bg-primary/5 transition-colors">
                                            <span className="material-symbols-outlined text-2xl">{service.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{service.name}</p>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 dark:bg-zinc-800 rounded-full border border-slate-100 dark:border-zinc-800">
                                                    {service.category}
                                                </span>
                                            </div>
                                            {service.description && (
                                                <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{service.description}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{service.price}</p>
                                            {service.trending && (
                                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-tight">Popular</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Reviews Catalog */}
                {activeTab === 'reviews' && (
                    <div className="px-4 mt-2 space-y-6">
                        {/* Rating Stats Card */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
                            <div className="flex items-end gap-4 mb-4">
                                <span className="text-5xl font-black text-slate-900 dark:text-white leading-none">{displayRating}</span>
                                <div className="flex flex-col gap-1 pb-1">
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="material-symbols-outlined text-base" style={{ fontVariationSettings: i < Math.floor(Number(displayRating)) ? "'FILL' 1" : "" }}>star</span>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{totalReviews} Reviews</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: 'Pricing', icon: 'payments', value: (workshopReviews.reduce((acc, r) => acc + (r.pricingRating || 5), 0) / (workshopReviews.length || 1)).toFixed(1) },
                                    { label: 'Attitude', icon: 'sentiment_satisfied', value: (workshopReviews.reduce((acc, r) => acc + (r.attitudeRating || 5), 0) / (workshopReviews.length || 1)).toFixed(1) },
                                    { label: 'Professional', icon: 'engineering', value: (workshopReviews.reduce((acc, r) => acc + (r.professionalRating || 5), 0) / (workshopReviews.length || 1)).toFixed(1) },
                                ].map((stat) => (
                                    <div key={stat.label} className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">{stat.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                                <span className="text-[10px] font-black text-primary">{stat.value}/5.0</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full"
                                                    style={{ width: `${(Number(stat.value) / 5) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center px-2 pt-2">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Feedback</h3>
                        </div>

                        {workshopReviews.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 text-center space-y-2">
                                <span className="material-symbols-outlined text-4xl text-slate-200">rate_review</span>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">No reviews yet</p>
                                <p className="text-xs text-slate-500">Be the first to share your experience!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {workshopReviews.map((review) => (
                                    <div key={review.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm hover:border-primary/20 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/10">
                                                    {review.userName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{review.userName}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-0.5 text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-1 rounded-lg">
                                                <span className="text-xs font-black mr-1">{review.rating.toFixed(1)}</span>
                                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4">
                                            {review.comment || "The workshop provided excellent service and was very professional."}
                                        </p>

                                        {review.reply && (
                                            <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-4 border-l-2 border-primary">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Workshop Response</span>
                                                    <span className="text-[9px] text-slate-400 font-bold">{new Date(review.repliedAt!).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">
                                                    "{review.reply}"
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: 'Pricing', val: review.pricingRating, icon: 'payments' },
                                                { label: 'Attitude', val: review.attitudeRating, icon: 'sentiment_satisfied' },
                                                { label: 'Pro', val: review.professionalRating, icon: 'engineering' }
                                            ].map(tag => tag.val && (
                                                <div key={tag.label} className="flex items-center gap-1 bg-slate-50 dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-slate-100 dark:border-zinc-800">
                                                    <span className="material-symbols-outlined text-[10px] text-slate-400">{tag.icon}</span>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{tag.label} {tag.val}/5</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews Summary Peek */}
                <div className="p-4 mt-4">
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-[2.5rem] p-8 border border-primary/10 flex flex-col items-center text-center">
                        <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <span key={i} className="material-symbols-outlined text-primary" style={{ fontVariationSettings: i <= Math.floor(Number(displayRating)) ? "'FILL' 1" : "" }}>star</span>
                            ))}
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">
                            Loved by {totalReviews} Customers
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px]">
                            Consistently rated {displayRating} stars for speed and transparency.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sticky Floating Footer */}
            <div className="fixed bottom-20 left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-none">
                <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-slate-200/50 dark:border-zinc-800/50 p-5 rounded-[2.5rem] shadow-2xl pointer-events-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Available</span>
                        <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                            <p className="text-xs font-black text-slate-900 dark:text-white">
                                {workshop.businessHours ? getNextAvailableSlot(workshop.businessHours) : 'Available Soon'}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate(`/workshops/${id}/book`)}
                        disabled={workshop.status === 'INACTIVE' || (workshop.services?.length || 0) === 0}
                        className="px-8 h-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/25"
                    >
                        {(workshop.services?.length || 0) === 0 ? "No Services" : "Secure Spot"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
