import { useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import { cn } from "../../lib/utils"

export function RefundStatus() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { refunds, addRefundComment, bookings } = useMockState()

    // Support finding by booking ID or explicit case ID from location state
    const refundCase = refunds.find(r => r.bookingId === id || r.id === location.state?.caseId)
    const booking = bookings.find(b => b.id === id)

    const [newComment, setNewComment] = useState("")

    if (!refundCase) {
        return (
            <div className="p-8 text-center text-slate-500">
                Refund case not found.
            </div>
        )
    }

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        addRefundComment(refundCase.id, newComment, 'user')
        setNewComment("")
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Requested': return "bg-blue-100 text-blue-600 border-blue-200"
            case 'Under Review': return "bg-amber-100 text-amber-600 border-amber-200"
            case 'Shop Responded': return "bg-purple-100 text-purple-600 border-purple-200"
            case 'Approved': return "bg-green-100 text-green-600 border-green-200"
            case 'Rejected': return "bg-red-100 text-red-600 border-red-200"
            case 'Completed': return "bg-slate-100 text-slate-600 border-slate-200"
            default: return "bg-slate-100 text-slate-600"
        }
    }

    return (
        <div className="font-display bg-slate-50 dark:bg-zinc-950 min-h-screen flex flex-col">
            <header className="flex items-center bg-white dark:bg-zinc-900 px-4 py-4 border-b border-slate-100 dark:border-zinc-800">
                <button onClick={() => navigate('/bookings')} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-black uppercase tracking-tight ml-2">Refund Status</h1>
            </header>

            <main className="flex-1 p-6 flex flex-col max-w-lg mx-auto w-full space-y-6">
                {/* Summary Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Case ID</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{refundCase.id}</p>
                        </div>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            getStatusColor(refundCase.status)
                        )}>
                            {refundCase.status}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest">Booking Ref</span>
                            <span className="font-black text-slate-900 dark:text-white">#{refundCase.bookingId}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest">Workshop</span>
                            <span className="font-black text-slate-900 dark:text-white">{booking?.workshopName || 'Workshop'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-widest">Refund Amount</span>
                            <span className="font-black text-slate-900 dark:text-white">RM {refundCase.amount.toFixed(2)}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-50 dark:border-zinc-800">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{refundCase.reason}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{refundCase.description}</p>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-2">Progress Timeline</h2>
                    <div className="space-y-0 ml-4 border-l-2 border-slate-100 dark:border-zinc-800">
                        {refundCase.timeline.map((item, idx) => (
                            <div key={idx} className="relative pl-8 pb-8">
                                <div className={cn(
                                    "absolute left-[-9px] top-0 size-4 rounded-full border-4 border-slate-50 dark:border-zinc-950",
                                    idx === refundCase.timeline.length - 1 ? "bg-primary animate-pulse" : "bg-slate-200 dark:bg-zinc-800"
                                )} />
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.label}</h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(item.timestamp).toLocaleDateString()}</span>
                                </div>
                                {item.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{item.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Conversation / Comments */}
                <div className="space-y-4 pb-20">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-2">Messages</h2>
                    <div className="space-y-4">
                        {refundCase.comments.length === 0 ? (
                            <p className="text-center py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">No messages yet</p>
                        ) : (
                            refundCase.comments.map((comment) => (
                                <div key={comment.id} className={cn(
                                    "max-w-[85%] rounded-3xl p-4 shadow-sm",
                                    comment.authorRole === 'user'
                                        ? "bg-primary text-white ml-auto rounded-tr-none"
                                        : "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-100 dark:border-zinc-800 rounded-tl-none"
                                )}>
                                    <p className="text-sm font-bold leading-relaxed">{comment.text}</p>
                                    <p className={cn(
                                        "text-[9px] font-black uppercase tracking-widest mt-2",
                                        comment.authorRole === 'user' ? "text-white/60" : "text-slate-400"
                                    )}>
                                        {comment.authorRole === 'user' ? 'You' : 'Workshop'} • {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center disabled:opacity-50 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-xl">send</span>
                    </button>
                </form>
            </div>
        </div>
    )
}
