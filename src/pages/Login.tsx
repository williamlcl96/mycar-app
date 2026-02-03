import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useUser } from "../contexts/UserContext"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { supabaseAuth } from "../lib/supabaseAuth"
import { USE_SUPABASE } from "../lib/dataProvider"
import { authService } from "../lib/authService"

export function Login() {
    const navigate = useNavigate()
    const { login } = useUser()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleLogin = async () => {
        setError(null)
        if (!email || !password) {
            setError("Please fill in all fields.")
            return
        }

        setIsSubmitting(true)

        try {
            if (USE_SUPABASE) {
                // Use Supabase Auth
                const { user } = await supabaseAuth.signIn(email, password)
                if (user) {
                    const profile = await supabaseAuth.getProfile(user.id)
                    const role = profile?.role || 'customer'
                    login(email, role, {
                        id: user.id,
                        name: profile?.name || email.split('@')[0]
                    })
                    if (role === 'owner') {
                        navigate('/owner/dashboard')
                    } else {
                        navigate('/')
                    }
                }
            } else {
                // Fallback to localStorage
                const result = authService.loginAccount(email, password)

                if (result.success && result.account) {
                    setTimeout(() => {
                        const account = result.account!;
                        login(email, account.role, {
                            id: account.id,
                            name: account.role === 'customer'
                                ? (account as any).fullName || (account as any).username
                                : (account as any).workshopName
                        })
                        if (account.role === 'owner') {
                            navigate('/owner/dashboard')
                        } else {
                            navigate('/')
                        }
                    }, 800)
                } else {
                    setError(result.message || "Invalid credentials");
                }
            }
        } catch (err: any) {
            console.error('Login error:', err)
            setError(err?.message || 'Invalid email or password.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col overflow-x-hidden">
            <div className="flex items-center px-6 pt-6 pb-4">
                <button
                    onClick={() => navigate("/")}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -ml-2"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
            </div>

            <div className="px-6 pb-6">
                <h1 className="text-[#0d141b] dark:text-white tracking-tight text-[28px] font-bold leading-tight">
                    Welcome Back!
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal pt-2">
                    Log in to continue to your dashboard.
                </p>
            </div>

            {error && (
                <div className="mx-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-5 px-6 py-2">
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
                            Password
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
                    <div className="flex justify-end">
                        <a href="#" className="text-xs text-primary font-bold hover:underline">
                            Forgot Password?
                        </a>
                    </div>
                </div>

                <Button
                    onClick={handleLogin}
                    disabled={isSubmitting}
                    className="mt-4 text-base font-bold tracking-[0.015em] shadow-blue-500/20"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Logging In...</span>
                        </div>
                    ) : "Log In"}
                </Button>
            </div>

            <div className="px-6 py-4">
                <div
                    onClick={() => navigate('/register-workshop')}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 rounded-2xl shadow-lg cursor-pointer group"
                >
                    <div className="flex flex-col">
                        <span className="text-white dark:text-slate-900 font-bold text-sm">Own a workshop?</span>
                        <span className="text-slate-400 dark:text-slate-600 text-xs">Join MyCar Partner Network</span>
                    </div>
                    <div className="size-8 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-white dark:text-slate-900 text-lg">arrow_forward</span>
                    </div>
                </div>

                <div className="relative flex py-6 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">
                        Or log in with
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 px-6 pb-6">
                <button className="flex items-center justify-center gap-2 h-12 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm text-[#0d141b] dark:text-white font-medium">
                    <span className="material-symbols-outlined text-xl">g_mobiledata</span>
                    <span>Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 h-12 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm text-[#0d141b] dark:text-white font-medium">
                    <span className="material-symbols-outlined text-xl">ios</span>
                    <span>Apple</span>
                </button>
            </div>

            <div className="flex-grow"></div>

            <div className="bg-surface-light dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center gap-4 rounded-b-none sm:rounded-b-2xl">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-primary font-bold hover:underline">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    )
}
