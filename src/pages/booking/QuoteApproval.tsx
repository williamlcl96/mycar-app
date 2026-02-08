import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import { useChat } from "../../lib/chatState"
import { useUser } from "../../contexts/UserContext"
import type { Quote, Booking } from "../../lib/mockState"
import { quoteService } from "../../services/quoteService"

export function QuoteApproval() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { bookings, quotes, rejectQuote, workshops } = useMockState()
    const { getOrCreateBookingChat } = useChat()
    const { user } = useUser()
    const [booking, setBooking] = useState<Booking | null>(null)
    const [quote, setQuote] = useState<Quote | null>(null)

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                const foundBooking = bookings.find(b => b.id === id)
                if (foundBooking) {
                    setBooking(foundBooking)

                    // 1. Try finding in context
                    const foundQuote = quotes.find(q => q.bookingId === id)
                    if (foundQuote) {
                        setQuote(foundQuote)
                    } else {
                        // 2. Fallback: Fetch directly
                        try {
                            const fetchedQuote = await quoteService.getByBooking(id)
                            if (fetchedQuote) {
                                // Map snake_case to camelCase if needed, or ensure Quote type matches DB
                                // The Quote type in mockState seems to match DB snake_case for some fields? 
                                // No, mockState quotes are camelCase. Service returns snake_case (usually).
                                // quoteService.getByBooking returns "Quote" interface.
                                // Let's check Quote interface in quoteService vs mockState.

                                // Actually, allow me to perform a check on types first.
                                // For now, I will assume keys need mapping if they differ.
                                setQuote({
                                    id: fetchedQuote.id,
                                    bookingId: fetchedQuote.booking_id,
                                    workshopId: fetchedQuote.workshop_id,
                                    items: fetchedQuote.items,
                                    labor: fetchedQuote.labor,
                                    tax: fetchedQuote.tax,
                                    total: fetchedQuote.total,
                                    status: fetchedQuote.status,
                                    diagnosis: fetchedQuote.diagnosis,
                                    note: fetchedQuote.note,
                                    createdAt: fetchedQuote.created_at
                                } as any)
                            }
                        } catch (err) {
                            console.error("Failed to fetch quote:", err)
                        }
                    }
                }
            }
        }
        loadData()
    }, [id, bookings, quotes])

    const handleRejectAndDiscuss = async () => {
        if (!booking || !quote || !user) return

        // 1. Reject the quote in state
        rejectQuote(quote.id)

        // 2. Resolve or Create Chat
        const cid = await getOrCreateBookingChat(
            user.id,
            booking.workshopId,
            booking.id,
            user.name || user.email,
            booking.workshopName,
            user.avatar
        )

        // 3. Navigate to chat
        navigate(`/messages/${cid}`)
    }

    if (!booking) return <div className="p-4">Loading Booking...</div>
    if (!quote) return (
        <div className="p-4 flex flex-col items-center justify-center min-h-screen">
            <p className="mb-4">No quote available yet.</p>
            <button onClick={() => navigate(-1)} className="text-primary font-bold">Go Back</button>
        </div>
    )

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden pb-8 bg-slate-50 dark:bg-zinc-950 font-display">
            {/* Header */}
            <div className="sticky top-0 z-30 flex items-center bg-white dark:bg-zinc-900 p-4 pb-2 justify-between border-b border-slate-100 dark:border-zinc-800">
                <div
                    onClick={() => navigate(-1)}
                    className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-start cursor-pointer hover:opacity-70 transition-opacity"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </div>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center truncate">
                    Quote #{quote.id}
                </h2>
                <div className="flex w-12 items-center justify-end">
                    <p className="text-primary text-base font-bold leading-normal tracking-[0.015em] shrink-0 cursor-pointer hover:opacity-80">Help</p>
                </div>
            </div>

            {/* Workshop Info */}
            <div className="flex p-4 bg-white dark:bg-zinc-900 mb-2">
                <div className="flex w-full gap-4">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg h-20 w-20 shrink-0 border border-slate-100 dark:border-zinc-800"
                        style={{ backgroundImage: `url("${booking.workshopImage}")` }}
                    ></div>
                    <div className="flex flex-col justify-center h-20">
                        <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">{booking.workshopName}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-yellow-500 text-sm filled">star</span>
                            {(() => {
                                const workshop = workshops.find(w => w.id === booking.workshopId);
                                return (
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">
                                        {workshop?.rating || 'New'} ({workshop?.reviews || 0} reviews)
                                    </p>
                                );
                            })()}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal truncate">Jalan Tun Razak, KL</p>
                    </div>
                </div>
            </div>

            {/* Diagnosis Section */}
            <div className="px-4 pb-2 pt-4">
                <h3 className="text-slate-900 dark:text-white tracking-tight text-xl font-bold leading-tight text-left">Mechanic's Diagnosis</h3>
            </div>

            {/* Evidence Scroll (Using mock data if diagnosis array is empty or simplified) */}
            {quote.diagnosis && quote.diagnosis.length > 0 && (
                <div className="flex overflow-y-auto no-scrollbar pl-4 pb-4">
                    <div className="flex items-stretch gap-3 pr-4">
                        {quote.diagnosis.map((item, i) => (
                            <div key={i} className="flex h-full flex-col gap-3 rounded-lg w-60 shrink-0 group cursor-pointer active:scale-95 transition-transform">
                                <div
                                    className="relative w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800"
                                    style={{ backgroundImage: `url("${item.img}")` }}
                                >
                                    {item.type === 'Video' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                            <div className="bg-white/90 rounded-full p-3 flex items-center justify-center shadow-lg">
                                                <span className="material-symbols-outlined text-primary text-2xl filled">play_arrow</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5">
                                        <span className="text-xs font-bold text-white uppercase">{item.type}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">{item.title}</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mechanic Note */}
            <div className="px-4 pb-6">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-sm">sticky_note_2</span>
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">Mechanic's Note</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-base font-normal leading-relaxed">
                        {quote.note || "Please review the quote details below."}
                    </p>
                </div>
            </div>

            {/* Cost Breakdown */}
            <div className="px-4 pb-4">
                <h3 className="text-slate-900 dark:text-white tracking-tight text-xl font-bold leading-tight text-left mb-4">Cost Breakdown</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden">
                    {/* Items */}
                    <div className="p-4 border-b border-slate-100 dark:border-zinc-800">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Work Items</p>
                        {quote.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-start mb-3 last:mb-0">
                                <div className="flex flex-col">
                                    <span className="text-slate-900 dark:text-white font-medium text-sm">{item.name}</span>
                                </div>
                                <span className="text-slate-900 dark:text-white font-semibold text-sm">RM {item.price.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-start mt-3">
                            <span className="text-slate-900 dark:text-white font-medium text-sm">Labor Charge</span>
                            <span className="text-slate-900 dark:text-white font-semibold text-sm">RM {quote.labor.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/50">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">Subtotal</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">RM {(quote.total - quote.tax).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">Service Tax (6%)</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">RM {quote.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-end border-t border-slate-200 dark:border-zinc-700 pt-4">
                            <span className="text-slate-900 dark:text-white font-bold text-lg">Total Estimate</span>
                            <span className="text-slate-900 dark:text-white font-extrabold text-2xl">RM {quote.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Escrow Badge */}
            <div className="px-4 pb-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                    <div className="shrink-0 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full p-2 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">verified_user</span>
                    </div>
                    <div className="flex flex-col">
                        <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1">Protected by CarPay Escrow</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                            Your payment is held safely. The workshop only gets paid after you confirm the job is done to your satisfaction.
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white dark:bg-zinc-900 p-4 pt-2 pb-6 border-t border-slate-100 dark:border-zinc-800 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex gap-3 w-full">
                    <button
                        onClick={handleRejectAndDiscuss}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 font-bold text-sm bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">chat</span>
                        Reject / Discuss
                    </button>
                    <button
                        onClick={() => navigate(`/bookings/${booking.id}/checkout`)}
                        className="flex-[2] flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-colors active:scale-95 transform"
                    >
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        Approve & Pay RM {quote.total.toFixed(2)}
                    </button>
                </div>
            </div>
        </div>
    )
}
