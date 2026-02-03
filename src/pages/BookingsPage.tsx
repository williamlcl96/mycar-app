import { useNavigate } from "react-router-dom"
import { BottomNav } from "../components/layout/BottomNav"
import { useState } from "react"
import { useMockState } from "../lib/mockState"
import type { Booking } from "../lib/mockState"
import { useChat } from "../lib/chatState"
import { useUser } from "../contexts/UserContext"
import { cn } from "../lib/utils"

export function BookingsPage() {
    const navigate = useNavigate()
    const { bookings, updateBookingStatus, refunds, cancelBooking, reviews, workshops } = useMockState()
    const { getOrCreateBookingChat } = useChat()
    const { user, switchRole } = useUser()
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')
    const [reviewBookingId, setReviewBookingId] = useState<string | null>(null)
    const [confirmingReleaseId, setConfirmingReleaseId] = useState<string | null>(null)

    const activeBookings = bookings.filter(b => {
        const refund = refunds.find(r => r.bookingId === b.id)
        if (refund && ['Approved', 'Completed'].includes(refund.status)) return false
        return !['COMPLETED', 'CANCELLED'].includes(b.status)
    })

    const historyBookings = bookings.filter(b => {
        const refund = refunds.find(r => r.bookingId === b.id)
        if (refund && ['Approved', 'Completed'].includes(refund.status)) return true
        return ['COMPLETED', 'CANCELLED'].includes(b.status)
    })

    const displayBookings = activeTab === 'active' ? activeBookings : historyBookings

    const handleConfirmPickup = (bookingId: string) => {
        updateBookingStatus(bookingId, 'COMPLETED')
        setConfirmingReleaseId(null)
        setReviewBookingId(bookingId)
    }

    const getStatusIndex = (status: string) => {
        const mapping: Record<string, number> = {
            'PENDING': 0,
            'ACCEPTED': 1,
            'QUOTED': 1,
            'PAID': 2,
            'REPAIRING': 2,
            'READY': 3,
            'COMPLETED': 4
        }
        return mapping[status] ?? 0
    }

    return (
        <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-background-light dark:bg-background-dark overflow-x-hidden p-0 pb-20">
            <div className="flex items-center bg-white dark:bg-zinc-900 p-4 sticky top-0 z-50 shadow-sm border-b border-slate-200 dark:border-zinc-800">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center">My Bookings</h2>
            </div>

            <div className="bg-white dark:bg-zinc-900 px-4 pb-4 pt-2">
                <div className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 p-1">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={cn(
                            "flex-1 h-full rounded-md text-sm font-bold transition-all",
                            activeTab === 'active' ? "bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:bg-white/50"
                        )}
                    >
                        Active ({activeBookings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "flex-1 h-full rounded-md text-sm font-bold transition-all",
                            activeTab === 'history' ? "bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:bg-white/50"
                        )}
                    >
                        History ({historyBookings.length})
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 pb-24 flex flex-col gap-6">
                {displayBookings.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <p>No {activeTab} bookings found.</p>
                        {activeTab === 'active' && <button onClick={() => navigate('/')} className="text-primary font-bold mt-2">Book a Service</button>}
                    </div>
                ) : (
                    displayBookings.map(booking => (
                        <div key={booking.id} className="flex flex-col rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-3">
                                <div className="h-12 w-12 rounded-lg bg-slate-200 bg-center bg-cover shrink-0 flex items-center justify-center" style={{ backgroundImage: `url("https://images.unsplash.com/photo-1613214292775-430961239c89?q=80&w=200&auto=format&fit=crop")` }}>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{booking.workshopName}</h3>
                                        <div className="flex flex-col items-end gap-1">
                                            {(() => {
                                                const workshop = workshops.find(w => w.id === booking.workshopId);
                                                return (
                                                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-600 dark:text-yellow-400">
                                                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                        {workshop?.rating || 'New'}
                                                    </div>
                                                );
                                            })()}
                                            {(() => {
                                                const refund = refunds.find(r => r.bookingId === booking.id);
                                                const isRefundApproved = refund?.status === 'Approved';
                                                const isRefundRejected = refund?.status === 'Completed';
                                                const displayStatus = isRefundApproved ? 'REFUNDED' : (isRefundRejected ? 'COMPLETED' : booking.status);

                                                if (displayStatus === booking.status && !['COMPLETED', 'CANCELLED'].includes(booking.status)) return null;

                                                return (
                                                    <span className={cn(
                                                        "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                                        displayStatus === 'REFUNDED' ? "bg-red-100 text-red-600" :
                                                            displayStatus === 'COMPLETED' ? "bg-green-100 text-green-600" :
                                                                "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {displayStatus}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500">{booking.vehicleName} • #{booking.id}</p>
                                </div>
                            </div>

                            {/* Escrow Banner (Only if paid and not refunded) */}
                            {['REPAIRING', 'READY', 'COMPLETED'].includes(booking.status) &&
                                !refunds.find(r => r.bookingId === booking.id && r.status === 'Approved') && (
                                    <div className="bg-primary/10 px-4 py-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm">lock</span>
                                        <p className="text-xs font-bold text-primary">Payment Held in Escrow</p>
                                    </div>
                                )}

                            {/* Timeline */}
                            <div className="px-4 py-6">
                                <div className="relative flex flex-col gap-0">
                                    {/* Step 1: Booked */}
                                    <TimelineStep
                                        status={booking.status}
                                        currentStep={getStatusIndex(booking.status)}
                                        stepIndex={0}
                                        label="Booked"
                                        subLabel={booking.status === 'PENDING' ? "Waiting for workshop approval" : "Workshop has accepted your booking"}
                                    />

                                    {/* Step 2: Diagnose & Quote */}
                                    <TimelineStep
                                        status={booking.status}
                                        currentStep={getStatusIndex(booking.status)}
                                        stepIndex={1}
                                        label="Diagnose & Quote"
                                        subLabel={
                                            booking.status === 'ACCEPTED' ? "Diagnosis in progress" :
                                                booking.status === 'QUOTED' ? "Quote ready for approval" :
                                                    getStatusIndex(booking.status) > 1 ? "Diagnosis complete" : "Awaiting start"
                                        }
                                    />

                                    {/* Step 3: Repairing */}
                                    <TimelineStep
                                        status={booking.status}
                                        currentStep={getStatusIndex(booking.status)}
                                        stepIndex={2}
                                        label="Repairing"
                                        subLabel={
                                            booking.status === 'PAID' ? "Payment received. Awaiting repair to start" :
                                                booking.status === 'REPAIRING' ? "Work in progress" :
                                                    getStatusIndex(booking.status) > 2 ? "Repairs finished" : "Awaiting payment/parts"
                                        }
                                    />

                                    {/* Step 4: Ready for Pickup */}
                                    <TimelineStep
                                        status={booking.status}
                                        currentStep={getStatusIndex(booking.status)}
                                        stepIndex={3}
                                        label="Ready for Pickup"
                                        subLabel={booking.status === 'READY' ? "Please collect your vehicle" : "Waiting for final check"}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 pt-0 pb-6 flex flex-col items-center gap-3">
                                {booking.status === 'QUOTED' && (
                                    <button
                                        onClick={() => navigate(`/bookings/${booking.id}/quote`)}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-white transition-colors hover:bg-blue-600 font-bold text-sm shadow-md"
                                    >
                                        View Quote & Pay
                                    </button>
                                )}

                                {booking.status === 'READY' && (
                                    <button
                                        disabled={!!refunds.find(r => r.bookingId === booking.id)}
                                        onClick={() => setConfirmingReleaseId(booking.id)}
                                        className={cn(
                                            "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-white transition-colors font-bold text-sm shadow-md",
                                            !!refunds.find(r => r.bookingId === booking.id)
                                                ? "bg-slate-400 cursor-not-allowed shadow-none"
                                                : "bg-green-600 hover:bg-green-700"
                                        )}
                                    >
                                        {!!refunds.find(r => r.bookingId === booking.id) ? "Action Disabled (Dispute Active)" : "Confirm Pickup & Release Payment"}
                                    </button>
                                )}

                                <div className="flex gap-2 w-full mt-2">
                                    {booking.status === 'COMPLETED' && !reviews.some(r => r.bookingId === booking.id) && (
                                        <button
                                            onClick={() => navigate(`/bookings/${booking.id}/rate`)}
                                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 px-4 py-3 text-white font-bold text-sm shadow-md"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">star</span> Rate
                                        </button>
                                    )}
                                    <button
                                        onClick={async () => {
                                            if (!user) return navigate('/login')
                                            switchRole('customer')
                                            const cid = await getOrCreateBookingChat(user.id, booking.workshopId, booking.id, user.name || user.email, booking.workshopName, user.avatar)
                                            navigate(`/messages/${cid}`)
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-700 px-4 py-3 text-slate-700 dark:text-slate-300 font-bold text-sm"
                                    >
                                        <span className="material-symbols-outlined text-lg">chat_bubble</span> Contact
                                    </button>
                                    {['PENDING', 'ACCEPTED', 'QUOTED'].includes(booking.status) && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to cancel this booking?")) {
                                                    cancelBooking(booking.id)
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-red-600 dark:text-red-400 font-bold text-sm"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span> Cancel
                                        </button>
                                    )}
                                    {refunds.find(r => r.bookingId === booking.id) ? (
                                        <button
                                            onClick={() => navigate(`/bookings/${booking.id}/refund-status`)}
                                            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-primary font-bold text-sm"
                                        >
                                            <span className="material-symbols-outlined text-lg animate-pulse">gavel</span> Status
                                        </button>
                                    ) : (
                                        ['PAID', 'REPAIRING', 'READY'].includes(booking.status) && (
                                            <button
                                                onClick={() => navigate(`/bookings/${booking.id}/refund`)}
                                                className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                                            >
                                                Refund
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Payment Release Confirmation Modal */}
            {confirmingReleaseId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        <div className="p-8 text-center space-y-4">
                            <div className="size-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-orange-600 dark:text-orange-400">
                                <span className="material-symbols-outlined text-4xl">payments</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                                Release Payment?
                            </h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Once you confirm pickup, the payment will be released to the workshop.
                                <span className="block mt-2 font-bold text-red-500 uppercase text-[10px] tracking-widest">
                                    Refund will no longer be available.
                                </span>
                            </p>

                            <div className="pt-4 space-y-3">
                                <button
                                    onClick={() => handleConfirmPickup(confirmingReleaseId)}
                                    className="w-full py-4 rounded-2xl bg-orange-600 text-white font-black uppercase tracking-widest shadow-xl shadow-orange-500/25 hover:bg-orange-700 transition-all active:scale-[0.98]"
                                >
                                    Confirm & Release
                                </button>
                                <button
                                    onClick={() => setConfirmingReleaseId(null)}
                                    className="w-full py-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Prompt Modal */}
            {reviewBookingId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        <div className="relative h-32 bg-primary flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12" />
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16" />
                            </div>
                            <div className="size-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl relative z-10">
                                <span className="material-symbols-outlined text-white text-5xl animate-bounce">star</span>
                            </div>
                        </div>

                        <div className="p-8 text-center space-y-4">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                                Service Complete!
                            </h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Your payment has been released to the workshop. Would you like to share your experience with others?
                            </p>

                            <div className="pt-4 space-y-3">
                                <button
                                    onClick={() => {
                                        const id = reviewBookingId
                                        setReviewBookingId(null)
                                        navigate(`/bookings/${id}/rate`)
                                    }}
                                    className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/25 hover:bg-blue-600 transition-all active:scale-[0.98]"
                                >
                                    Rate Now
                                </button>
                                <button
                                    onClick={() => setReviewBookingId(null)}
                                    className="w-full py-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div >
    )
}

function TimelineStep({ currentStep, stepIndex, label, subLabel }: any) {
    const isCompleted = currentStep > stepIndex
    const isActive = currentStep === stepIndex
    const isLast = label === 'Ready for Pickup'

    return (
        <div className={cn("flex gap-4 relative group", !isLast && "pb-10")}>
            {!isLast && (
                <div className={cn(
                    "absolute left-[11px] top-6 w-0.5 h-full",
                    isCompleted ? "bg-primary" : "bg-slate-200 dark:bg-zinc-700"
                )}></div>
            )}

            <div className={cn(
                "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                isActive ? "bg-white dark:bg-zinc-900 border-primary" :
                    isCompleted ? "bg-primary border-primary" : "bg-slate-200 dark:bg-zinc-700 border-transparent shadow-inner"
            )}>
                {isCompleted && <span className="material-symbols-outlined text-[14px] font-bold text-white">check</span>}
                {isActive && <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>}
            </div>

            <div className="flex flex-col -mt-1">
                <p className={cn("text-sm font-bold", isActive ? "text-primary" : "text-slate-900 dark:text-white")}>{label}</p>
                <p className="text-xs text-slate-500">{subLabel}</p>
            </div>
        </div>
    )
}
