import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import { useUser } from "../../contexts/UserContext"
import { shopService } from "../../lib/shopService"

export function Analytics() {
    const navigate = useNavigate()
    const { bookings, workshops, quotes } = useMockState()
    const { user } = useUser()
    const [period, setPeriod] = useState<"week" | "month" | "year">("month")

    const shopId = useMemo(() => {
        if (!user) return 'w1'
        const data = shopService.getShopData(user.email)
        return workshops.find(w => w.name === data?.workshopName)?.id || 'w1'
    }, [user, workshops])

    const myBookings = bookings.filter(b => b.workshopId === shopId)

    const totalRevenue = myBookings
        .filter(b => ['COMPLETED', 'READY', 'REPAIRING', 'PAID'].includes(b.status))
        .reduce((acc, b) => {
            if (!b.quoteId) return acc;
            const q = quotes.find(q => q.id === b.quoteId)
            return acc + (q?.total || 0)
        }, 0)

    const recentTransactions = myBookings
        .filter(b => ['COMPLETED', 'READY', 'REPAIRING', 'PAID'].includes(b.status))
        .map(b => {
            const q = quotes.find(q => q.id === b.quoteId)
            return {
                id: `#INV-${b.id}`,
                user: b.customerName,
                service: b.serviceType,
                amount: `RM ${q?.total.toFixed(2) || '0.00'}`,
                status: b.status === 'COMPLETED' ? 'Completed' : 'Escrowed',
                date: b.date ? new Date(b.date).toLocaleDateString() : 'N/A'
            }
        })
        .slice(0, 5)

    return (
        <div className="flex-1 flex flex-col gap-6 p-4 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revenue Analytics</h1>
                    <p className="text-sm text-slate-500">Track your earnings and performance</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-1 flex border border-slate-200 dark:border-zinc-700">
                    {(["week", "month", "year"] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${period === p
                                ? "bg-primary text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Revenue ({period === 'month' ? 'This Month' : period === 'week' ? 'This Week' : 'This Year'})</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-bold">RM {totalRevenue.toFixed(2)}</h2>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold text-white flex items-center">
                            <span className="material-symbols-outlined text-sm mr-0.5">trending_up</span>
                            +15%
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart Styling Placeholder */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white">Revenue Trend</h3>
                    <button onClick={() => navigate('/owner/wallet')} className="flex items-center gap-1 text-primary text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                        <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                        Withdraw
                    </button>
                </div>

                {/* CSS Bar Chart */}
                <div className="flex items-end justify-between h-48 gap-2">
                    {[35, 55, 40, 70, 60, 85, 50].map((height, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                            <div className="w-full relative h-full flex items-end">
                                <div
                                    className="w-full bg-blue-100 dark:bg-zinc-800 rounded-t-md relative overflow-hidden group-hover:bg-blue-200 dark:group-hover:bg-zinc-700 transition-colors"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute bottom-0 left-0 right-0 bg-primary h-[calc(100%-4px)] opacity-80 rounded-t-sm"></div>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    RM {height * 150}
                                </div>
                            </div>
                            <span className="text-[10px] font-medium text-slate-400">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="flex flex-col gap-4">
                <h3 className="font-bold text-slate-900 dark:text-white px-1">Recent Transactions</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                    {recentTransactions.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-sm italic">No transactions yet</div>
                    ) : recentTransactions.map((tx) => (
                        <div key={tx.id} className="p-4 border-b border-slate-100 dark:border-zinc-800 last:border-0 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className={`size-10 rounded-full flex items-center justify-center ${tx.status === 'Completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                                    }`}>
                                    <span className="material-symbols-outlined">{tx.status === 'Completed' ? 'call_received' : 'schedule'}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.user}</p>
                                    <p className="text-xs text-slate-500">{tx.service}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.amount}</p>
                                <p className="text-xs text-slate-500">{tx.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
