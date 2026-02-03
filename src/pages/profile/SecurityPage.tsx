import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useNotifications } from "../../lib/notifications"
import { useUser } from "../../contexts/UserContext"

export function SecurityPage() {
    const navigate = useNavigate()
    const { notify } = useNotifications()
    const { user } = useUser()
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
                userId: user?.id || 'system',
                role: 'customer',
                title: "Update Failed",
                message: "Please fill in all password fields.",
                type: "info"
            })
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            notify({
                userId: user?.id || 'system',
                role: 'customer',
                title: "Update Failed",
                message: "New passwords do not match.",
                type: "info"
            })
            return
        }

        if (formData.newPassword.length < 8) {
            notify({
                userId: user?.id || 'system',
                role: 'customer',
                title: "Update Failed",
                message: "Password must be at least 8 characters long.",
                type: "info"
            })
            return
        }

        setIsLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        notify({
            userId: user?.id || 'system',
            role: 'customer',
            title: "Success",
            message: "Your password has been updated.",
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
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark">
            {/* Top Navigation */}
            <div className="sticky top-0 z-50 flex items-center bg-white dark:bg-[#1a2632] p-4 pb-2 justify-between border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="text-[#111418] dark:text-white flex size-12 shrink-0 items-center justify-start cursor-pointer hover:opacity-70 transition-opacity"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Security</h2>
            </div>

            <div className="flex-1 overflow-y-auto pb-10">
                {/* Password Section Header */}
                <div className="px-4 pb-2 pt-6">
                    <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Change Password</h3>
                </div>

                {/* Password Fields */}
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

                <div className="px-4 pb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Password must be at least 8 characters long and include a number.</p>
                </div>

                {/* Update Button */}
                <div className="px-4 py-6">
                    <button
                        onClick={handleUpdatePassword}
                        disabled={isLoading}
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] w-full shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Updating...</span>
                            </div>
                        ) : (
                            <span className="truncate">Update Password</span>
                        )}
                    </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200 dark:bg-gray-800 mx-4 my-2"></div>

                {/* 2FA Section ... (remaining sections) */}
                <div className="px-4 py-6">
                    <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Enhanced Security</h3>
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1a2632] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex flex-col gap-1 pr-4">
                            <p className="text-[#111418] dark:text-white text-base font-bold leading-normal">Two-Factor Authentication</p>
                            <p className="text-[#617589] dark:text-gray-400 text-sm font-normal leading-normal">Secure your account with SMS codes.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                {/* Login Activity ... */}
                <div className="px-4 pb-4">
                    <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Login Activity</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="bg-primary/10 text-primary flex items-center justify-center rounded-lg w-12 h-12 shrink-0">
                                <span className="material-symbols-outlined">smartphone</span>
                            </div>
                            <div className="flex flex-col flex-1">
                                <p className="text-[#111418] dark:text-white text-base font-bold leading-normal">iPhone 14 Pro</p>
                                <div className="flex items-center gap-2 text-[#617589] dark:text-gray-400 text-sm">
                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                    <span>Kuala Lumpur</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                    <span className="text-green-600 dark:text-green-400 font-medium">Active Now</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-6 mb-8 text-center">
                    <button className="text-red-500 dark:text-red-400 font-bold text-sm hover:underline flex items-center justify-center gap-2 mx-auto">
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Sign out of all other sessions
                    </button>
                </div>
            </div>
        </div>
    )
}

function PasswordField({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="flex flex-col gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#111418] dark:text-gray-300 text-base font-medium leading-normal pb-2">{label}</p>
                <div className="flex w-full flex-1 items-stretch rounded-xl overflow-hidden shadow-sm">
                    <input
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-[#1a2632] focus:border-primary h-14 placeholder:text-[#617589] dark:placeholder:text-gray-500 p-[15px] rounded-l-xl rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal transition-all"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#617589] dark:text-gray-400 flex border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-[#1a2632] items-center justify-center pr-[15px] rounded-r-xl border-l-0 cursor-pointer hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                    </div>
                </div>
            </label>
        </div>
    )
}
