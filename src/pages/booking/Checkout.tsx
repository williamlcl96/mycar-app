import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import type { Booking, Quote } from "../../lib/mockState"
import { MALAYSIAN_BANKS, EWALLETS, type PaymentMethodType } from "../../lib/paymentService"
import { Button } from "../../components/ui/Button"

export function Checkout() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { bookings, quotes } = useMockState()
    const [booking, setBooking] = useState<Booking | null>(null)
    const [quote, setQuote] = useState<Quote | null>(null)
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("card")

    // Form States
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' })
    const [selectedBank, setSelectedBank] = useState('')
    const [selectedWallet, setSelectedWallet] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (id) {
            const b = bookings.find(i => i.id === id)
            if (b) {
                setBooking(b)
                const q = quotes.find(item => item.bookingId === b.id)
                if (q) setQuote(q)
            }
        }
    }, [id, bookings, quotes])

    if (!booking) return <div className="p-4">Loading...</div>
    if (!quote) return (
        <div className="p-4 flex flex-col items-center justify-center min-h-screen">
            <p className="mb-4">No quote found for this booking.</p>
            <button onClick={() => navigate(-1)} className="text-primary font-bold">Go Back</button>
        </div>
    )

    const handlePayment = () => {
        setError('')

        const paymentDetails: any = { method: selectedMethod }

        if (selectedMethod === 'card') {
            if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
                setError('Please fill in all card details.')
                return
            }
            paymentDetails.card = cardDetails
        } else if (selectedMethod === 'fpx') {
            if (!selectedBank) {
                setError('Please select your bank.')
                return
            }
            const bank = MALAYSIAN_BANKS.find(b => b.code === selectedBank)
            paymentDetails.fpx = { bankCode: selectedBank, bankName: bank?.name }
        } else if (selectedMethod === 'ewallet') {
            if (!selectedWallet) {
                setError('Please select an e-wallet.')
                return
            }
            paymentDetails.ewallet = { provider: selectedWallet }
        }

        navigate('/payment/processing', {
            state: {
                bookingId: booking.id,
                amount: quote.total,
                paymentDetails
            }
        })
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col group/design-root font-display bg-slate-50 dark:bg-zinc-950 pb-8">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center bg-white dark:bg-zinc-900 p-4 pb-2 justify-between border-b border-gray-200 dark:border-zinc-800">
                <div
                    onClick={() => navigate(-1)}
                    className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </div>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Secure Checkout</h2>
            </header>

            <main className="flex-1 pb-48 lg:pb-32">
                {/* Workshop Summary */}
                <section className="p-4">
                    <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm border border-gray-100 dark:border-zinc-800">
                        <div
                            className="w-full sm:w-32 bg-center bg-no-repeat aspect-video sm:aspect-square bg-cover rounded-lg shrink-0 flex items-center justify-center bg-slate-100"
                            style={{ backgroundImage: `url("${booking.workshopImage || "https://images.unsplash.com/photo-1625047509168-a7026f36de04?q=80&w=200&auto=format&fit=crop"}")` }}
                        ></div>
                        <div className="flex flex-1 flex-col justify-between gap-3">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">{booking.workshopName}</h3>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                    <span>{new Date(booking.date).toLocaleDateString()} • {booking.time}</span>
                                </div>
                                <p className="text-primary text-sm font-semibold">{booking.serviceType}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cost Breakdown */}
                <section className="px-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800">
                        <h3 className="text-slate-900 dark:text-white font-bold text-base mb-3">Order Summary</h3>
                        <div className="flex justify-between gap-x-6 py-2 border-b border-dashed border-gray-200 dark:border-zinc-700">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">Parts & Materials</p>
                            <p className="text-slate-900 dark:text-white text-sm font-medium text-right">RM {quote.items.reduce((acc, i) => acc + i.price, 0).toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between gap-x-6 py-2 border-b border-dashed border-gray-200 dark:border-zinc-700">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">Labor</p>
                            <p className="text-slate-900 dark:text-white text-sm font-medium text-right">RM {quote.labor.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between gap-x-6 py-2 border-b border-gray-200 dark:border-zinc-700">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">SST (6%)</p>
                            <p className="text-slate-900 dark:text-white text-sm font-medium text-right">RM {quote.tax.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between gap-x-6 pt-3">
                            <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">Total Amount</p>
                            <p className="text-slate-900 dark:text-white text-xl font-bold leading-normal text-right">RM {quote.total.toFixed(2)}</p>
                        </div>
                    </div>
                </section>

                {/* Payment Methods */}
                <section className="px-4 pb-4">
                    <h3 className="text-slate-900 dark:text-white tracking-light text-lg font-bold leading-tight pb-3 pt-6">Payment Method</h3>
                    <div className="flex flex-col gap-4">
                        {/* Card */}
                        <div className="space-y-3">
                            <label className="cursor-pointer relative block">
                                <input
                                    type="radio"
                                    name="payment_method"
                                    className="peer sr-only"
                                    checked={selectedMethod === "card"}
                                    onChange={() => setSelectedMethod("card")}
                                />
                                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm peer-checked:border-primary peer-checked:bg-blue-50/50 dark:peer-checked:bg-primary/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 dark:bg-zinc-800 rounded p-2 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">credit_card</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">Credit / Debit Card</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">Visa, Mastercard</span>
                                        </div>
                                    </div>
                                    <div className="size-5 rounded-full border border-gray-300 dark:border-zinc-600 flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary">
                                        <div className="size-2 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </label>

                            {selectedMethod === 'card' && (
                                <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Card Number</label>
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={19}
                                            value={cardDetails.number}
                                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm font-bold focus:border-primary outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Expiry</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                value={cardDetails.expiry}
                                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm font-bold focus:border-primary outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">CVV</label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                maxLength={3}
                                                value={cardDetails.cvv}
                                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm font-bold focus:border-primary outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Cardholder Name</label>
                                        <input
                                            type="text"
                                            placeholder="NAME ON CARD"
                                            value={cardDetails.name}
                                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm font-bold focus:border-primary outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* FPX */}
                        <div className="space-y-3">
                            <label className="cursor-pointer relative block">
                                <input
                                    type="radio"
                                    name="payment_method"
                                    className="peer sr-only"
                                    checked={selectedMethod === "fpx"}
                                    onChange={() => setSelectedMethod("fpx")}
                                />
                                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm peer-checked:border-primary peer-checked:bg-blue-50/50 dark:peer-checked:bg-primary/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 dark:bg-zinc-800 rounded p-2 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">account_balance</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">FPX Online Banking</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">Maybank, CIMB, etc.</span>
                                        </div>
                                    </div>
                                    <div className="size-5 rounded-full border border-gray-300 dark:border-zinc-600 flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary">
                                        <div className="size-2 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </label>

                            {selectedMethod === 'fpx' && (
                                <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1 mb-2 block">Select Bank</label>
                                    <select
                                        value={selectedBank}
                                        onChange={(e) => setSelectedBank(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm font-bold focus:border-primary outline-none transition-colors appearance-none"
                                    >
                                        <option value="">Choose your bank</option>
                                        {MALAYSIAN_BANKS.map(bank => (
                                            <option key={bank.code} value={bank.code}>{bank.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* E-Wallets */}
                        <div className="space-y-3">
                            <label className="cursor-pointer relative block">
                                <input
                                    type="radio"
                                    name="payment_method"
                                    className="peer sr-only"
                                    checked={selectedMethod === "ewallet"}
                                    onChange={() => setSelectedMethod("ewallet")}
                                />
                                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm peer-checked:border-primary peer-checked:bg-blue-50/50 dark:peer-checked:bg-primary/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 dark:bg-zinc-800 rounded p-2 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">account_balance_wallet</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">E-Wallets</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">GrabPay, TNG eWallet</span>
                                        </div>
                                    </div>
                                    <div className="size-5 rounded-full border border-gray-300 dark:border-zinc-600 flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary">
                                        <div className="size-2 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </label>

                            {selectedMethod === 'ewallet' && (
                                <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300 grid grid-cols-2 gap-2">
                                    {EWALLETS.map(wallet => (
                                        <button
                                            key={wallet.id}
                                            onClick={() => setSelectedWallet(wallet.id)}
                                            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${selectedWallet === wallet.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-transparent bg-slate-50 dark:bg-zinc-800'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-sm">{wallet.icon}</span>
                                            <span className="text-xs font-bold">{wallet.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-3 animate-shake">
                            <span className="material-symbols-outlined text-red-500">error</span>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Sticky Footer */}
            <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 p-4 pb-6 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-1 px-1">
                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">RM {quote.total.toFixed(2)}</span>
                    </div>
                    <Button
                        onClick={handlePayment}
                        className="w-full h-14 rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                        Confirm & Pay Securely
                    </Button>
                    <div className="flex items-center justify-center gap-2 opacity-60">
                        <span className="material-symbols-outlined text-slate-500 text-[14px]">shield</span>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank-grade 256-bit SSL encrypted</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
