import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import { Button } from "../../components/ui/Button"
import { cn } from "../../lib/utils"

export function RefundResolution() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { refunds, resolveRefund, addRefundComment, bookings } = useMockState()

    const refundCase = refunds.find(r => r.id === id)
    const booking = bookings.find(b => b ? b.id === refundCase?.bookingId : false)

    const [responseMessage, setResponseMessage] = useState("")
    const [resolution, setResolution] = useState<'Approved' | 'Rejected' | null>(null)
    const [newComment, setNewComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!refundCase) {
        return (
            <div className="p-8 text-center text-slate-500">
                Refund case not found.
            </div>
        )
    }

    const isResolved = refundCase.status === 'Approved' || refundCase.status === 'Rejected' || refundCase.status === 'Completed'

    const handleResolve = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!resolution || !responseMessage.trim()) return

        setIsSubmitting(true)
        try {
            // Simulate API call
            await new Promise(r => setTimeout(r, 1000))
            resolveRefund(refundCase.id, resolution, responseMessage)
            // No navigate - stay on page to show new status
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        addRefundComment(refundCase.id, newComment, 'owner')
        setNewComment("")
    }

    return (
        <div className="font-display bg-slate-50 dark:bg-zinc-950 min-h-screen flex flex-col pb-20">
            <header className="flex items-center bg-white dark:bg-zinc-900 px-4 py-4 border-b border-slate-100 dark:border-zinc-800">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="ml-2">
                    <h1 className="text-lg font-black uppercase tracking-tight leading-none">Review Dispute</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Case {refundCase.id}</p>
                </div>
            </header>

            <main className="flex-1 p-6 flex flex-col max-w-lg mx-auto w-full space-y-6">
                {/* Dispute Details */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                refundCase.status === 'Approved' ? "bg-green-100 text-green-600 border-green-200" :
                                    refundCase.status === 'Rejected' ? "bg-red-100 text-red-600 border-red-200" :
                                        "bg-blue-100 text-blue-600 border-blue-200"
                            )}>
                                {refundCase.status}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Disputed Amount</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white italic">RM {refundCase.amount.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest">Customer</span>
                            <span className="font-black text-slate-900 dark:text-white uppercase">{booking?.customerName || 'Customer'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest">Vehicle</span>
                            <span className="font-black text-slate-900 dark:text-white uppercase">{booking?.vehicleName || 'Vehicle'}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-50 dark:border-zinc-800">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Claimed Reason</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{refundCase.reason}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{refundCase.description}</p>
                        </div>
                    </div>
                </div>

                {/* Owner Action Area */}
                {!isResolved ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-primary/20 shadow-xl shadow-primary/5">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Resolve Dispute</h3>
                        <form onSubmit={handleResolve} className="space-y-6">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setResolution('Approved')}
                                    className={cn(
                                        "flex-1 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all",
                                        resolution === 'Approved' ? "bg-green-500 text-white border-green-600 shadow-lg" : "border-slate-100 dark:border-zinc-800 text-slate-500"
                                    )}
                                >
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setResolution('Rejected')}
                                    className={cn(
                                        "flex-1 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all",
                                        resolution === 'Rejected' ? "bg-red-500 text-white border-red-600 shadow-lg" : "border-slate-100 dark:border-zinc-800 text-slate-500"
                                    )}
                                >
                                    Reject
                                </button>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Response (Sent to Customer)</label>
                                <textarea
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                    placeholder="Explain your decision..."
                                    className="w-full h-24 px-4 py-3 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={!resolution || !responseMessage.trim() || isSubmitting}
                                className="w-full h-14 rounded-2xl text-base font-black uppercase tracking-widest"
                            >
                                {isSubmitting ? "Processing..." : "Submit Resolution"}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 text-center">
                        <span className="material-symbols-outlined text-slate-400 text-4xl mb-2">task_alt</span>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">This dispute is closed.</p>
                    </div>
                )}

                {/* Messages */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-2">Conversation History</h2>
                    <div className="space-y-4">
                        {refundCase.comments.length === 0 ? (
                            <p className="text-center py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">No messages yet</p>
                        ) : (
                            refundCase.comments.map((comment) => (
                                <div key={comment.id} className={cn(
                                    "max-w-[85%] rounded-3xl p-4 shadow-sm",
                                    comment.authorRole === 'owner'
                                        ? "bg-slate-900 text-white ml-auto rounded-tr-none"
                                        : "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-100 dark:border-zinc-800 rounded-tl-none"
                                )}>
                                    <p className="text-sm font-bold leading-relaxed">{comment.text}</p>
                                    <p className={cn(
                                        "text-[9px] font-black uppercase tracking-widest mt-2",
                                        comment.authorRole === 'owner' ? "text-white/60" : "text-slate-400"
                                    )}>
                                        {comment.authorRole === 'owner' ? 'You (Workshop)' : 'Customer'} • {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Sticky Comment Input */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-slate-100 dark:border-zinc-800">
                <form onSubmit={handleAddComment} className="max-w-lg mx-auto flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Message customer..."
                        className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="size-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center disabled:opacity-50 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-xl">send</span>
                    </button>
                </form>
            </div>
        </div>
    )
}
