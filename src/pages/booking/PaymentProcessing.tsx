import { useEffect, useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useMockState } from "../../lib/mockState"
import { paymentService, type PaymentStatus } from "../../lib/paymentService"
import { Button } from "../../components/ui/Button"

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function PaymentProcessing() {
    const navigate = useNavigate()
    const location = useLocation()
    const { updateBookingStatus } = useMockState()
    const [status, setStatus] = useState<PaymentStatus>('PROCESSING')
    const [step, setStep] = useState(1)
    const [error, setError] = useState<string | null>(null)
    const { bookingId, amount, paymentDetails } = location.state || {}
    const startedRef = useRef(false)

    useEffect(() => {
        if (!bookingId || !paymentDetails || startedRef.current) return;

        startedRef.current = true;

        const process = async () => {
            try {
                // Step 1: Initiating
                setStep(1);
                await new Promise(r => setTimeout(r, 1000));

                // Step 2: Method-specific auth
                setStep(2);
                const result = await paymentService.processPayment(bookingId, amount, paymentDetails);

                // Step 3: Finalizing
                setStep(3);
                await new Promise(r => setTimeout(r, 1000));

                if (result.status === 'SUCCESS') {
                    updateBookingStatus(bookingId, 'PAID');
                    navigate('/payment/success', {
                        state: {
                            bookingId,
                            amount,
                            method: paymentDetails.method,
                            transactionId: result.transactionId,
                            status: 'SUCCESS',
                            bankName: paymentDetails.fpx?.bankName
                        }
                    });
                } else if (result.status === 'PENDING') {
                    navigate('/payment/success', {
                        state: {
                            bookingId,
                            amount,
                            method: paymentDetails.method,
                            transactionId: result.transactionId,
                            status: 'PENDING',
                            bankName: paymentDetails.fpx?.bankName
                        }
                    });
                } else {
                    setStatus('FAILED');
                    setError(result.error || 'The transaction was declined.');
                }
            } catch (err) {
                setStatus('FAILED');
                setError('A system error occurred. Please try again.');
            }
        };

        process();
    }, [bookingId, amount, paymentDetails, navigate, updateBookingStatus]);

    const handleRetry = () => {
        navigate(-1);
    };

    const getStepLabel = (s: number) => {
        if (paymentDetails?.method === 'fpx') {
            if (s === 1) return "Connecting to FPX Secure Gateway";
            if (s === 2) return "Waiting for Bank Auth";
            return "Verifying with FPX";
        }
        if (paymentDetails?.method === 'ewallet') {
            if (s === 1) return "Requesting Wallet Auth";
            if (s === 2) return "Simulating Authorization";
            return "Confirming Balance";
        }
        // Default / Card
        if (s === 1) return "Securing Connection";
        if (s === 2) return "Authenticating with Issuer";
        return "Finalizing Transaction";
    };

    return (
        <div className="font-display bg-slate-50 dark:bg-zinc-950 min-h-screen flex flex-col">
            <header className="flex items-center bg-white dark:bg-zinc-900 p-4 pb-2 justify-between">
                <div className="size-12"></div>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Payment</h2>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                    {status === 'PROCESSING' ? (
                        <>
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20 scale-110 animate-pulse"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <div className="bg-primary/10 dark:bg-primary/20 p-8 rounded-full flex flex-col items-center justify-center transition-all duration-500">
                                <span className="material-symbols-outlined text-primary text-6xl">
                                    {paymentDetails?.method === 'card' ? 'credit_card' :
                                        paymentDetails?.method === 'fpx' ? 'account_balance' : 'account_balance_wallet'}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-full flex flex-col items-center justify-center animate-in zoom-in duration-300">
                            <span className="material-symbols-outlined text-red-500 text-6xl">error</span>
                        </div>
                    )}
                </div>

                <h3 className="text-slate-900 dark:text-white tracking-tight text-2xl font-black leading-tight px-4 text-center pb-2 pt-5">
                    {status === 'PROCESSING' ? 'Securely Processing...' : 'Payment Failed'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-base font-bold leading-normal pb-8 pt-1 px-4 text-center max-w-sm">
                    {status === 'PROCESSING'
                        ? 'Please do not close the app or refresh the page.'
                        : error}
                </p>

                {status === 'PROCESSING' && (
                    <div className="w-full max-w-xs space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 shadow-sm",
                                step >= i ? "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700" : "bg-white/50 dark:bg-zinc-900/50 border-transparent opacity-50"
                            )}>
                                {step > i ? (
                                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                ) : step === i ? (
                                    <div className="size-5 flex items-center justify-center">
                                        <div className="size-2 bg-primary rounded-full animate-ping"></div>
                                    </div>
                                ) : (
                                    <div className="size-2 bg-slate-300 dark:bg-slate-700 rounded-full mx-1.5"></div>
                                )}
                                <p className={cn(
                                    "text-sm font-black uppercase tracking-widest",
                                    step >= i ? "text-slate-900 dark:text-white" : "text-slate-400"
                                )}>
                                    {getStepLabel(i)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {status === 'FAILED' && (
                    <div className="w-full max-w-xs">
                        <Button onClick={handleRetry} className="w-full h-14 rounded-2xl text-base font-black uppercase tracking-widest gap-2">
                            <span className="material-symbols-outlined">restart_alt</span>
                            Try Different Method
                        </Button>
                    </div>
                )}
            </main>

            <footer className="mt-auto p-6">
                <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 px-4 min-h-16 justify-between rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="text-primary flex items-center justify-center rounded-xl bg-primary/10 shrink-0 size-10">
                            <span className="material-symbols-outlined">lock</span>
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white text-sm font-black uppercase tracking-tighter">SafePay Escrow</p>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">End-to-end encrypted</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
