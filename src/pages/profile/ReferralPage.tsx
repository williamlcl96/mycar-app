import { useNavigate } from "react-router-dom"
import { useState } from "react"


export function ReferralPage() {
    const navigate = useNavigate()
    const [referralCode] = useState("AUTO50-MY")

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode)
        // could add toast here
    }

    return (
        <div className="min-h-screen bg-white dark:bg-surface-dark flex flex-col">
            {/* Top App Bar */}
            <div className="flex items-center px-4 py-3 justify-between sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center pr-10">Refer & Earn</h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Hero Image */}
                <div className="w-full px-4 pt-4">
                    <div className="w-full aspect-[16/9] bg-center bg-no-repeat bg-cover rounded-xl overflow-hidden relative shadow-sm bg-slate-200 dark:bg-slate-800">
                        {/* Placeholder image if original is not available, or use the one from HTML if accessible */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                            <span className="px-2 py-1 bg-primary text-xs font-bold rounded-md uppercase tracking-wide">Promo</span>
                        </div>
                    </div>
                </div>

                {/* Headline Text */}
                <div className="px-5 pt-6 pb-2 text-center">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold leading-tight tracking-tight mb-3">
                        Share the Love,<br /><span className="text-primary">Get RM50</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed max-w-[320px] mx-auto">
                        Give your friends RM50 off their first repair, and earn RM50 when they complete it.
                    </p>
                </div>

                {/* Referral Code Card */}
                <div className="px-4 py-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">Your Unique Code</label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative group">
                                <input
                                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xl font-bold tracking-widest text-center py-4 rounded-xl border-2 border-dashed border-primary/30 focus:border-primary focus:ring-0 cursor-text selection:bg-primary/20"
                                    readOnly
                                    value={referralCode}
                                />
                            </div>
                            <button
                                onClick={copyToClipboard}
                                aria-label="Copy Code"
                                className="flex flex-col items-center justify-center size-14 bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary rounded-xl transition-colors border border-primary/20"
                            >
                                <span className="material-symbols-outlined text-[24px]">content_copy</span>
                            </button>
                        </div>

                        {/* Main Share Button */}
                        <button className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg h-14 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                            <span className="material-symbols-outlined">ios_share</span>
                            Share Invite Link
                        </button>

                        <div className="mt-4 flex justify-center gap-6">
                            {/* Mock Social Quick Links */}
                            <button className="flex flex-col items-center gap-1 group">
                                <div className="size-10 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                                    <span className="material-symbols-outlined text-[#25D366] text-xl">chat</span>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">WhatsApp</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 group">
                                <div className="size-10 rounded-full bg-[#0084FF]/10 flex items-center justify-center group-hover:bg-[#0084FF]/20 transition-colors">
                                    <span className="material-symbols-outlined text-[#0084FF] text-xl">forum</span>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Messenger</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 group">
                                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
                                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-xl">more_horiz</span>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">More</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="px-5 py-2">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4">How it works</h3>
                    <div className="relative pl-2">
                        {/* Vertical Line */}
                        <div className="absolute left-[19px] top-2 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

                        {/* Step 1 */}
                        <div className="relative flex items-start gap-4 mb-6">
                            <div className="relative z-10 flex items-center justify-center size-9 rounded-full bg-primary text-white shadow-md border-4 border-white dark:border-surface-dark shrink-0">
                                <span className="material-symbols-outlined text-[16px]">mail</span>
                            </div>
                            <div className="pt-1">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">Send Invite</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">Share your unique link with friends via WhatsApp or social media.</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex items-start gap-4 mb-6">
                            <div className="relative z-10 flex items-center justify-center size-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-4 border-white dark:border-surface-dark shrink-0">
                                <span className="material-symbols-outlined text-[16px]">car_repair</span>
                            </div>
                            <div className="pt-1">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">Friend Books Repair</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">They use your code to get RM50 off their first service.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex items-start gap-4">
                            <div className="relative z-10 flex items-center justify-center size-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-4 border-white dark:border-surface-dark shrink-0">
                                <span className="material-symbols-outlined text-[16px]">savings</span>
                            </div>
                            <div className="pt-1">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">You both get RM50</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">Once completed, you instantly receive RM50 credit.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Earnings Section */}
                <div className="px-4 py-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 text-white shadow-xl overflow-hidden relative">
                        {/* Background decoration */}
                        <div className="absolute -right-6 -top-6 size-32 bg-white/5 rounded-full blur-2xl"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <h3 className="text-lg font-bold">Your Rewards</h3>
                            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-white/80">Lifetime</span>
                        </div>
                        <div className="flex gap-6 relative z-10">
                            <div>
                                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Total Earned</p>
                                <p className="text-3xl font-bold tracking-tight">RM 150</p>
                            </div>
                            <div className="w-px bg-white/10"></div>
                            <div>
                                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Pending</p>
                                <p className="text-3xl font-bold tracking-tight text-white/60">RM 50</p>
                            </div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
                            <button className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                View History
                                <span className="material-symbols-outlined text-base ml-1">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 pb-8 text-center">
                    <button className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline decoration-slate-300 underline-offset-2">Terms & Conditions Apply</button>
                </div>
            </div>
        </div>
    )
}
