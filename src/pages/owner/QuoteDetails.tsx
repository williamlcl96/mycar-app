import { useNavigate, useParams } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import { useState } from "react"

export function OwnerQuoteDetails() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { quotes, bookings } = useMockState()

    const quote = quotes.find(q => q.id === id)
    const booking = bookings.find(b => b.id === quote?.bookingId)
    const { withdrawQuote, resendQuote } = useMockState()

    const [isResending, setIsResending] = useState(false)

    if (!quote) return <div className="p-4">Quote not found</div>

    const handleWithdraw = () => {
        if (window.confirm("Are you sure you want to withdraw this quote?")) {
            withdrawQuote(quote.id)
            navigate('/owner/jobs')
        }
    }

    const handleResend = () => {
        setIsResending(true)
        resendQuote(quote.id)
        setTimeout(() => setIsResending(false), 2000)
    }

    return (
        <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen pb-24 font-display text-[#111418] dark:text-white">
            <div className="bg-white dark:bg-zinc-900 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">Quote Details #{quote.id}</h1>
            </div>

            <div className="p-4 space-y-6">
                {/* Status Card */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Status</p>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${quote.status === 'ACCEPTED' ? 'bg-green-50 text-green-600' :
                            quote.status === 'REJECTED' ? 'bg-red-50 text-red-600' :
                                'bg-yellow-50 text-yellow-600'
                            }`}>{quote.status}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Sent Date</p>
                        <p className="text-sm font-bold">{new Date(quote.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Booking Info */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Vehicle & Service</h3>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-base font-bold">{booking?.vehicleName || 'Unknown Vehicle'}{booking?.vehiclePlate ? ` • ${booking.vehiclePlate}` : ''}</span>
                        <span className="text-xs font-bold text-slate-400">#{booking?.id}</span>
                    </div>
                    <p className="text-primary text-sm font-bold">{booking?.serviceType}</p>
                </div>

                {/* Items */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-50 dark:border-zinc-800">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Work Breakdown</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {quote.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 font-medium">{item.name}</span>
                                <span className="text-sm font-black">RM {item.price.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 font-medium">Labor Charge</span>
                            <span className="text-sm font-black">RM {quote.labor.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-50 dark:border-zinc-800 pt-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">
                            <span>SST (6%)</span>
                            <span>RM {quote.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="font-black">Grand Total</span>
                            <span className="text-2xl font-black text-primary">RM {quote.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Mechanic's Note */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mechanic's Note</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        "The timing belt shows significant wear and needs immediate replacement to avoid engine damage. We'll also inspect the water pump while everything is disassembled."
                    </p>
                </div>
            </div>

            {quote.status === 'PENDING' && (
                <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-zinc-800 p-4 pb-6 flex gap-3 z-40">
                    <button
                        onClick={handleWithdraw}
                        className="flex-1 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs text-red-600 border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        Withdraw
                    </button>
                    <button
                        onClick={handleResend}
                        disabled={isResending}
                        className="flex-1 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs text-white bg-primary shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isResending ? 'Resending...' : 'Resend'}
                    </button>
                </div>
            )}
        </div>
    )
}
