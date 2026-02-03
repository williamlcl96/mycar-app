import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useMockState } from "../../lib/mockState"
import type { Booking } from "../../lib/mockState"
import { useUser } from "../../contexts/UserContext"

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function BookingPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { workshops, addBooking, vehicles } = useMockState()
    const { user } = useUser()
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [selectedServices, setSelectedServices] = useState<string[]>([])
    const [selectedDate, setSelectedDate] = useState<string>("")
    const [selectedTime, setSelectedTime] = useState<string>("")

    const services = [
        { id: "s1", title: "Oil Change" },
        { id: "s2", title: "Brake Pad Replacement" },
        { id: "s3", title: "General Inspection" },
        { id: "s4", title: "AC Service" },
        { id: "s5", title: "Others" },
    ]

    const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]

    const toggleService = (id: string) => {
        if (selectedServices.includes(id)) {
            setSelectedServices(selectedServices.filter(s => s !== id))
        } else {
            setSelectedServices([...selectedServices, id])
        }
    }

    // Date Logic
    const workshop = workshops.find(w => w.id === id);
    const isAfterHours = (() => {
        if (!workshop?.businessHours) return false;
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        return timeStr >= workshop.businessHours.close;
    })();
    const startOffset = isAfterHours ? 1 : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-display pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
                <button onClick={() => step > 1 ? setStep(step - 1 as any) : navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
                </button>
                <h1 className="font-bold text-lg text-slate-900 dark:text-white">
                    {step === 1 ? "Select Services" : step === 2 ? "Schedule Appointment" : "Confirm Booking"}
                </h1>
                <div className="w-10"></div>
            </header>

            <main className="p-4 max-w-md mx-auto">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-6">
                    <div className={cn("h-1 flex-1 rounded-full bg-primary transition-all")} />
                    <div className={cn("h-1 flex-1 rounded-full transition-all", step >= 2 ? "bg-primary" : "bg-slate-200 dark:bg-zinc-800")} />
                    <div className={cn("h-1 flex-1 rounded-full transition-all", step >= 3 ? "bg-primary" : "bg-slate-200 dark:bg-zinc-800")} />
                </div>

                {step === 1 && (
                    <div className="flex flex-col gap-3">
                        {services.map(service => (
                            <div
                                key={service.id}
                                onClick={() => toggleService(service.id)}
                                className={cn(
                                    "p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all",
                                    selectedServices.includes(service.id)
                                        ? "bg-blue-50 dark:bg-blue-900/20 border-primary shadow-sm"
                                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                                )}
                            >
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{service.title}</h3>
                                </div>
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                    selectedServices.includes(service.id)
                                        ? "border-primary bg-primary text-white"
                                        : "border-slate-300 dark:border-zinc-600"
                                )}>
                                    {selectedServices.includes(service.id) && <span className="material-symbols-outlined text-[14px]">check</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        {/* Date Picker */}
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Select Date</h3>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {Array.from({ length: 7 }).map((_, i) => {


                                    // If after hours, start from tomorrow (offset 1), otherwise today (offset 0)
                                    const startOffset = isAfterHours ? 1 : 0;

                                    const offset = i + startOffset;
                                    const d = new Date()
                                    d.setDate(d.getDate() + offset)
                                    const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
                                    const value = d.toISOString().split('T')[0]

                                    return (
                                        <button
                                            key={value}
                                            onClick={() => setSelectedDate(value)}
                                            className={cn(
                                                "flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-xl border transition-all",
                                                selectedDate === value
                                                    ? "bg-primary text-white border-primary shadow-lg shadow-blue-500/30"
                                                    : "bg-slate-50 dark:bg-zinc-800 border-transparent text-slate-600 dark:text-slate-400"
                                            )}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">{label.split(' ')[0]}</span>
                                            <span className="text-xl font-black">{label.split(' ')[1]}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Time Picker */}
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Select Time</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {timeSlots.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={cn(
                                            "py-2 px-3 rounded-lg text-sm font-medium border transition-colors",
                                            selectedTime === time
                                                ? "bg-blue-50 dark:bg-blue-900/20 border-primary text-primary"
                                                : "bg-slate-50 dark:bg-zinc-800 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-700"
                                        )}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">check</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Booking Confirmed!</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Your appointment has been scheduled.</p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">What happens next?</h3>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 mb-4 list-disc pl-4">
                                <li>The workshop will review your request.</li>
                                <li>You will receive a quote for approval.</li>
                                <li>Once approved, you can make payment securely.</li>
                            </ul>
                            <button
                                onClick={() => navigate('/bookings')}
                                className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                            >
                                View My Bookings
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Nav */}
            {step < 3 && (
                <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white dark:bg-zinc-900 p-4 border-t border-slate-200 dark:border-zinc-800 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <button
                        disabled={step === 1 ? selectedServices.length === 0 : !selectedDate || !selectedTime}
                        onClick={() => {
                            if (step === 1) setStep(2)
                            else {
                                // Find workshop
                                const workshop = workshops.find((w: any) => w.name.includes("Ali") || w.location.includes("Ampang")) // Fallback mock

                                // Find primary vehicle
                                const primaryVehicle = vehicles.find(v => v.isPrimary) || vehicles[0]

                                // Create Booking
                                const newBooking: Partial<Booking> = {
                                    id: `MY-${Math.floor(Math.random() * 9000) + 1000}`,
                                    customerId: user?.id || 'u1',
                                    workshopId: id || 'w1',
                                    workshopName: workshop?.name || "Ali's Auto expert",
                                    workshopImage: workshop?.image || "https://images.unsplash.com/photo-1613214292775-430961239c89?q=80&w=200&auto=format&fit=crop",
                                    customerName: user?.name || 'Ahmad Ali',
                                    serviceType: selectedServices.length > 1 ? "Multiple Services" : services.find(s => s.id === selectedServices[0])?.title || "Service",
                                    services: selectedServices.map(sid => services.find(s => s.id === sid)?.title || ""),
                                    date: selectedDate,
                                    time: selectedTime,
                                    status: 'PENDING',
                                    vehicleName: primaryVehicle?.name || 'Proton X50',
                                    vehiclePlate: primaryVehicle?.plate || 'VAA 1234',
                                    createdAt: new Date().toISOString()
                                }
                                addBooking(newBooking as any)
                                setStep(3)
                            }
                        }}
                        className="w-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95"
                    >
                        {step === 1 ? "Date & Time" : "Confirm Booking"}
                    </button>
                </div>
            )}
        </div>
    )
}
