import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"

export function CheckoutPage() {
    const navigate = useNavigate()

    return (
        <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-background-light dark:bg-background-dark overflow-x-hidden pb-32">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center bg-white dark:bg-zinc-900 p-4 pb-2 justify-between border-b border-slate-200 dark:border-zinc-800">
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center pr-12">Secure Checkout</h2>
            </header>

            <main className="flex-1">
                {/* Workshop Summary */}
                <section className="p-4">
                    <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-zinc-800 p-4 shadow-sm border border-slate-100 dark:border-zinc-700">
                        <div
                            className="w-full sm:w-32 bg-center bg-no-repeat aspect-video sm:aspect-square bg-cover rounded-lg shrink-0"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD7xSn0xCao3Fl-GLjPxouLZJn35Q_92dgm5igVl8qHmmPCA3myIR9ICsjugz_gwHy06TKAwd10hKDKtp3sI2u1Kp34maNfVuzjpruEmmKY2BvmY6cT2eZrCJDEKgMb51BYW2yo1GtKoCKbyUvZrt1FZLLdNrF7xsRbRd76TbUQMPpZ3SadV6hI3xB6myzDeRRIalEqjGvHIsuLexqqsNWvrcoxy5UZsi5GkDpSgIK5QGvSYFl-f1abL7Fxd-7qXGEPGsdi6IWH0OU")' }}
                        />
                        <div className="flex flex-1 flex-col justify-between gap-3">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Ali's Auto Garage</h3>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>calendar_month</span>
                                    <span>Mon, 12 Oct • 10:00 AM</span>
                                </div>
                                <p className="text-primary text-sm font-semibold">Major Service</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cost Breakdown */}
                <section className="px-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-zinc-700">
                        <h3 className="text-slate-900 dark:text-white font-bold text-base mb-3">Order Summary</h3>
                        <div className="flex justify-between gap-x-6 py-2 border-b border-dashed border-slate-200 dark:border-zinc-700">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">Parts</p>
                            <p className="text-slate-900 dark:text-white text-sm font-medium text-right">RM 350.00</p>
                        </div>
                        <div className="flex justify-between gap-x-6 py-2 border-b border-dashed border-slate-200 dark:border-zinc-700">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">Labor</p>
                            <p className="text-slate-900 dark:text-white text-sm font-medium text-right">RM 150.00</p>
                        </div>
                        <div className="flex justify-between gap-x-6 py-2 border-b border-slate-200 dark:border-zinc-700">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">SST (6%)</p>
                            <p className="text-slate-900 dark:text-white text-sm font-medium text-right">RM 30.00</p>
                        </div>
                        <div className="flex justify-between gap-x-6 pt-3">
                            <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">Total Amount</p>
                            <p className="text-slate-900 dark:text-white text-xl font-bold leading-normal text-right">RM 530.00</p>
                        </div>
                    </div>
                </section>

                {/* Safe Pay Guarantee */}
                <section className="p-4">
                    <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 shrink-0 text-primary">
                                <span className="material-symbols-outlined">verified_user</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">Safe Pay Guarantee</p>
                                <p className="text-slate-500 dark:text-slate-300 text-sm font-normal leading-normal">We hold your payment securely in escrow. The workshop is only paid after you approve the completed job.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Payment Methods */}
                <section className="px-4 pb-4">
                    <h3 className="text-slate-900 dark:text-white tracking-tight text-lg font-bold leading-tight pb-3 pt-2">Payment Method</h3>
                    <div className="flex flex-col gap-3">
                        {/* Card */}
                        <label className="cursor-pointer relative">
                            <input type="radio" name="payment_method" className="peer sr-only" defaultChecked />
                            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-white dark:bg-zinc-800 shadow-sm peer-checked:border-primary peer-checked:bg-blue-50/50 dark:peer-checked:bg-primary/10 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 dark:bg-zinc-700 rounded p-2 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">credit_card</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 dark:text-white text-sm">Credit / Debit Card</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Visa ending in 4242</span>
                                    </div>
                                </div>
                                <div className="size-5 rounded-full border border-slate-300 dark:border-slate-500 flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary">
                                    <div className="size-2 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </label>
                        {/* FPX */}
                        <label className="cursor-pointer relative">
                            <input type="radio" name="payment_method" className="peer sr-only" />
                            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-white dark:bg-zinc-800 shadow-sm peer-checked:border-primary peer-checked:bg-blue-50/50 dark:peer-checked:bg-primary/10 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 dark:bg-zinc-700 rounded p-2 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">account_balance</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 dark:text-white text-sm">FPX Online Banking</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Maybank2u, CIMB Clicks, etc.</span>
                                    </div>
                                </div>
                                <div className="size-5 rounded-full border border-slate-300 dark:border-slate-500 flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary">
                                    <div className="size-2 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </label>
                    </div>
                </section>
            </main>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 p-4 pb-8 z-40 shadow-lg">
                <div className="flex flex-col gap-3 max-w-lg mx-auto">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total to pay</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">RM 530.00</span>
                    </div>
                    <Button onClick={() => navigate('/bookings')} className="w-full h-12 text-base font-bold shadow-md">
                        Confirm & Pay
                    </Button>
                    <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-500" style={{ fontSize: "14px" }}>lock</span>
                        <p className="text-xs text-center text-slate-500 dark:text-slate-500">Payments are secure and encrypted.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
