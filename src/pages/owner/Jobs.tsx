import { useState, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import { useChat } from "../../lib/chatState"
import { useUser } from "../../contexts/UserContext"
import { shopService } from "../../lib/shopService"

// Utility for class names
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

export function OwnerJobsPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const initialTab = (searchParams.get('tab') as any) || 'REQUESTS'
    const { bookings, workshops, quotes, refunds, updateBookingStatus } = useMockState()
    const { getOrCreateBookingChat } = useChat()
    const { user, switchRole } = useUser()
    const [uiTab, setUiTab] = useState<'REQUESTS' | 'ACTIVE' | 'HISTORY'>(
        ['REQUESTS', 'ACTIVE', 'HISTORY'].includes(initialTab) ? initialTab : 'REQUESTS'
    )

    const shopId = useMemo(() => {
        if (!user) return 'w1'
        const shopData = shopService.getShopData(user.email)
        return workshops.find(w => w.name === shopData?.workshopName)?.id || 'w1'
    }, [user, workshops])

    const getTabForStatus = (booking: any) => {
        const refund = refunds.find(r => r.bookingId === booking.id)
        if (refund && ['Approved', 'Completed'].includes(refund.status)) return 'HISTORY'

        const status = booking.status
        if (['PENDING', 'QUOTED'].includes(status)) return 'REQUESTS'
        if (['PAID', 'ACCEPTED', 'REPAIRING', 'READY'].includes(status)) return 'ACTIVE'
        if (['COMPLETED', 'CANCELLED'].includes(status)) return 'HISTORY'
        return 'REQUESTS'
    }

    const myBookings = bookings.filter(b => b.workshopId === shopId)
    const filteredBookings = myBookings.filter(b => getTabForStatus(b) === uiTab)
    const pendingQuotesCount = myBookings.filter(b => b.status === 'PENDING' && !b.quoteId).length

    const handleStatusUpdate = (e: React.MouseEvent, id: string, newStatus: any) => {
        e.stopPropagation()
        updateBookingStatus(id, newStatus)
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 font-display">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Task Management</h1>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 dark:bg-zinc-800/50 p-1 rounded-xl">
                    {(['REQUESTS', 'ACTIVE', 'HISTORY'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setUiTab(tab)}
                            className={cn(
                                "flex-1 py-2 rounded-lg text-xs font-bold transition-all relative",
                                uiTab === tab
                                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                            )}
                        >
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                            {tab === 'REQUESTS' && pendingQuotesCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900">
                                    {pendingQuotesCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                {/* Pending Quote Alert in Requests Tab */}
                {uiTab === 'REQUESTS' && pendingQuotesCount > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl p-3 mb-2 flex items-center gap-3">
                        <span className="material-symbols-outlined text-orange-500">info</span>
                        <p className="text-xs font-medium text-orange-700 dark:text-orange-400">
                            You have <span className="font-bold">{pendingQuotesCount}</span> new request{pendingQuotesCount > 1 ? 's' : ''} that need a quote.
                        </p>
                    </div>
                )}

                {filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-2">inventory_2</span>
                        <p>No {uiTab.toLowerCase()} jobs</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => {
                            const quote = quotes.find(q => q.id === booking.quoteId)
                            return (
                                <div
                                    key={booking.id}
                                    onClick={() => navigate(`/owner/jobs/${booking.id}`)}
                                    className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{booking.vehicleName}</h3>
                                            <p className="text-xs text-slate-500">#{booking.id} • {booking.serviceType}</p>
                                        </div>
                                        {(() => {
                                            const refund = refunds.find(r => r.bookingId === booking.id);
                                            const isRefundApproved = refund?.status === 'Approved';
                                            const isRefundRejected = refund?.status === 'Completed';

                                            const displayStatus = isRefundApproved ? 'REFUNDED' : (isRefundRejected ? 'COMPLETED' : booking.status);

                                            return (
                                                <span className={cn(
                                                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                                    displayStatus === 'REFUNDED' ? "bg-red-100 text-red-700" :
                                                        displayStatus === 'PENDING' ? "bg-yellow-100 text-yellow-700" :
                                                            displayStatus === 'PAID' ? "bg-green-100 text-green-700" :
                                                                displayStatus === 'QUOTED' ? "bg-orange-100 text-orange-700" :
                                                                    displayStatus === 'ACCEPTED' ? "bg-blue-100 text-blue-700" :
                                                                        displayStatus === 'REPAIRING' ? "bg-purple-100 text-purple-700" :
                                                                            displayStatus === 'READY' ? "bg-green-100 text-green-700" :
                                                                                displayStatus === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" :
                                                                                    "bg-slate-100 text-slate-700"
                                                )}>
                                                    {displayStatus === 'PAID' ? 'Paid' :
                                                        displayStatus === 'QUOTED' ? 'Awaiting Approval' :
                                                            displayStatus}
                                                </span>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex flex-col gap-1 text-xs text-slate-500 mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                            <span>{new Date(booking.date).toLocaleDateString()}, {booking.time}</span>
                                        </div>
                                        {quote && (
                                            <div className="flex items-center gap-2 text-primary font-medium">
                                                <span className="material-symbols-outlined text-[16px]">description</span>
                                                <span>Quote: RM {quote.total.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 pt-3 border-t border-slate-50 dark:border-zinc-800">
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation()
                                                if (!user) return
                                                console.log('[DEBUG] OwnerJobsPage: Contact clicked', {
                                                    bookingId: booking.id,
                                                    workshopId: shopId,
                                                    customerId: booking.customerId
                                                });
                                                const result = switchRole('owner')
                                                console.log('[DEBUG] OwnerJobsPage: switchRole result', result);
                                                const cid = await getOrCreateBookingChat(booking.customerId, shopId, booking.id, booking.customerName, workshops.find(w => w.id === shopId)?.name)
                                                console.log('[DEBUG] OwnerJobsPage: Received cid', cid);
                                                navigate(`/messages/${cid}`)
                                            }}
                                            className="size-9 bg-slate-50 dark:bg-zinc-800 text-slate-400 flex items-center justify-center rounded-lg hover:text-primary transition-colors border border-slate-100 dark:border-zinc-800"
                                        >
                                            <span className="material-symbols-outlined text-sm">chat_bubble</span>
                                        </button>

                                        {uiTab !== 'HISTORY' && (
                                            <>
                                                {booking.status === 'PENDING' && !booking.quoteId && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/owner/quotes/create/${booking.id}`) }}
                                                        className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg"
                                                    >
                                                        Create Quote
                                                    </button>
                                                )}
                                                {booking.status === 'QUOTED' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/owner/quotes/${booking.quoteId}`) }}
                                                        className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-primary text-xs font-bold py-2 rounded-lg"
                                                    >
                                                        View Sent Quote
                                                    </button>
                                                )}
                                                {(booking.status === 'PAID' || booking.status === 'ACCEPTED') && (
                                                    !refunds.find(r => r.bookingId === booking.id && ['Requested', 'Under Review', 'Shop Responded', 'Rejected'].includes(r.status)) ? (
                                                        <button
                                                            onClick={(e) => handleStatusUpdate(e, booking.id, 'REPAIRING')}
                                                            className="flex-1 bg-purple-600 text-white text-xs font-bold py-2 rounded-lg"
                                                        >
                                                            Start Repair
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/owner/disputes/${refunds.find(r => r.bookingId === booking.id)?.id}`) }}
                                                            className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg"
                                                        >
                                                            Review Refund
                                                        </button>
                                                    )
                                                )}
                                                {booking.status === 'REPAIRING' && (
                                                    <button
                                                        onClick={(e) => handleStatusUpdate(e, booking.id, 'READY')}
                                                        className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg"
                                                    >
                                                        Mark Ready
                                                    </button>
                                                )}
                                                {booking.status === 'READY' && (
                                                    <div className="flex-1 text-center text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 py-2 rounded-lg">
                                                        Ready for Pickup
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
