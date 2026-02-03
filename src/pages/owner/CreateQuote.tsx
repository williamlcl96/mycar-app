import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import type { Booking } from "../../lib/mockState"

export function OwnerCreateQuote() {
    const navigate = useNavigate()
    const { id: bookingId } = useParams()
    const { bookings, createQuote } = useMockState()
    const [booking, setBooking] = useState<Booking | null>(null)

    // Form State
    const [parts, setParts] = useState([{ name: "", quantity: 1, price: 0 }])
    const [labor, setLabor] = useState([{ name: "Labor Charge", hours: 1, rate: 50 }])
    const [diagnosis, setDiagnosis] = useState("")

    useEffect(() => {
        if (bookings.length > 0 && bookingId) {
            const found = bookings.find(b => b.id === bookingId)
            if (found) setBooking(found)
        }
    }, [bookings, bookingId])

    const addPart = () => setParts([...parts, { name: "", quantity: 1, price: 0 }])

    // Calculations
    const partsTotal = parts.reduce((acc, p) => acc + (p.price * p.quantity), 0)
    const laborTotal = labor.reduce((acc, l) => acc + (l.rate * l.hours), 0)
    const subtotal = partsTotal + laborTotal
    const sst = subtotal * 0.06
    const total = subtotal + sst

    const handleSave = () => {
        if (!booking) return

        createQuote({
            bookingId: booking.id,
            workshopId: booking.workshopId,
            status: "PENDING",
            items: parts.map(p => ({ name: p.name, price: p.price * p.quantity })),
            labor: laborTotal,
            tax: sst,
            total: total
        })

        navigate('/owner/jobs')
    }

    if (!booking) return <div className="p-4">Loading...</div>

    return (
        <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen pb-24 font-display">
            <div className="bg-white dark:bg-zinc-900 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Create Quote</h1>
            </div>

            <div className="p-4 space-y-6">
                {/* Booking Info */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Booking Reference</h3>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white">#{booking.id}</span>
                        <span className="text-sm text-slate-500">{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-primary font-medium text-sm mt-1">{booking.serviceType}</p>
                </div>

                {/* Diagnosis */}
                <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white">Mechanic's Diagnosis</h3>
                    <textarea
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Describe the issue found..."
                        className="w-full h-24 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-1 focus:ring-primary outline-none"
                    ></textarea>
                </div>

                {/* Parts */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 dark:text-white">Parts Needed</h3>
                        <button onClick={addPart} className="text-primary text-xs font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">add</span> ADD PART
                        </button>
                    </div>
                    <div className="space-y-3">
                        {parts.map((part, i) => (
                            <div key={i} className="flex gap-2 items-start">
                                <input
                                    type="text"
                                    placeholder="Part Name"
                                    value={part.name}
                                    onChange={(e) => {
                                        const newParts = [...parts]
                                        newParts[i].name = e.target.value
                                        setParts(newParts)
                                    }}
                                    className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={part.price || ''}
                                    onChange={(e) => {
                                        const newParts = [...parts]
                                        newParts[i].price = parseFloat(e.target.value) || 0
                                        setParts(newParts)
                                    }}
                                    className="w-24 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none text-right"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Labor */}
                <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white">Labor</h3>
                    <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Labor Hours</span>
                            <span className="text-xs text-slate-500">Rate: RM {labor[0].rate}/hr</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setLabor([{ ...labor[0], hours: Math.max(1, labor[0].hours - 1) }])} className="size-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold">-</button>
                            <span className="font-bold w-4 text-center">{labor[0].hours}</span>
                            <button onClick={() => setLabor([{ ...labor[0], hours: labor[0].hours + 1 }])} className="size-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold">+</button>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-slate-100 dark:bg-zinc-800/50 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 text-xs">Parts Total</span>
                        <span className="font-medium text-slate-900 dark:text-white">RM {partsTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 text-xs">Labor Total</span>
                        <span className="font-medium text-slate-900 dark:text-white">RM {laborTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 text-xs">SST (6%)</span>
                        <span className="font-medium text-slate-900 dark:text-white">RM {sst.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-zinc-700 pt-2 flex justify-between items-end mt-2">
                        <span className="font-bold text-slate-900 dark:text-white">Total Estimate</span>
                        <span className="font-extrabold text-xl text-primary">RM {total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 p-4 pb-6 flex gap-3 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <button onClick={() => navigate(-1)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-zinc-800">
                    Cancel
                </button>
                <button onClick={handleSave} className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-primary shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
                    Send Quote
                </button>
            </div>
        </div>
    )
}
