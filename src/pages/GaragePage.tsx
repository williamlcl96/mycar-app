import { useNavigate } from "react-router-dom"
import { BottomNav } from "../components/layout/BottomNav"

export function GaragePage() {
    const navigate = useNavigate()

    return (
        <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-20 flex items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 border-b border-slate-100 dark:border-zinc-800">
                <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-start hover:opacity-70 transition-opacity">
                    <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center pr-12">
                    My Vehicles
                </h2>
            </header>

            <main className="flex-1 px-4 py-6 flex flex-col gap-4 pb-28">
                {[
                    { name: "Proton X50", plate: "WWA 1234", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIp3e3lqxq-7eAJnqR7LyaNMaZtNf1ICeYyPPPHAEMJu5HUqNIqnvpUnqX4meAcLmTdUrlOcdX1V4bFmy9UwdlPwaynuQ0z_6iHM5tIzR5dWNXTZA6HZNXLaNDp8lO_jiicPVzZ-60acGsU6Dexq-BAvQMEh_2hxHsp9-MUi54PUt5BDHv9WkZ9aQxHqz1d-NT3cGFJpd_OEg-Ilkpb-6bUkhDXKsT4iFtT7KHDPnOya50Ruw4G35--pzbJlolmYfG3T65ibm2tWk", primary: true },
                    { name: "Perodua Myvi", plate: "VBN 8829", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_WQ4k4a-Wsn419CWooe8phQc7_CR1-OUDNJb8bkk-r7Lbc8S83M5tO3svbTk8zdpUKeWO2-lwe6p0u48cIlD8v2rwS6dH3HDrTQ9iJMHy6GqYWjw7N5vXx44SaHBIKAAvYoZg3FE_12dVjPqQblrYntFlf2K1s6YwmZfDqq3xDG4ZG9JzRz92gyhUYGewYc0Ueybxm82TYx9AOKunnR1ED-zAWHfEGs-QmiVHTfRtOSFIGQWC0mNJOvd3g5SR9ZibawXhNmrL-v4", primary: false }
                ].map((car) => (
                    <div key={car.plate} className="flex flex-col gap-4 rounded-xl bg-white dark:bg-zinc-800 p-4 shadow-sm border border-slate-100 dark:border-zinc-700">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 bg-slate-100 dark:bg-zinc-700" style={{ backgroundImage: `url("${car.image}")` }}></div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-slate-900 dark:text-white text-lg font-bold leading-normal line-clamp-1">{car.name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-600">{car.plate}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="shrink-0 text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                        </div>
                        <div className="h-px w-full bg-slate-100 dark:bg-zinc-700"></div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-200">Set as Primary</span>
                            <label className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-colors ${car.primary ? 'bg-primary justify-end' : 'bg-slate-200 dark:bg-zinc-600 justify-start'}`}>
                                <div className="h-full w-[27px] rounded-full bg-white shadow-sm"></div>
                                <input className="invisible absolute" type="checkbox" defaultChecked={car.primary} />
                            </label>
                        </div>
                    </div>
                ))}
            </main>

            <div className="fixed bottom-24 left-0 right-0 p-4 pointer-events-none z-30">
                <div className="max-w-md mx-auto w-full flex justify-center">
                    <button className="pointer-events-auto shadow-lg shadow-blue-500/30 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary text-white text-base font-bold leading-normal hover:bg-blue-600 transition-colors active:scale-[0.98]">
                        <span className="material-symbols-outlined mr-2">add</span>
                        <span className="truncate">Add New Vehicle</span>
                    </button>
                </div>
            </div>
            <BottomNav />
        </div>
    )
}
