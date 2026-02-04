import { useNavigate } from "react-router-dom"
import { useMemo } from "react"
import { useMockState } from "../../lib/mockState"
import { useUser } from "../../contexts/UserContext"
import { shopService } from "../../lib/shopService"

export function OwnerDashboard() {
    const navigate = useNavigate()
    const { bookings, workshops, quotes, reviews, refunds } = useMockState()
    const { user } = useUser()
    const shopData = user ? shopService.getShopData(user.email) : null

    const shopId = useMemo(() => {
        if (!user) return 'w1'
        if (user.workshopId) return user.workshopId;
        const data = shopService.getShopData(user.email)
        return workshops.find(w => w.name === data?.workshopName)?.id || 'w1'
    }, [user, workshops])

    const myBookings = bookings.filter(b => b.workshopId === shopId)
    const myReviews = reviews.filter(r => r.workshopId === shopId)

    const averageRating = useMemo(() => {
        if (myReviews.length === 0) return 0
        const sum = myReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
        return sum / myReviews.length
    }, [myReviews])

    // Safe revenue calculation
    // ... (logic remains same)
    const dailyRevenue = myBookings
        .filter(b => {
            const hasApprovedRefund = refunds.some(r => r.bookingId === b.id && r.status === 'Approved');
            return ['COMPLETED', 'READY', 'REPAIRING', 'PAID'].includes(b.status) && !hasApprovedRefund;
        })
        .reduce((acc, b) => {
            if (!b.quoteId) return acc;
            const q = quotes.find(q => q.id === b.quoteId)
            return acc + (q?.total || 0)
        }, 0)

    const activeJobsCount = myBookings.filter(b => {
        const hasApprovedRefund = refunds.some(r => r.bookingId === b.id && r.status === 'Approved');
        return ['ACCEPTED', 'REPAIRING', 'READY'].includes(b.status) && !hasApprovedRefund;
    }).length
    const pendingQuotesCount = myBookings.filter(b => b.status === 'PENDING' && !b.quoteId).length

    const stats = [
        { label: "Today's Revenue", value: `RM ${dailyRevenue.toFixed(2)}`, icon: "payments", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
        { label: "Active Jobs", value: activeJobsCount.toString(), icon: "car_repair", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { label: "Pending Quotes", value: pendingQuotesCount.toString(), icon: "description", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
        { label: "Rating", value: averageRating > 0 ? averageRating.toFixed(1) : "No ratings", icon: "star", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    ]

    const recentJobs = bookings.slice(0, 3).map(b => ({
        id: b.id,
        car: b.vehicleName,
        plate: "WB 8821 M", // Mock
        service: b.serviceType,
        status: b.status,
        time: b.time
    }))

    return (
        <div className="p-4 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {shopData?.workshopName || "Dashboard"}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Monday, 24 Oct</p>
                </div>
                <div
                    className="h-10 w-10 rounded-full bg-slate-200 dark:bg-zinc-800 bg-cover bg-center border-2 border-white dark:border-zinc-700 shadow-sm"
                    style={{ backgroundImage: `url("https://api.dicebear.com/7.x/identicon/svg?seed=${shopData?.workshopName || 'Ali'}")` }}
                ></div>
            </div>

            {/* Stats Grid */}
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    onClick={() => {
                        if (stat.label === "Pending Quotes") navigate('/owner/jobs?tab=REQUESTS')
                        if (stat.label === "Active Jobs") navigate('/owner/jobs?tab=ACTIVE')
                        if (stat.label === "Today's Revenue") navigate('/owner/analytics')
                        if (stat.label === "Rating") navigate('/owner/reviews')
                    }}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform"
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                        <span className="material-symbols-outlined text-lg">{stat.icon}</span>
                    </div>
                    <div>
                        <p className="text-lg font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    </div>
                </div>
            ))}

            {/* Quick Actions */}
            <div className="mb-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 px-1">Quick Actions</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    <button onClick={() => navigate('/owner/jobs')} className="flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <span className="material-symbols-outlined">add_task</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">New Job</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <span className="material-symbols-outlined">campaign</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Promote</span>
                    </button>
                    <button onClick={() => navigate('/owner/wallet')} className="flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                            <span className="material-symbols-outlined">account_balance_wallet</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Withdraw</span>
                    </button>
                </div>
            </div>

            {/* Recent Jobs */}
            <div>
                <div className="flex justify-between items-center mb-3 px-1">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Requests</h2>
                    <button onClick={() => navigate('/owner/jobs')} className="text-primary text-xs font-bold hover:text-blue-600">View All</button>
                </div>
                <div className="flex flex-col gap-3">
                    {recentJobs.map((job) => (
                        <div key={job.id} onClick={() => navigate(`/owner/jobs/${job.id}`)} className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm active:scale-[0.98] transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">directions_car</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{job.car}</h3>
                                    <span className="text-[10px] font-bold text-slate-400">{job.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-1">{job.plate} • {job.service}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-block w-2 h-2 rounded-full ${job.status === 'REPAIRING' ? 'bg-blue-500' :
                                        job.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-500'
                                        }`}></span>
                                    <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">{job.status}</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
