import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useMockState } from "../../lib/mockState"
import { useUser } from "../../contexts/UserContext"
import { useMemo } from "react"
import { shopService } from "../../lib/shopService"
import { useNotifications } from "../../lib/notifications"
import { payoutService, MALAYSIAN_BANKS, type BankAccount, type PayoutTransaction } from "../../lib/payoutService"
import { cn } from "../../lib/utils"

export function OwnerWalletPage() {
    const navigate = useNavigate()
    const { user } = useUser()
    const { notify } = useNotifications()
    const { bookings, workshops, quotes, refunds } = useMockState()

    const shopId = useMemo(() => {
        if (!user) return 'w1'
        const data = shopService.getShopData(user.email)
        return workshops.find(w => w.name === data?.workshopName)?.id || 'w1'
    }, [user, workshops])

    const myBookings = bookings.filter(b => b.workshopId === shopId)

    const [bankAccount, setBankAccount] = useState<BankAccount | null>(null)
    const [transactions, setTransactions] = useState<PayoutTransaction[]>([])
    const [isBankModalOpen, setIsBankModalOpen] = useState(false)
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
    const [withdrawAmount, setWithdrawAmount] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    // Load data
    useEffect(() => {
        if (user) {
            setBankAccount(payoutService.getBankAccount(user.email))
            setTransactions(payoutService.getTransactions(user.email))
        }
    }, [user])

    // Listen for status updates (simulation)
    useEffect(() => {
        const handleUpdate = () => {
            if (user) {
                const updatedTransactions = payoutService.getTransactions(user.email);

                // Find if any transaction just moved to COMPLETED
                updatedTransactions.forEach(tx => {
                    const oldTx = transactions.find(t => t.id === tx.id);
                    if (tx.status === 'COMPLETED' && (!oldTx || oldTx.status !== 'COMPLETED')) {
                        notify({
                            title: "Payout Successful",
                            message: `RM ${tx.amount.toFixed(2)} has been successfully transferred to your ${tx.bankName} account.`,
                            type: "payment",
                            role: "owner",
                            userId: user.id
                        });
                    }
                });

                setTransactions(updatedTransactions);
            }
        }
        window.addEventListener('payout_status_updated', handleUpdate)
        return () => window.removeEventListener('payout_status_updated', handleUpdate)
    }, [user, transactions, notify])

    // Calculate base balance from bookings
    const rawBalance = useMemo(() => {
        return myBookings
            .filter(b => ['COMPLETED', 'READY', 'REPAIRING', 'PAID'].includes(b.status))
            .reduce((acc, b) => {
                if (!b.quoteId) return acc;
                const q = quotes.find(q => q.id === b.quoteId)
                if (!q) return acc;

                // Check for associated refunds
                const refund = refunds.find(r => r.bookingId === b.id);

                // If refund is APPROVED, the owner doesn't get the money
                if (refund?.status === 'Approved') return acc;

                // If refund is REQUESTED/REJECTED/UNDER REVIEW, it's in escrow (not available yet)
                if (refund && ['Requested', 'Rejected', 'Under Review', 'Shop Responded'].includes(refund.status)) {
                    return acc; // Move to escrow (we handle this below)
                }

                return acc + q.total;
            }, 0)
    }, [myBookings, quotes, refunds])

    const escrowBalance = useMemo(() => {
        return myBookings
            .reduce((acc, b) => {
                const refund = refunds.find(r => r.bookingId === b.id);
                if (refund && ['Requested', 'Rejected', 'Under Review', 'Shop Responded'].includes(refund.status)) {
                    const q = quotes.find(q => q.id === b.quoteId)
                    return acc + (q?.total || 0)
                }
                return acc;
            }, 0)
    }, [myBookings, quotes, refunds])

    const summary = useMemo(() => {
        if (!user) return { available: 0, pending: 0, withdrawn: 0 }
        const baseSummary = payoutService.getPayoutSummary(user.email, rawBalance)
        return {
            ...baseSummary,
            pending: baseSummary.pending + escrowBalance // Add escrowed funds to pending
        }
    }, [user, rawBalance, escrowBalance])

    const handleSaveBank = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const account: BankAccount = {
            bankName: formData.get('bankName') as string,
            accountHolder: formData.get('accountHolder') as string,
            accountNumber: formData.get('accountNumber') as string,
        }

        if (user) {
            payoutService.saveBankAccount(user.email, account)
            setBankAccount(account)
            setIsBankModalOpen(false)
            notify({
                title: "Success",
                message: "Bank account details updated.",
                type: "payment",
                role: "owner",
                userId: user.id
            })
        }
    }

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount)
        if (isNaN(amount) || amount <= 0) {
            if (user) {
                notify({
                    title: "Error",
                    message: "Enter a valid amount.",
                    type: "payment",
                    role: "owner",
                    userId: user.id
                })
            }
            return
        }

        setIsProcessing(true)
        if (user) {
            const res = await payoutService.requestWithdrawal(user.email, amount, summary.available)
            if (res.success) {
                notify({
                    title: "Requested",
                    message: res.message,
                    type: "payment",
                    role: "owner",
                    userId: user.id
                })
                setWithdrawAmount("")
                setIsWithdrawModalOpen(false)
                setTransactions(payoutService.getTransactions(user.email))
            } else {
                notify({
                    title: "Failed",
                    message: res.message,
                    type: "payment",
                    role: "owner",
                    userId: user.id
                })
            }
        }
        setIsProcessing(false)
    }

    return (
        <div className="relative flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
                    </button>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Earnings & Payouts</h2>
                </div>
                <div className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500">
                    <span className="material-symbols-outlined text-2xl">help</span>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Balance Dashboard */}
                <div className="bg-primary rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
                    </div>
                    <div className="relative z-10 text-center">
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Available to Withdraw</p>
                        <h3 className="text-5xl font-black mb-6">RM {summary.available.toFixed(2)}</h3>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                            <div>
                                <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-0.5">Pending</p>
                                <p className="font-bold text-lg">RM {summary.pending.toFixed(2)}</p>
                            </div>
                            <div className="border-l border-white/10">
                                <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-0.5">Total Withdrawn</p>
                                <p className="font-bold text-lg">RM {summary.withdrawn.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        disabled={!bankAccount || summary.available <= 0}
                        className="flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-primary/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Withdraw Fund</span>
                    </button>
                    <button
                        onClick={() => setIsBankModalOpen(true)}
                        className="flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-primary/30 transition-all active:scale-95"
                    >
                        <div className="size-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Bank Settings</span>
                    </button>
                </div>

                {/* Bank Preview */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Payout Method</h3>
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-full uppercase">FPX (Malaysia)</span>
                    </div>
                    {!bankAccount ? (
                        <div className="flex flex-col items-center py-4 text-center">
                            <p className="text-xs text-slate-500 mb-3">No bank account linked yet.</p>
                            <button
                                onClick={() => setIsBankModalOpen(true)}
                                className="text-xs font-bold text-primary hover:underline"
                            >
                                Link Bank Account
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">verified_user</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{bankAccount.bankName}</p>
                                <p className="text-xs text-slate-500">{bankAccount.accountHolder} • •••• {bankAccount.accountNumber.slice(-4)}</p>
                            </div>
                            <button onClick={() => setIsBankModalOpen(true)} className="text-primary">
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Transaction History */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 px-1">Withdrawal History</h3>
                    {transactions.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 p-12 text-center">
                            <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">history</span>
                            <p className="text-xs text-slate-400">No transactions yet</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 overflow-hidden divide-y divide-slate-50 dark:divide-zinc-800 shadow-sm">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="p-4 flex items-center gap-4">
                                    <div className={cn(
                                        "size-10 rounded-xl flex items-center justify-center",
                                        tx.status === 'COMPLETED' ? "bg-green-500/10 text-green-500" :
                                            tx.status === 'FAILED' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500 animate-pulse"
                                    )}>
                                        <span className="material-symbols-outlined text-xl">
                                            {tx.status === 'COMPLETED' ? 'check_circle' : tx.status === 'FAILED' ? 'error' : 'sync'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">RM {tx.amount.toFixed(2)}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">#{tx.id}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {tx.bankName} • {new Date(tx.timestamp).toLocaleDateString()}
                                            </p>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                tx.status === 'COMPLETED' ? "text-green-500" : "text-blue-500"
                                            )}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bank Modal */}
            {isBankModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Bank Details</h3>
                            <p className="text-xs text-slate-500 mb-6">Enter your Malaysian bank account for FPX deposits.</p>

                            <form onSubmit={handleSaveBank} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Bank</label>
                                    <select
                                        name="bankName"
                                        required
                                        defaultValue={bankAccount?.bankName || ""}
                                        className="w-full h-14 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl px-5 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all dark:text-white appearance-none"
                                    >
                                        <option value="" disabled>Choose a bank</option>
                                        {MALAYSIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account Holder Name</label>
                                    <input
                                        name="accountHolder"
                                        required
                                        defaultValue={bankAccount?.accountHolder || ""}
                                        className="w-full h-14 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl px-5 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all dark:text-white placeholder:text-slate-400"
                                        placeholder="Full name as per IC"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account Number</label>
                                    <input
                                        name="accountNumber"
                                        required
                                        pattern="[0-9]*"
                                        defaultValue={bankAccount?.accountNumber || ""}
                                        className="w-full h-14 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl px-5 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all dark:text-white placeholder:text-slate-400"
                                        placeholder="Enter numbers only"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsBankModalOpen(false)}
                                        className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 h-14 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-8 text-center">
                            <div className="size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl">payments</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Withdraw Funds</h3>
                            <p className="text-xs text-slate-500 mb-8">Funds will be sent via FPX to your linked {bankAccount?.bankName} account.</p>

                            <div className="relative mb-6">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">RM</span>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full py-8 px-16 bg-slate-50 dark:bg-zinc-800 border-none rounded-[2rem] text-4xl font-black focus:ring-4 focus:ring-primary/10 transition-all text-center dark:text-white outline-none"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-between items-center mb-10 px-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maximum Available</span>
                                <button
                                    onClick={() => setWithdrawAmount(summary.available.toFixed(2))}
                                    className="text-xs font-black text-primary hover:bg-primary/5 px-3 py-1 rounded-full transition-colors"
                                >
                                    RM {summary.available.toFixed(2)}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsWithdrawModalOpen(false)}
                                    className="h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleWithdraw}
                                    disabled={isProcessing || !withdrawAmount || parseFloat(withdrawAmount) > summary.available}
                                    className="h-14 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isProcessing ? (
                                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Withdraw"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
