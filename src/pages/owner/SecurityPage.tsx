import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useNotifications } from "../../lib/notifications"

export function OwnerSecurityPage() {
    const navigate = useNavigate()
    const { notify } = useNotifications()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    const handleUpdatePassword = async () => {
        // Validation
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            notify({
                title: "Update Failed",
                message: "Please fill in all password fields.",
                type: "info",
                userId: 'owner-account',
                role: 'owner'
            })
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            notify({
                title: "Update Failed",
                message: "New passwords do not match.",
                type: "info",
                userId: 'owner-account',
                role: 'owner'
            })
            return
        }

        if (formData.newPassword.length < 8) {
            notify({
                title: "Update Failed",
                message: "Password must be at least 8 characters long.",
                type: "info",
                userId: 'owner-account',
                role: 'owner'
            })
            return
        }

        setIsLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        // In a real app, we would verify the current password here.
        // For MVP simulation, we'll just "succeed" if fields are valid.

        notify({
            userId: 'owner-account', // Simulate owner context
            role: 'owner',
            title: "Success",
            message: "Workshop account password has been updated.",
            type: "info"
        })

        setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        })

        setIsLoading(false)
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-24">
            {/* Top Navigation */}
            <div className="sticky top-0 z-50 flex items-center bg-white dark:bg-zinc-900 px-4 py-3 justify-between border-b border-slate-200 dark:border-zinc-800">
                <button
                    onClick={() => navigate(-1)}
                    className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
                </button>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Password</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 px-4 pt-6 space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Change Password</h3>
                    <p className="text-sm text-slate-500 mb-6">Secure your workshop owner account with a strong password.</p>
                </div>

                <div className="space-y-4">
                    <PasswordField
                        label="Current Password"
                        value={formData.currentPassword}
                        onChange={(val) => setFormData({ ...formData, currentPassword: val })}
                    />
                    <PasswordField
                        label="New Password"
                        value={formData.newPassword}
                        onChange={(val) => setFormData({ ...formData, newPassword: val })}
                    />
                    <PasswordField
                        label="Confirm New Password"
                        value={formData.confirmPassword}
                        onChange={(val) => setFormData({ ...formData, confirmPassword: val })}
                    />
                </div>

                <div className="bg-slate-100 dark:bg-zinc-800/50 p-4 rounded-xl">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Requirement: Minimum 8 characters, include at least one number and one special character.
                    </p>
                </div>

                <button
                    onClick={handleUpdatePassword}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center h-14 bg-primary text-white rounded-2xl text-base font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 disabled:opacity-50 transition-all"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Updating...</span>
                        </div>
                    ) : "Update Password"}
                </button>

                <div className="pt-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Login Activity</h3>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800">
                        <div className="p-4 flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">smartphone</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Active Device</p>
                                <p className="text-[11px] text-slate-500">iPhone 14 Pro • Kuala Lumpur, MY</p>
                            </div>
                            <span className="text-[10px] font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full uppercase">Current</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PasswordField({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{label}</label>
            <div className="relative group">
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-5 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                />
                <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined leading-none">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
            </div>
        </div>
    )
}
