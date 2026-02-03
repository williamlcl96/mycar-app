import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "../contexts/UserContext"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { authService, type OwnerAccount } from "../lib/authService"
import { supabaseAuth } from "../lib/supabaseAuth"
import { supabase } from "../lib/supabaseClient"
import { workshopService } from "../services/workshopService"

export function WorkshopRegistration() {
    const navigate = useNavigate()
    const { login } = useUser()
    const [step, setStep] = useState(1)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        shopName: "",
        licenseNumber: "",
        address: "",
        phone: "",
        email: "",
        password: ""
    })

    const handleNextStep = () => {
        setError(null)
        if (step === 1) {
            if (!formData.shopName || !formData.licenseNumber || !formData.address) {
                setError("Please fill in all workshop details.")
                return
            }
            setStep(2)
        }
    }

    const handleRegister = async () => {
        setError(null)
        if (!formData.email || !formData.phone || !formData.password) {
            setError("Please fill in all details.")
            return
        }

        if (!authService.isValidEmail(formData.email)) {
            setError("Please enter a valid email address.")
            return
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }

        setIsSubmitting(true)

        try {
            let userId: string;

            // Check if user is already logged in via Supabase
            const { data: session } = await supabase.auth.getSession();

            if (session?.session?.user) {
                // User is already authenticated - use their ID
                userId = session.session.user.id;
                console.log('✅ Using existing Supabase user:', userId);

                // Update their profile to 'owner' role
                await supabase.from('profiles').update({
                    role: 'owner',
                    name: formData.shopName
                }).eq('id', userId);
            } else {
                // User is not logged in - try to sign up
                const authData = await supabaseAuth.signUp(
                    formData.email,
                    formData.password,
                    formData.shopName,
                    'owner',
                    formData.phone
                );

                if (!authData.user) throw new Error("Registration failed.");
                userId = authData.user.id;
                console.log('✅ Created new Supabase user:', userId);
            }

            // 2. Create Workshop Record
            await workshopService.create({
                owner_id: userId,
                name: formData.shopName,
                location: "Malaysia",
                address: formData.address,
                image: null,
                specialties: [],
                lat: 0,
                lng: 0,
                is_verified: false,
                experience: "New",
                response_time: "Unknown",
                completed_jobs: "0",
                business_hours: { open: "09:00", close: "18:00", closed_days: [] },
                services: [],
                status: 'ACTIVE'
            });
            console.log('✅ Workshop created in Supabase');

            // 3. Fallback for Legacy Auth (localStorage)
            const ownerAccount: OwnerAccount = {
                email: formData.email,
                password: formData.password,
                workshopName: formData.shopName,
                licenseNumber: formData.licenseNumber,
                address: formData.address,
                phone: formData.phone,
                role: 'owner',
                createdAt: new Date().toISOString()
            }
            authService.registerAccount(ownerAccount);

            // Success!
            login(formData.email, 'owner', { name: formData.shopName })
            navigate('/owner/dashboard')

        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.message || "Registration failed. Please try again.");
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex-1 flex flex-col p-6 pb-24">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors -ml-2">
                    <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Partner Registration</h1>
                    <p className="text-xs text-slate-500">Step {step} of 2</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                </div>
            )}

            {step === 1 ? (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-300">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tell us about your workshop</h2>
                        <p className="text-slate-500 text-sm">Join thousands of workshops growing with MyCar.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-semibold">Workshop Name</span>
                            <Input
                                placeholder="e.g. Ali Auto Garage"
                                value={formData.shopName}
                                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-semibold">Business License No.</span>
                            <Input
                                placeholder="SSM Number"
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-semibold">Workshop Address</span>
                            <Input
                                placeholder="Full address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </label>
                    </div>

                    <Button onClick={handleNextStep} className="mt-4">
                        Next: Owner Details
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-300">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Owner Information</h2>
                        <p className="text-slate-500 text-sm">Secure your account and manage your business.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-semibold">Owner Email</span>
                            <Input
                                type="email"
                                placeholder="name@workshop.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-semibold">Contact Number</span>
                            <Input
                                type="tel"
                                placeholder="+60 12 345 6789"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-semibold">Password</span>
                            <Input
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </label>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <Button
                            onClick={handleRegister}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Registering...</span>
                                </div>
                            ) : "Complete Registration"}
                        </Button>
                        <button onClick={() => setStep(1)} className="p-3 text-slate-500 font-bold text-sm">
                            Back
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
