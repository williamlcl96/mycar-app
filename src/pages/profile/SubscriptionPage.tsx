import { useNavigate } from "react-router-dom"
import { cn } from "../../lib/utils"

export function SubscriptionPage() {
    const navigate = useNavigate()

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-10 bg-[#131022] text-white">
            {/* Top App Bar */}
            <div className="sticky top-0 z-50 flex items-center bg-[#131022]/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-white/5">
                <button
                    onClick={() => navigate(-1)}
                    className="text-white flex size-12 shrink-0 items-center justify-center -ml-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Membership</h2>
            </div>

            {/* Headline */}
            <div className="flex flex-col items-center pt-6 pb-2">
                <h2 className="text-white tracking-tight text-[28px] font-bold leading-tight px-6 text-center">
                    Upgrade Your Experience
                </h2>
                <p className="text-gray-400 text-base font-medium leading-normal pt-3 px-6 text-center max-w-md">
                    Unlock exclusive savings and premium services with our membership tiers.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="flex flex-col gap-5 px-5 py-6 max-w-lg mx-auto w-full">

                {/* Silver Tier */}
                <div className="group relative flex flex-col gap-5 rounded-xl border border-solid border-[#3f3b54] bg-[#1d1c27] p-6 transition-transform duration-300 hover:scale-[1.01]">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400">shield</span>
                            <h1 className="text-gray-200 text-lg font-bold leading-tight uppercase tracking-wider">Silver</h1>
                        </div>
                        <p className="flex items-baseline gap-1 text-white mt-1">
                            <span className="text-white text-3xl font-black leading-tight tracking-[-0.033em]">RM 0</span>
                            <span className="text-gray-400 text-sm font-bold leading-tight">/mo</span>
                        </p>
                    </div>
                    <div className="h-px bg-white/10 w-full"></div>
                    <div className="flex flex-col gap-3">
                        <FeatureItem icon="check_circle" text="Basic Workshop Search" color="text-gray-500" />
                        <FeatureItem icon="check_circle" text="Standard Booking" color="text-gray-500" />
                    </div>
                    <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-4 bg-[#2b2839] hover:bg-[#353145] transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em] mt-auto">
                        <span className="truncate">Current Plan</span>
                    </button>
                </div>

                {/* Gold Tier */}
                <div className="relative flex flex-col gap-5 rounded-xl border border-solid border-yellow-500/30 bg-[#1d1c27] p-6 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-yellow-500 filled">workspace_premium</span>
                                <h1 className="text-white text-lg font-bold leading-tight uppercase tracking-wider">Gold</h1>
                            </div>
                            <span className="text-white text-xs font-bold leading-normal tracking-wide rounded-full bg-gradient-to-r from-yellow-600 to-yellow-500 px-3 py-1 text-center shadow-lg shadow-yellow-500/20">
                                Best Value
                            </span>
                        </div>
                        <p className="flex items-baseline gap-1 text-white mt-1">
                            <span className="text-white text-3xl font-black leading-tight tracking-[-0.033em]">RM 15</span>
                            <span className="text-gray-400 text-sm font-bold leading-tight">/mo</span>
                        </p>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full"></div>
                    <div className="flex flex-col gap-3">
                        <FeatureItem icon="check_circle" text="5% Labor Discount" color="text-yellow-500" />
                        <FeatureItem icon="check_circle" text="Priority Booking" color="text-yellow-500" />
                        <FeatureItem icon="check_circle" text="Car Wash Voucher (1x)" color="text-yellow-500" />
                    </div>
                    <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-4 bg-primary hover:bg-primary/90 transition-all shadow-[0_4px_14px_0_rgba(55,19,236,0.39)] text-white text-sm font-bold leading-normal tracking-[0.015em] mt-auto">
                        <span className="truncate">Subscribe Now</span>
                    </button>
                </div>

                {/* Platinum Tier */}
                <div className="relative flex flex-col gap-5 rounded-xl border border-solid border-primary/50 bg-[#171520] p-6 shadow-[0_0_30px_-5px_rgba(55,19,236,0.15)] ring-1 ring-white/5">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-[50px] pointer-events-none"></div>
                    <div className="flex flex-col gap-1 relative z-10">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-300">diamond</span>
                            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 text-lg font-bold leading-tight uppercase tracking-wider">Platinum</h1>
                        </div>
                        <p className="flex items-baseline gap-1 text-white mt-1">
                            <span className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">RM 30</span>
                            <span className="text-gray-400 text-sm font-bold leading-tight">/mo</span>
                        </p>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent w-full"></div>
                    <div className="flex flex-col gap-3 relative z-10">
                        <FeatureItem icon="verified" text="10% Labor Discount" color="text-primary" />
                        <FeatureItem icon="verified" text="Free Towing (1x/year)" color="text-primary" />
                        <FeatureItem icon="verified" text="Dedicated Concierge" color="text-primary" />
                        <FeatureItem icon="verified" text="All Gold benefits included" color="text-primary opacity-80" />
                    </div>
                    <button className="relative z-10 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-4 bg-gradient-to-r from-primary to-[#5a3bf7] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(55,19,236,0.4)] text-white text-sm font-bold leading-normal tracking-[0.015em] mt-2">
                        <span className="truncate">Go Platinum</span>
                    </button>
                </div>

            </div>

            <div className="flex flex-col items-center px-4 mt-2 mb-8">
                <button className="group flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-6 bg-transparent hover:bg-white/5 transition-colors text-gray-300 text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Compare all features</span>
                    <span className="material-symbols-outlined text-base ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <button className="mt-6 text-xs text-gray-500 hover:text-gray-300 transition-colors underline decoration-gray-700 underline-offset-4">Terms & Conditions Apply</button>
            </div>
        </div>
    )
}

function FeatureItem({ icon, text, color }: { icon: string, text: string, color: string }) {
    return (
        <div className="text-sm font-medium leading-normal flex gap-3 text-gray-200 items-start">
            <span className={cn("material-symbols-outlined text-[20px] shrink-0", color)}>{icon}</span>
            <span>{text}</span>
        </div>
    )
}
