import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMockState } from "../../lib/mockState"
import { useUser } from "../../contexts/UserContext"

export function WriteReview() {
    const navigate = useNavigate()
    const { id } = useParams() // bookingId
    const { bookings, addReview, reviews } = useMockState()
    const { user } = useUser()
    const [rating, setRating] = useState(0)
    const [pricingRating, setPricingRating] = useState(0)
    const [attitudeRating, setAttitudeRating] = useState(0)
    const [professionalRating, setProfessionalRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const booking = bookings.find(b => b.id === id)

    useEffect(() => {
        // Redirect if already reviewed
        if (id && reviews.some(r => r.bookingId === id)) {
            navigate('/bookings', { replace: true })
        }
    }, [id, reviews, navigate])

    if (!booking) return <div className="p-4">Booking not found</div>

    const handleSubmit = () => {
        if (rating === 0 || pricingRating === 0 || attitudeRating === 0 || professionalRating === 0) {
            alert("Please complete all ratings")
            return
        }
        if (!user || !id) return

        setIsSubmitting(true)
        setTimeout(() => {
            addReview({
                userId: user.id,
                userName: user.name || "Anonymous",
                workshopId: booking.workshopId,
                bookingId: id,
                rating,
                pricingRating,
                attitudeRating,
                professionalRating,
                comment
            })
            setIsSubmitting(false)
            navigate('/bookings')
        }, 1000)
    }

    const RatingStars = ({ value, onChange, label, icon }: { value: number, onChange: (v: number) => void, label: string, icon: string }) => (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{label}</h3>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => onChange(star)}
                            className="focus:outline-none transition-transform active:scale-90"
                        >
                            <span
                                className={`material-symbols-outlined text-3xl ${value >= star ? 'text-yellow-400' : 'text-slate-200 dark:text-zinc-800'}`}
                                style={{ fontVariationSettings: value >= star ? "'FILL' 1" : "" }}
                            >
                                star
                            </span>
                        </button>
                    ))}
                </div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-lg">
                    {value > 0 ? value + "/5" : "Rate"}
                </span>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-display pb-24">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-50 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Write a Review</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Job #{booking.id}</p>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Workshop Summary */}
                <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-6xl">verified</span>
                    </div>
                    <div className="size-14 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-slate-100 dark:border-zinc-700 flex items-center justify-center text-primary relative z-10">
                        <span className="material-symbols-outlined text-3xl">storefront</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{booking.workshopName}</h3>
                        <p className="text-xs font-medium text-slate-500">{booking.vehicleName} • {booking.serviceType}</p>
                    </div>
                </div>

                {/* Multi-Dimensional Ratings */}
                <div className="space-y-4">
                    <div className="px-1 text-center mb-6">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">Rate your experience</h2>
                        <p className="text-sm text-slate-500 font-medium">Your feedback helps the community choose wisely!</p>
                    </div>

                    <RatingStars
                        value={rating}
                        onChange={setRating}
                        label="Overall Satisfaction"
                        icon="star"
                    />

                    <div className="grid grid-cols-1 gap-4">
                        <RatingStars
                            value={pricingRating}
                            onChange={setPricingRating}
                            label="Fair Pricing"
                            icon="payments"
                        />
                        <RatingStars
                            value={attitudeRating}
                            onChange={setAttitudeRating}
                            label="Service Attitude"
                            icon="sentiment_satisfied"
                        />
                        <RatingStars
                            value={professionalRating}
                            onChange={setProfessionalRating}
                            label="Professionalism"
                            icon="engineering"
                        />
                    </div>
                </div>

                {/* Comment Input */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share more details</label>
                        <span className="text-[10px] font-bold text-slate-400">{comment.length}/500</span>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value.slice(0, 500))}
                        placeholder="What did you like? Anything they could improve?"
                        className="w-full min-h-[120px] p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-slate-900 dark:text-white transition-all resize-none shadow-sm text-sm"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0 || pricingRating === 0 || attitudeRating === 0 || professionalRating === 0}
                        className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/25 hover:bg-blue-600 disabled:opacity-30 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : "Post Review"}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-4">
                        By posting, you agree to our Community Guidelines
                    </p>
                </div>
            </div>
        </div>
    )
}
