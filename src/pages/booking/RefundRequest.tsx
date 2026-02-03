import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import { Button } from "../../components/ui/Button"
import { cn } from "../../lib/utils"

const REFUND_REASONS = [
    "Service not completed",
    "Poor service quality",
    "Wrong service provided",
    "Overcharged",
    "Other"
]

export function RefundRequest() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { bookings, createRefundCase } = useMockState()

    const booking = bookings.find(b => b.id === id)

    const [reason, setReason] = useState("")
    const [description, setDescription] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!booking) {
        return (
            <div className="p-8 text-center text-slate-500">
                Booking not found.
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!reason) {
            setError("Please select a refund reason.")
            return
        }
        if (!description.trim() || description.length < 10) {
            setError("Please provide a detailed description (at least 10 characters).")
            return
        }

        setIsSubmitting(true)

        try {
            const refundCase = createRefundCase({
                bookingId: booking.id,
                workshopId: booking.workshopId,
                amount: booking.totalAmount || 0,
                reason,
                description,
                evidence: ""
            })

            // Simulate network delay
            await new Promise(r => setTimeout(r, 1000))

            navigate(`/bookings/${booking.id}/refund-status`, { state: { caseId: refundCase.id } })
        } catch (err) {
            setError("Failed to submit refund request. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="font-display bg-slate-50 dark:bg-zinc-950 min-h-screen flex flex-col">
            <header className="flex items-center bg-white dark:bg-zinc-900 px-4 py-4 border-b border-slate-100 dark:border-zinc-800">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full">
                    <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
                </button>
                <h1 className="text-lg font-black uppercase tracking-tight ml-2 text-slate-900 dark:text-white">Request Refund</h1>
            </header>

            <main className="flex-1 p-6 flex flex-col max-w-lg mx-auto w-full">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking ID</p>
                            <p className="font-bold text-slate-900 dark:text-white">#{booking.id}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                            <p className="font-bold text-slate-900 dark:text-white">RM {(booking.totalAmount || 0).toFixed(2)}</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{booking.workshopName}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">
                            Reason for Refund
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {REFUND_REASONS.map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setReason(r)}
                                    className={cn(
                                        "px-4 py-3 rounded-2xl border text-sm font-bold text-left transition-all",
                                        reason === r
                                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                                            : "border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 hover:border-slate-200"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">
                            Issue Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please explain the issue in detail..."
                            className="w-full h-32 px-4 py-3 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">
                            Upload Evidence (Optional)
                        </label>
                        <div className="border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-4xl mb-2">upload_file</span>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Click to upload images</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

                    <div className="pb-8">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 rounded-2xl text-base font-black uppercase tracking-widest"
                        >
                            {isSubmitting ? (
                                <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                "Submit Refund Request"
                            )}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}
