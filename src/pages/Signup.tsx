import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useUser } from "../contexts/UserContext"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { supabaseAuth } from "../lib/supabaseAuth"
import { USE_SUPABASE } from "../lib/dataProvider"
import { authService, type UserAccount } from "../lib/authService"

export function Signup() {
    const navigate = useNavigate()
    const { login } = useUser()
    const [step, setStep] = useState(1)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [phone, setPhone] = useState("")
    const [username, setUsername] = useState("")

    const handleNextStep = () => {
        setError(null)
        if (step === 1) {
            if (!email || !password) {
                setError("Please fill in all fields.")
                return
            }
            if (!authService.isValidEmail(email)) {
                setError("Please enter a valid email address.")
                return
            }
            if (password.length < 6) {
                setError("Password must be at least 6 characters.")
                return
            }
            // Check if email already exists before moving to step 2
            const accounts = authService.getAccounts()
            if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
                setError("An account with this email already exists.")
                return
            }
            setStep(2)
        }
    }

    const handleSignup = async () => {
        setError(null)
        if (!fullName || !phone || !username) {
            setError("Please fill in all fields.")
            return
        }

        setIsSubmitting(true)

        try {
            if (USE_SUPABASE) {
                // Use Supabase Auth - pass phone number
                await supabaseAuth.signUp(email, password, fullName, 'customer', phone)
                // Supabase will auto-create profile via trigger
                // For now, also login locally for UI consistency
                login(email, 'customer', { name: fullName, phone: '+60 ' + phone })
                navigate('/')
            } else {
                // Fallback to localStorage
                const registrationData: UserAccount = {
                    email,
                    password,
                    username,
                    fullName,
                    role: 'customer',
                    createdAt: new Date().toISOString()
                }

                const result = authService.registerAccount(registrationData)

                if (result.success) {
                    setTimeout(() => {
                        login(email, 'customer', { name: fullName })
                        navigate('/')
                    }, 1000)
                } else {
                    setError(result.message)
                }
            }
        } catch (err: any) {
            console.error('Signup error:', err)
            setError(err?.message || 'Failed to create account. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col overflow-x-hidden">
            {/* Header / Progress */}
            <div className="grid grid-cols-3 items-center px-6 pt-6 pb-4">
                <div className="flex justify-start">
                    <button
                        onClick={() => step === 1 ? navigate("/") : setStep(step - 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -ml-2"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                </div>
                <div className="flex justify-center items-center gap-1.5 w-full">
                    <div className={`h-1.5 flex flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    <div className={`h-1.5 flex flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                </div>
                <div className="flex justify-end">
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="px-6 pb-4">
                <h1 className="text-[#0d141b] dark:text-white tracking-tight text-[28px] font-bold leading-tight">
                    {step === 1 ? "Create Account" : "Personal Details"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal pt-2">
                    {step === 1 ? "Join Malaysia's most trusted car workshop network." : "Tell us a bit more about yourself."}
                </p>
            </div>

            {error && (
                <div className="mx-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-5 px-6 py-2">
                {step === 1 && (
                    <div className="flex flex-col gap-5 animate-in slide-in-from-right duration-300">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold leading-normal">
                                Email Address
                            </span>
                            <Input
                                type="email"
                                placeholder="name@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                endIcon={<span className="material-symbols-outlined text-[20px]">mail</span>}
                            />
                        </label>

                        <div className="flex flex-col gap-1.5">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold leading-normal">
                                    Create Password
                                </span>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                                    </button>
                                </div>
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`flex-1 h-1 rounded-full ${password.length >= 2 ? 'bg-red-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                <div className={`flex-1 h-1 rounded-full ${password.length >= 4 ? 'bg-yellow-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                <div className={`flex-1 h-1 rounded-full ${password.length >= 6 ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                <div className={`flex-1 h-1 rounded-full ${password.length >= 8 ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                            </div>
                        </div>

                        <Button
                            onClick={handleNextStep}
                            className="mt-2 text-base font-bold tracking-[0.015em] shadow-blue-500/20"
                        >
                            Continue
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-5 animate-in slide-in-from-right duration-300">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold leading-normal">
                                Username
                            </span>
                            <Input
                                placeholder="e.g. ahmad_ali"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                endIcon={<span className="material-symbols-outlined text-[20px]">person</span>}
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold leading-normal">
                                Full Name
                            </span>
                            <Input
                                placeholder="e.g. Ahmad Ali"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                endIcon={<span className="material-symbols-outlined text-[20px]">badge</span>}
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold leading-normal">
                                Phone Number
                            </span>
                            <div className="relative flex items-center">
                                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 z-10">
                                    <span className="text-slate-500 font-medium pr-3 border-r border-slate-200 dark:border-slate-700 h-5 flex items-center text-sm">
                                        +60
                                    </span>
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark focus:border-primary h-12 placeholder:text-slate-400 pl-[4.5rem] pr-4 py-4 text-base font-normal leading-normal transition-all shadow-sm"
                                    placeholder="12-345-6789"
                                />
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                                    smartphone
                                </span>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 mt-1 group cursor-pointer">
                            <input
                                type="checkbox"
                                className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary dark:bg-surface-dark dark:checked:bg-primary mt-1 w-4 h-4 transition-colors"
                            />
                            <span className="text-sm text-slate-500 dark:text-slate-400 leading-snug">
                                I agree to the{" "}
                                <a href="#" className="text-primary font-semibold hover:underline">
                                    Terms and Conditions
                                </a>{" "}
                                and{" "}
                                <a href="#" className="text-primary font-semibold hover:underline">
                                    Privacy Policy
                                </a>
                                .
                            </span>
                        </label>

                        <Button
                            onClick={handleSignup}
                            disabled={isSubmitting}
                            className="mt-2 text-base font-bold tracking-[0.015em] shadow-blue-500/20"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Creating Account...</span>
                                </div>
                            ) : "Create Account"}
                        </Button>
                    </div>
                )}
            </div>

            <div className="px-6 py-2">
                {/* Workshop Link is usually only on Login, but can keep here if needed or remove. Removing for cleaner wizard. */}
                {step === 1 && (
                    <>
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">
                                Or sign up with
                            </span>
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pb-4">
                            <button className="flex items-center justify-center gap-2 h-12 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm text-[#0d141b] dark:text-white font-medium">
                                <span className="material-symbols-outlined text-xl">g_mobiledata</span>
                                <span>Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 h-12 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm text-[#0d141b] dark:text-white font-medium">
                                <span className="material-symbols-outlined text-xl">ios</span>
                                <span>Apple</span>
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="flex-grow"></div>

            <div className="bg-surface-light dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center gap-4 rounded-b-none sm:rounded-b-2xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    )
}
