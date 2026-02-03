import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { useMockState } from "../../lib/mockState"
import { useUser } from "../../contexts/UserContext"

export function AddVehicle() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { addVehicle, updateVehicle, vehicles } = useMockState()
    const { user } = useUser()

    const isEditMode = !!id
    const existingVehicle = id ? vehicles.find(v => v.id === id) : null

    const [brand, setBrand] = useState("perodua")
    const [model, setModel] = useState("")
    const [plate, setPlate] = useState("")
    const [year, setYear] = useState("2024")
    const [capacity, setCapacity] = useState("1500")
    const [isDefault, setIsDefault] = useState(true)

    useEffect(() => {
        if (existingVehicle) {
            setBrand(existingVehicle.brand || "perodua")
            setModel(existingVehicle.model || "")
            setPlate(existingVehicle.plate || "")
            setYear(existingVehicle.year || "2024")
            setCapacity(existingVehicle.capacity || "1500")
            setIsDefault(existingVehicle.isPrimary)
        }
    }, [existingVehicle])

    const handleSave = async () => {
        if (!user) return
        if (!model || !plate) {
            alert("Please fill in model and plate number")
            return
        }

        const vehicleData = {
            userId: user.id,
            name: `${brand.charAt(0).toUpperCase() + brand.slice(1)} ${model}`,
            plate: (plate || "").toUpperCase(),
            brand,
            model,
            year,
            capacity,
            isPrimary: isDefault,
            image: existingVehicle?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuD_WQ4k4a-Wsn419CWooe8phQc7_CR1-OUDNJb8bkk-r7Lbc8S83M5tO3svbTk8zdpUKeWO2-lwe6p0u48cIlD8v2rwS6dH3HDrTQ9iJMHy6GqYWjw7N5vXx44SaHBIKAAvYoZg3FE_12dVjPqQblrYntFlf2K1s6YwmZfDqq3xDG4ZG9JzRz92gyhUYGewYc0Ueybxm82TYx9AOKunnR1ED-zAWHfEGs-QmiVHTfRtOSFIGQWC0mNJOvd3g5SR9ZibawXhNmrL-v4",
        }

        if (isEditMode && id) {
            await updateVehicle(id, vehicleData)
        } else {
            await addVehicle({
                ...vehicleData,
                createdAt: new Date().toISOString()
            } as any)
        }

        navigate('/profile/my-vehicles')
    }

    return (
        <div className="relative flex flex-col min-h-screen w-full bg-background-light dark:bg-background-dark text-[#111418] dark:text-white">
            {/* Top App Bar */}
            <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1a2632] border-b border-[#e5e7eb] dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-bold leading-tight tracking-[-0.015em] text-center flex-1 pr-8">{isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
                <div className="w-2"></div>
            </header>

            {/* Main Content Form */}
            <main className="flex-1 flex flex-col p-4 gap-6 pb-24 max-w-lg mx-auto w-full">
                {/* Photo Upload Section */}
                <div className="flex flex-col gap-2">
                    <div className="relative flex flex-col items-center justify-center w-full aspect-[2/1] rounded-xl border-2 border-dashed border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-[#1a2632] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer group overflow-hidden">
                        <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                            </div>
                            <div className="text-center">
                                <p className="text-base font-bold text-[#111418] dark:text-white">Upload Vehicle Photo</p>
                                <p className="text-xs text-[#617589] dark:text-gray-400 mt-1">Tap here to select from gallery</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Car Brand Section */}
                <div className="flex flex-col gap-3">
                    <label className="text-base font-bold text-[#111418] dark:text-white">Car Brand</label>
                    <div className="grid grid-cols-4 gap-3">
                        {/* Perodua */}
                        <button
                            onClick={() => setBrand("perodua")}
                            className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${brand === 'perodua' ? 'border-primary bg-primary/5 dark:bg-primary/20' : 'border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-[#1a2632]'}`}
                            type="button"
                        >
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-700 dark:text-green-300 font-extrabold text-xs">P2</div>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Perodua</span>
                        </button>
                        {/* Proton */}
                        <button
                            onClick={() => setBrand("proton")}
                            className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${brand === 'proton' ? 'border-primary bg-primary/5 dark:bg-primary/20' : 'border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-[#1a2632]'}`}
                            type="button"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-extrabold text-xs">P1</div>
                            <span className="text-[10px] font-medium text-[#111418] dark:text-white uppercase tracking-wide">Proton</span>
                        </button>
                        {/* Honda */}
                        <button
                            onClick={() => setBrand("honda")}
                            className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${brand === 'honda' ? 'border-primary bg-primary/5 dark:bg-primary/20' : 'border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-[#1a2632]'}`}
                            type="button"
                        >
                            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-extrabold text-xs">H</div>
                            <span className="text-[10px] font-medium text-[#111418] dark:text-white uppercase tracking-wide">Honda</span>
                        </button>
                        {/* Toyota */}
                        <button
                            onClick={() => setBrand("toyota")}
                            className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${brand === 'toyota' ? 'border-primary bg-primary/5 dark:bg-primary/20' : 'border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-[#1a2632]'}`}
                            type="button"
                        >
                            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-extrabold text-xs">T</div>
                            <span className="text-[10px] font-medium text-[#111418] dark:text-white uppercase tracking-wide">Toyota</span>
                        </button>
                    </div>
                </div>

                {/* Vehicle Details Inputs */}
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-bold text-[#111418] dark:text-white">Model</label>
                        <Input
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="e.g. Myvi, X70, City, Vios"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-bold text-[#111418] dark:text-white">Plate Number</label>
                        <div className="relative">
                            <Input
                                value={plate}
                                onChange={(e) => setPlate(e.target.value)}
                                className="pl-12 uppercase"
                                placeholder="WWA 1234"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-4 bg-blue-900 rounded-[2px] overflow-hidden shadow-sm">
                                <span className="text-[8px] text-white font-bold leading-none mt-[1px]">MY</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-base font-bold text-[#111418] dark:text-white">Year</label>
                            <Input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="2024"
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-base font-bold text-[#111418] dark:text-white">Capacity</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    placeholder="1500"
                                    className="pr-10"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#617589] dark:text-gray-400 pointer-events-none">cc</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-[#dbe0e6] dark:bg-gray-700 w-full my-1"></div>

                <div className="flex items-center justify-between py-1">
                    <div className="flex flex-col gap-1">
                        <span className="text-base font-bold text-[#111418] dark:text-white">Set as Default</span>
                        <span className="text-sm text-[#617589] dark:text-gray-400">Use this vehicle for new bookings</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                        />
                        <div className="w-12 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                </div>
            </main>

            <div className="fixed bottom-16 left-0 right-0 p-4 bg-white/95 dark:bg-[#1a2632]/95 backdrop-blur-md border-t border-[#dbe0e6] dark:border-gray-800 z-30 max-w-md mx-auto">
                <div className="w-full">
                    <Button
                        onClick={handleSave}
                        className="w-full h-14 rounded-xl text-lg shadow-lg shadow-blue-500/20"
                    >
                        <span className="material-symbols-outlined mr-2">check_circle</span>
                        {isEditMode ? 'Update Vehicle' : 'Save Vehicle'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
