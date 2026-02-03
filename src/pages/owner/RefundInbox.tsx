import { useNavigate } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import { useUser } from "../../contexts/UserContext"
import { shopService } from "../../lib/shopService"
import { cn } from "../../lib/utils"

export function RefundInbox() {
    const navigate = useNavigate()
    const { user } = useUser()
    const { refunds, workshops } = useMockState()

    // Get owner's workshop details
    const shopData = user ? shopService.getShopData(user.email) : null
    const ownerWorkshop = workshops.find(w => w.name === shopData?.workshopName)

    // Filter refunds for the owner's workshop
    const workshopRefunds = ownerWorkshop ? refunds.filter(r => r.workshopId === ownerWorkshop.id) : []

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
        <div className="font-display bg-slate-50 dark:bg-zinc-950 min-h-screen pb-20">
            <header className="bg-white dark:bg-zinc-900 px-6 py-6 border-b border-slate-100 dark:border-zinc-800">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Disputes & Refunds</h1>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Manage customer requests and resolution</p>
            </header>

            <main className="p-6">
                {!ownerWorkshop ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <span className="material-symbols-outlined text-slate-200 dark:text-slate-700 text-6xl mb-4">storefront</span>
                        <p className="text-slate-400 font-black uppercase tracking-widest">No workshop found for this account</p>
                    </div>
                ) : workshopRefunds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <span className="material-symbols-outlined text-slate-200 dark:text-slate-700 text-6xl mb-4">gavel</span>
                        <p className="text-slate-400 font-black uppercase tracking-widest">No disputes found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {workshopRefunds.map((refund) => (
                            <button
                                key={refund.id}
                                onClick={() => navigate(`/owner/disputes/${refund.id}`)}
                                className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-100 dark:border-zinc-800 shadow-sm hover:border-slate-200 dark:hover:border-zinc-700 transition-all text-left group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Case ID: {refund.id}</p>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                                            {refund.reason}
                                        </h3>
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        getStatusColor(refund.status)
                                    )}>
                                        {refund.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 py-3 border-t border-slate-50 dark:border-zinc-800">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">#{refund.bookingId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white italic">RM {refund.amount.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                        Requested {new Date(refund.createdAt).toLocaleDateString()}
                                    </p>
                                    <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
