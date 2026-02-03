import { useNavigate, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"

export function PaymentSuccess() {
    const navigate = useNavigate()
    const location = useLocation()
    const { amount, method, transactionId, status, bankName } = location.state || { amount: 0, status: 'SUCCESS' } as any

    const isPending = status === 'PENDING'

    const getMethodLabel = () => {
        if (method === 'card') return 'Credit Card'
        if (method === 'fpx') return `FPX (${bankName || 'Online Banking'})`
        if (method === 'ewallet') return 'E-Wallet'
        return 'Online Payment'
    }

    const getMethodIcon = () => {
        if (method === 'card') return 'credit_card'
        if (method === 'fpx') return 'account_balance'
        if (method === 'ewallet') return 'wallet'
        return 'payments'
    }

    return (
        <div className="font-display bg-slate-50 dark:bg-zinc-950 min-h-screen flex flex-col">
            <header className="flex items-center bg-white dark:bg-zinc-900 p-4 pb-2 justify-between">
                <div className="size-12"></div>
                <h2 className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-widest flex-1 text-center pr-12">
                    {isPending ? 'Receipt' : 'Payment Success'}
                </h2>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                <div className="relative mb-8">
                    <div className={cn(
                        "size-24 rounded-[2rem] flex items-center justify-center animate-in zoom-in duration-500",
                        isPending ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" : "bg-green-100 dark:bg-green-900/30 text-green-600"
                    )}>
                        <span className="material-symbols-outlined text-5xl font-bold">
                            {isPending ? 'history' : 'check'}
                        </span>
                    </div>
                </div>

                <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight text-center mb-4 uppercase">
                    {isPending ? 'Payment Pending' : 'Payment Successful'}
                </h1>

                <div className="mb-6 px-10 py-3 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">RM {amount.toFixed(2)}</p>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed text-center max-w-xs mb-10">
                    {isPending
                        ? "Your bank is currently processing this transaction. We'll update your booking status as soon as we receive confirmation."
                        : "Your payment has been secured in escrow. The workshop has been notified and is preparing for your service."}
                </p>

                <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-slate-100 dark:border-zinc-800 mb-10 shadow-sm space-y-4">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-slate-400 uppercase tracking-widest">Transaction ID</span>
                        <span className="text-slate-900 dark:text-white font-bold">#{transactionId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-slate-400 uppercase tracking-widest">Method</span>
                        <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                            <span className="material-symbols-outlined text-sm">{getMethodIcon()}</span>
                            <span>{getMethodLabel()}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-slate-400 uppercase tracking-widest">Status</span>
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                            isPending ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-green-50 text-green-600 border border-green-100"
                        )}>
                            {status}
                        </span>
                    </div>
                </div>

                <div className="w-full max-w-sm space-y-4">
                    <button
                        onClick={() => navigate('/bookings')}
                        className="w-full h-14 bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary/25 active:scale-[0.98]"
                    >
                        Go to My Bookings
                    </button>
                    {!isPending && (
                        <button
                            onClick={() => navigate('/')}
                            className="w-full h-12 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest rounded-2xl border border-slate-100 dark:border-zinc-800 hover:bg-slate-50 transition-all text-xs"
                        >
                            Back to Home
                        </button>
                    )}
                </div>
            </main>
        </div>
    )
}
