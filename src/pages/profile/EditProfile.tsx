import { useNavigate } from "react-router-dom"
import { useUser } from "../../contexts/UserContext"
import { useState, useEffect } from "react"

export function EditProfile() {
    const navigate = useNavigate()
    const { user, updateProfile } = useUser()
    const [formData, setFormData] = useState({
        name: "",
        gender: "other" as 'male' | 'female' | 'other',
        phone: "",
        address: ""
    })
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                gender: user.gender || "other",
                phone: user.phone || "",
                address: user.address || ""
            })
        }
    }, [user])

    const handleSave = () => {
        setIsSaving(true)
        // Simulate a small delay for feedback
        setTimeout(() => {
            updateProfile(formData)
            setIsSaving(false)
            setShowSuccess(true)
            setTimeout(() => {
                setShowSuccess(false)
                navigate(-1)
            }, 1500)
        }, 800)
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-white flex flex-col">
            {/* Navigation Bar */}
            <div className="sticky top-0 z-50 flex items-center justify-between bg-white dark:bg-[#1a2633] p-4 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-[#111418] dark:text-white">arrow_back</span>
                </button>
                <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Edit Profile</h2>
                <div className="size-10"></div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 flex flex-col gap-6 p-4 pb-24">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative group cursor-pointer">
                        <div className="h-32 w-32 rounded-full bg-cover bg-center border-4 border-white dark:border-[#1a2633] shadow-md overflow-hidden bg-slate-200">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Ali'}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg border-2 border-white dark:border-[#1a2633]">
                            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                        </div>
                    </div>
                    <button className="text-primary font-bold text-base hover:opacity-80 transition-opacity">Change Photo</button>
                </div>

                {/* Form Fields */}
                <div className="flex flex-col gap-5">
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[#111418] dark:text-gray-200 text-base font-medium">Full Name</label>
                        <input
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2633] p-4 text-base text-[#111418] dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-14"
                            placeholder="Enter your full name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    {/* Gender (Select) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[#111418] dark:text-gray-200 text-base font-medium">Gender</label>
                        <div className="relative">
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                                className="w-full appearance-none rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2633] p-4 pr-12 text-base text-[#111418] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-14"
                            >
                                <option value="" disabled>Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <span className="material-symbols-outlined">expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[#111418] dark:text-gray-200 text-base font-medium flex items-center gap-2">
                            Email Address
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded-full">Read-only</span>
                        </label>
                        <div className="relative">
                            <input
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#131d27] p-4 pr-12 text-base text-gray-500 dark:text-gray-400 h-14 cursor-not-allowed select-none"
                                readOnly
                                type="email"
                                value={user?.email || ""}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                <span className="material-symbols-outlined text-[20px]">lock</span>
                            </div>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[#111418] dark:text-gray-200 text-base font-medium">Phone Number</label>
                        <div className="flex w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2633] overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all h-14">
                            <div className="flex items-center justify-center bg-gray-50 dark:bg-[#23303e] px-4 border-r border-gray-300 dark:border-gray-700">
                                <span className="text-base font-medium text-[#111418] dark:text-white flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">flag</span>
                                    +60
                                </span>
                            </div>
                            <input
                                className="flex-1 bg-transparent p-4 text-base text-[#111418] dark:text-white placeholder:text-gray-400 focus:outline-none border-none focus:ring-0"
                                placeholder="12-345 6789"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[#111418] dark:text-gray-200 text-base font-medium">Address</label>
                        <textarea
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2633] p-4 text-base text-[#111418] dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-28 resize-none"
                            placeholder="Enter your address"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {/* Sticky Footer Action Button */}
            <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white dark:bg-[#1a2633] p-4 border-t border-gray-100 dark:border-gray-800 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-lg h-14 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isSaving ? (
                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : showSuccess ? (
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span>Success!</span>
                        </div>
                    ) : (
                        <span>Save Changes</span>
                    )}
                </button>
            </div>
        </div>
    )
}
