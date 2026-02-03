import { useState, useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import { useChat } from "../../lib/chatState"
import { useUser } from "../../contexts/UserContext"
import { shopService } from "../../lib/shopService"
import type { Booking, Quote } from "../../lib/mockState"
import { cn } from "../../lib/utils"

export function OwnerJobDetails() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { bookings, workshops, quotes, refunds, updateBookingStatus } = useMockState()
    const { getOrCreateBookingChat } = useChat()
    const { user, switchRole } = useUser()

    const shopId = useMemo(() => {
        if (!user) return 'w1'
        if (user.workshopId) return user.workshopId;
        const shopData = shopService.getShopData(user.email)
        return workshops.find(w => w.name === shopData?.workshopName)?.id || 'w1'
    }, [user, workshops])
    const [booking, setBooking] = useState<Booking | null>(null)
    const [quote, setQuote] = useState<Quote | null>(null)

    useEffect(() => {
        if (id) {
            const b = bookings.find(item => item.id === id)
            if (b) {
                setBooking(b)
                if (b.quoteId) {
                    const q = quotes.find(item => item.id === b.quoteId)
                    if (q) setQuote(q)
                }
            }
        }
    }, [id, bookings, quotes])

    if (!booking) return <div className="p-4">Loading...</div>

    const updateStatus = (status: any) => {
        updateBookingStatus(booking.id, status)
        navigate(-1)
    }

    return (
        <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen pb-24 font-display">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Job Details</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">#{booking.id}</p>
                </div>
                <button
                    onClick={async () => {
                        if (!user) return
                        switchRole('owner')
                        const workshopName = workshops.find(w => w.id === shopId)?.name
                        const cid = await getOrCreateBookingChat(booking.customerId, shopId, booking.id, booking.customerName, workshopName)
                        navigate(`/messages/${cid}`)
                    }}
                    className="size-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined">chat</span>
                </button>
            </div>

            <div className="p-4 space-y-6">
                {/* Status Card */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                    {(() => {
                        const refund = refunds.find(r => r.bookingId === booking.id);
                        const isRefundApproved = refund?.status === 'Approved';
                        const isRefundRejected = refund?.status === 'Completed';
                        const displayStatus = isRefundApproved ? 'REFUNDED' : (isRefundRejected ? 'COMPLETED' : booking.status);

                        return (
                            <>
                                <div className={cn(
                                    "size-16 rounded-full flex items-center justify-center mb-3",
                                    displayStatus === 'REFUNDED' ? "bg-red-50 dark:bg-red-900/20" : "bg-blue-50 dark:bg-blue-900/20"
                                )}>
                                    <span className={cn(
                                        "material-symbols-outlined text-3xl",
                                        displayStatus === 'REFUNDED' ? "text-red-600" : "text-primary"
                                    )}>
                                        {displayStatus === 'REFUNDED' ? 'assignment_return' :
                                            displayStatus === 'PENDING' ? 'pending' :
                                                displayStatus === 'PAID' ? 'payments' :
                                                    displayStatus === 'REPAIRING' ? 'build' :
                                                        displayStatus === 'READY' ? 'check_circle' : 'inventory_2'}
                                    </span>
                                </div>
                                <h2 className={cn(
                                    "text-xl font-bold mb-1",
                                    displayStatus === 'REFUNDED' ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"
                                )}>{displayStatus}</h2>
                            </>
                        );
                    })()}
                    <p className="text-sm text-slate-500">Current Status</p>
                </div>

                {/* Vehicle & Customer */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-gray-200 overflow-hidden">
                            {/* Placeholder Car Image */}
                            <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=200&auto=format&fit=crop" alt="Car" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{booking.vehicleName}</h3>
                            <p className="text-sm text-slate-500">Customer: Ahmad Ali</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-zinc-800">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Date</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{new Date(booking.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Time</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{booking.time}</p>
                        </div>
                    </div>
                </div>

                {/* Refund Status - High Priority */}
                {refunds.find(r => r.bookingId === booking.id) && (
                    <div className={cn(
                        "p-4 rounded-xl border flex items-start gap-3",
                        ['Requested', 'Under Review', 'Shop Responded'].includes(refunds.find(r => r.bookingId === booking.id)?.status || '')
                            ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30"
                            : "bg-slate-50 dark:bg-zinc-800 border-slate-100 dark:border-zinc-700"
                    )}>
                        <span className={cn(
                            "material-symbols-outlined mt-0.5",
                            ['Requested', 'Under Review', 'Shop Responded'].includes(refunds.find(r => r.bookingId === booking.id)?.status || '')
                                ? "text-red-600 dark:text-red-400"
                                : "text-slate-500"
                        )}>assignment_return</span>
                        <div>
                            <h3 className={cn(
                                "font-bold",
                                ['Requested', 'Under Review', 'Shop Responded'].includes(refunds.find(r => r.bookingId === booking.id)?.status || '')
                                    ? "text-red-700 dark:text-red-400"
                                    : "text-slate-700 dark:text-slate-300"
                            )}>
                                Refund {refunds.find(r => r.bookingId === booking.id)?.status}
                            </h3>
                            <p className={cn(
                                "text-sm mt-1",
                                ['Requested', 'Under Review', 'Shop Responded'].includes(refunds.find(r => r.bookingId === booking.id)?.status || '')
                                    ? "text-red-600/80 dark:text-red-400/80"
                                    : "text-slate-500"
                            )}>
                                {['Requested', 'Under Review', 'Shop Responded'].includes(refunds.find(r => r.bookingId === booking.id)?.status || '')
                                    ? "Customer has requested a refund. Please review the case."
                                    : `This refund case has been ${refunds.find(r => r.bookingId === booking.id)?.status.toLowerCase()}.`}
                            </p>
                        </div>
                    </div>
                )}

                {/* Services / Quote */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-3">Service Details</h3>
                    {quote ? (
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm">Approved Quote</span>
                                    <span className="text-primary font-bold">RM {quote.total.toFixed(2)}</span>
                                </div>
                                <div className="space-y-1">
                                    {quote.items.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between text-xs text-slate-500">
                                            <span>{item.name}</span>
                                            <span>RM {item.price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Labor Charge</span>
                                        <span>RM {quote.labor.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {booking.services.map((s, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                                    <span>{s}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 p-4 pb-6 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                {refunds.find(r => r.bookingId === booking.id && ['Approved', 'Completed'].includes(r.status)) ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            Case Closed
                        </div>
                        <button
                            onClick={() => navigate(`/owner/disputes/${refunds.find(r => r.bookingId === booking.id)?.id}`)}
                            className="w-full py-3 rounded-xl font-bold text-slate-600 bg-slate-100 dark:bg-zinc-800"
                        >
                            View Resolution
                        </button>
                    </div>
                ) : (
                    <>
                        {booking.status === 'PENDING' && (
                            <div className="flex gap-3">
                                <button onClick={() => navigate(`/owner/quotes/create/${booking.id}`)} className="w-full py-3.5 rounded-xl font-bold text-white bg-primary shadow-lg shadow-blue-500/20 text-center">Create Quote</button>
                            </div>
                        )}
                        {booking.status === 'ACCEPTED' && (
                            <div className="flex gap-3">
                                <button onClick={() => updateStatus('REPAIRING')} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-purple-600 shadow-lg shadow-purple-500/20">Start Repair</button>
                                <button onClick={() => navigate(`/owner/quotes/create/${booking.id}`)} className="flex-1 py-3.5 rounded-xl font-bold text-primary bg-blue-50">Create Quote</button>
                            </div>
                        )}
                        {booking.status === 'PAID' && (
                            !refunds.find(r => r.bookingId === booking.id && ['Requested', 'Under Review', 'Shop Responded', 'Rejected'].includes(r.status)) ? (
                                <button onClick={() => updateStatus('REPAIRING')} className="w-full py-3.5 rounded-xl font-bold text-white bg-purple-600 shadow-lg shadow-purple-500/20">Start Repair</button>
                            ) : (
                                <button
                                    onClick={() => navigate(`/owner/disputes/${refunds.find(r => r.bookingId === booking.id)?.id}`)}
                                    className="w-full py-3.5 rounded-xl font-bold text-white bg-red-600 shadow-lg shadow-red-500/20"
                                >
                                    Review Refund Request
                                </button>
                            )
                        )}
                        {booking.status === 'REPAIRING' && (
                            !refunds.find(r => r.bookingId === booking.id && ['Requested', 'Under Review', 'Shop Responded', 'Rejected'].includes(r.status)) ? (
                                <button onClick={() => updateStatus('READY')} className="w-full py-3.5 rounded-xl font-bold text-white bg-green-600 shadow-lg shadow-green-500/20">Mark Ready for Pickup</button>
                            ) : (
                                <button
                                    onClick={() => navigate(`/owner/disputes/${refunds.find(r => r.bookingId === booking.id)?.id}`)}
                                    className="w-full py-3.5 rounded-xl font-bold text-white bg-red-600 shadow-lg shadow-red-500/20"
                                >
                                    Review Refund Request
                                </button>
                            )
                        )}
                        {booking.status === 'READY' && (
                            <button disabled className="w-full py-3.5 rounded-xl font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800">Waiting for Collection</button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
