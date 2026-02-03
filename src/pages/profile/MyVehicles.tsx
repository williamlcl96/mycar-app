import { useNavigate } from "react-router-dom"
import { cn } from "../../lib/utils"
import { useMockState } from "../../lib/mockState"

export function MyVehicles() {
    const navigate = useNavigate()
    const { vehicles, deleteVehicle, setPrimaryVehicle } = useMockState()

    const handleTogglePrimary = (id: string, current: boolean) => {
        if (!current) {
            setPrimaryVehicle(id)
        }
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
            <header className="sticky top-0 z-20 flex items-center bg-white/80 dark:bg-[#1a2632]/80 backdrop-blur-md p-4 border-b border-[#f0f2f4] dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="text-[#111418] dark:text-white flex size-12 shrink-0 items-center justify-start hover:opacity-70 transition-opacity"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
                    My Vehicles
                </h2>
            </header>

            <main className="flex-1 px-4 py-6 flex flex-col gap-4 pb-28">
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex flex-col gap-4 rounded-xl bg-white dark:bg-[#1a2632] p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 bg-gray-100 dark:bg-gray-700"
                                    style={{ backgroundImage: `url("${vehicle.image}")` }}
                                />
                                <div className="flex flex-col justify-center">
                                    <p className="text-[#111418] dark:text-white text-lg font-bold leading-normal line-clamp-1">{vehicle.name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-100 dark:bg-gray-700 text-[#617589] dark:text-gray-300 text-xs font-bold px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">{vehicle.plate}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => navigate(`/profile/edit-vehicle/${vehicle.id}`)}
                                    className="text-gray-400 hover:text-primary p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">edit_square</span>
                                </button>
                                <button
                                    onClick={() => deleteVehicle(vehicle.id)}
                                    className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                            </div>
                        </div>
                        <div className="h-px w-full bg-[#f0f2f4] dark:bg-gray-700"></div>
                        <div className="flex items-center justify-between">
                            <span className={cn("text-sm font-medium", vehicle.isPrimary ? "text-[#111418] dark:text-gray-200" : "text-gray-500 dark:text-gray-400")}>Set as Primary</span>
                            <label className={cn(
                                "relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-colors",
                                vehicle.isPrimary ? "bg-[#1380ec] justify-end" : "bg-[#f0f2f4] dark:bg-gray-600 justify-start"
                            )}>
                                <div className="h-full w-[27px] rounded-full bg-white shadow-sm"></div>
                                <input
                                    className="invisible absolute"
                                    type="checkbox"
                                    checked={vehicle.isPrimary}
                                    onChange={() => handleTogglePrimary(vehicle.id, vehicle.isPrimary)}
                                />
                            </label>
                        </div>
                    </div>
                ))}
            </main>

            <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-4 pb-6 bg-gradient-to-t from-background-light via-background-light/90 to-transparent dark:from-background-dark dark:via-background-dark/90 pointer-events-none z-30">
                <div className="w-full flex justify-center">
                    <button
                        onClick={() => navigate('/profile/add-vehicle')}
                        className="pointer-events-auto shadow-lg shadow-blue-500/30 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-[#1380ec] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined mr-2">add</span>
                        <span className="truncate">Add New Vehicle</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
