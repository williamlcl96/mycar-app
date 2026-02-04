import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import { useUser } from "../../contexts/UserContext"
import { shopService } from "../../lib/shopService"

export function OwnerReviewsPage() {
    const navigate = useNavigate()
    const { reviews, workshops, replyToReview } = useMockState()
    const { user } = useUser()
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({})
    const [isReplying, setIsReplying] = useState<string | null>(null)

    // Safeguard for missing state
    if (!reviews || !workshops || !Array.isArray(reviews) || !Array.isArray(workshops)) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-white p-10 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">error</span>
                <p className="text-sm font-bold text-slate-400">Loading reviews...</p>
            </div>
        )
    }

    const shopId = useMemo(() => {
        if (!user) return 'w1'
        if (user.workshopId) return user.workshopId;
        const shopData = shopService.getShopData(user.email)
        const found = workshops?.find(w => w.name === shopData?.workshopName)
        return found?.id || 'none'
    }, [user, workshops])

    const myReviews = useMemo(() => {
        return (reviews || []).filter(r => r.workshopId === shopId)
    }, [reviews, shopId])

    const stats = useMemo(() => {
        if (myReviews.length === 0) return { avg: 0, total: 0, pricing: 0, professional: 0, attitude: 0 }
        const total = myReviews.length

        const sum = (key: 'rating' | 'pricingRating' | 'attitudeRating' | 'professionalRating') =>
            myReviews.reduce((acc, r) => acc + (Number(r[key]) || 0), 0)

        return {
            avg: sum('rating') / total,
            total,
            pricing: sum('pricingRating') / total,
            professional: sum('professionalRating') / total,
            attitude: sum('attitudeRating') / total
        }
    }, [myReviews])

    const handleReply = (reviewId: string) => {
        const text = replyText[reviewId]
        if (!text?.trim()) return
        replyToReview(reviewId, text)
        setIsReplying(null)
        setReplyText(prev => ({ ...prev, [reviewId]: '' }))
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return ''
        try {
            return new Date(dateStr).toLocaleDateString()
        } catch (e) {
            return dateStr || ''
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 font-display">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Shop Reviews</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Manage customer feedback</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {/* Stats Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overall Rating</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">{stats.avg.toFixed(1)}</span>
                                <span className="text-sm font-bold text-slate-400">/ 5.0</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Reviews</p>
                            <p className="text-2xl font-black text-primary">{stats.total}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-2xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Pricing</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{stats.pricing.toFixed(1)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-2xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Service</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{stats.attitude.toFixed(1)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-2xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Skill</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{stats.professional.toFixed(1)}</p>
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Customer Reviews</h2>

                    {myReviews.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-zinc-800">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">rate_review</span>
                            <p className="text-sm font-bold text-slate-400">No reviews yet</p>
                        </div>
                    ) : (
                        myReviews.map(review => (
                            <div key={review.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {(review.userName || 'A').charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{review.userName || 'Anonymous'}</p>
                                            <p className="text-[10px] text-slate-400">{formatDate(review.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 px-2 py-1 rounded-lg">
                                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="text-xs font-black">{Number(review.rating) || 0}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                                    "{review.comment || 'No comment provided.'}"
                                </p>

                                {/* Detailed Ratings */}
                                <div className="flex flex-wrap gap-2">
                                    <div className="px-2 py-1 rounded-md bg-slate-50 dark:bg-zinc-800 flex gap-1.5 items-center">
                                        <span className="text-[8px] font-black text-slate-400 uppercase">Price</span>
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{Number(review.pricingRating) || '-'}</span>
                                    </div>
                                    <div className="px-2 py-1 rounded-md bg-slate-50 dark:bg-zinc-800 flex gap-1.5 items-center">
                                        <span className="text-[8px] font-black text-slate-400 uppercase">Attitude</span>
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{Number(review.attitudeRating) || '-'}</span>
                                    </div>
                                    <div className="px-2 py-1 rounded-md bg-slate-50 dark:bg-zinc-800 flex gap-1.5 items-center">
                                        <span className="text-[8px] font-black text-slate-400 uppercase">Pro</span>
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{Number(review.professionalRating) || '-'}</span>
                                    </div>
                                </div>

                                {/* Reply Section */}
                                <div className="pt-4 border-t border-slate-50 dark:border-zinc-800">
                                    {review.reply ? (
                                        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Your Response</p>
                                                <p className="text-[8px] text-slate-400 font-bold">{formatDate(review.repliedAt)}</p>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">
                                                "{review.reply}"
                                            </p>
                                        </div>
                                    ) : (
                                        isReplying === review.id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    autoFocus
                                                    value={replyText[review.id] || ''}
                                                    onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                                                    placeholder="Write your response to the customer..."
                                                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-1 focus:ring-primary outline-none min-h-[80px] dark:text-white"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReply(review.id)}
                                                        className="flex-1 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                                                    >
                                                        Submit Reply
                                                    </button>
                                                    <button
                                                        onClick={() => setIsReplying(null)}
                                                        className="px-4 py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsReplying(review.id)}
                                                className="w-full py-2 flex items-center justify-center gap-2 text-slate-400 hover:text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">reply</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Reply to customer</span>
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
