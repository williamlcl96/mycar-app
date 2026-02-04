import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { useUser } from "../../contexts/UserContext"
import type { OwnerAccount } from "../../lib/authService"
import { supabase } from "../../lib/supabaseClient"
import { useNotifications } from "../../lib/notifications"
import { LocationPicker } from "../../components/owner/LocationPicker"
import { shopService } from "../../lib/shopService"
import { USE_SUPABASE } from "../../lib/dataProvider"
import { workshopService as workshopDataService } from "../../services/workshopService"
import { normalizeSpecialty, VALID_CATEGORIES } from "../../lib/utils"
import { simulateReverseGeocode } from "../../lib/geoUtils"

export function EditShopProfile() {
    const navigate = useNavigate()
    const { user } = useUser()
    const { notify } = useNotifications()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<Partial<OwnerAccount>>({
        workshopName: "",
        address: "",
        phone: "",
        contactEmail: "",
        city: "",
        postcode: "",
        businessHours: { open: "09:00", close: "18:00" },
        coordinates: { lat: 3.1390, lng: 101.6869 }, // Default KL
        services: [],
        specialties: []
    })
    const [showAdvancedCoords, setShowAdvancedCoords] = useState(false)

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) return;

            // 1. Load from legacy localStorage for backward compatibility
            const localData = shopService.getShopData(user.email);
            if (localData) {
                setFormData(prev => ({
                    ...prev,
                    workshopName: localData.workshopName || "",
                    address: localData.address || "",
                    phone: localData.phone || "",
                    contactEmail: localData.contactEmail || "",
                    city: localData.city || "",
                    postcode: localData.postcode || "",
                    businessHours: localData.businessHours || { open: "09:00", close: "18:00" },
                    coordinates: localData.coordinates || { lat: 3.1390, lng: 101.6869 },
                    services: localData.services || [],
                    specialties: (localData.specialties || [])
                        .map((s: string) => normalizeSpecialty(s))
                        .filter((s: string) => VALID_CATEGORIES.includes(s)),
                    servicePrices: localData.servicePrices || {}
                }));
            }

            // 2. Override with Supabase data if available and enabled
            if (USE_SUPABASE) {
                try {
                    const { data: authData } = await supabase.auth.getUser();
                    const supabaseUserId = authData?.user?.id;
                    if (supabaseUserId) {
                        const workshop = await workshopDataService.getByOwner(supabaseUserId);
                        if (workshop) {
                            setFormData(prev => ({
                                ...prev,
                                workshopName: workshop.name || prev.workshopName,
                                address: workshop.address || prev.address,
                                city: workshop.location || prev.city,
                                businessHours: workshop.business_hours || prev.businessHours,
                                coordinates: { lat: workshop.lat, lng: workshop.lng },
                                services: workshop.services || prev.services,
                                specialties: (workshop.specialties || prev.specialties || [])
                                    .map((s: string) => normalizeSpecialty(s))
                                    .filter((s: string) => VALID_CATEGORIES.includes(s))
                            }));
                        }
                    }
                } catch (err) {
                    console.error('Failed to load workshop data from Supabase:', err);
                }
            }
        };

        loadInitialData();
    }, [user])


    const handleSave = async () => {
        if (!user) return

        // Validate compulsory fields
        if (!formData.city?.trim() || !formData.postcode?.trim()) {
            notify({
                title: "Incomplete Details",
                message: "City and Postcode are compulsory for the workshop profile.",
                type: "info",
                role: user.role || 'owner',
                userId: user.id
            });
            return;
        }

        setIsLoading(true)
        const result = shopService.updateShopData(user.email, formData)

        // Push to Supabase if enabled
        if (USE_SUPABASE && result.success) {
            try {
                // Get the real Supabase Auth UUID
                const { data: authData } = await supabase.auth.getUser();
                const supabaseUserId = authData?.user?.id;

                if (supabaseUserId) {
                    // Update Workshop Table
                    const { error: workshopError } = await supabase
                        .from('workshops')
                        .update({
                            name: formData.workshopName,
                            address: formData.address,
                            location: formData.city, // Using city as general location
                            phone: formData.phone,
                            business_hours: formData.businessHours,
                            lat: formData.coordinates?.lat,
                            lng: formData.coordinates?.lng,
                            services: formData.services || [], // Sync services as JSONB array
                            specialties: (formData.specialties || []).filter(s => VALID_CATEGORIES.includes(s))
                        })
                        .eq('owner_id', supabaseUserId)

                    if (workshopError) console.error('Failed to update workshop in Supabase:', workshopError)

                    // Update Profile Table (phone)
                    if (formData.phone) {
                        const { error: profileError } = await supabase
                            .from('profiles')
                            .update({ phone: formData.phone })
                            .eq('id', supabaseUserId)

                        if (profileError) console.error('Failed to update profile phone:', profileError)
                    }

                    console.log('✅ Workshop updated in Supabase')
                }
            } catch (err) {
                console.error('Supabase update error:', err)
            }
        }

        setTimeout(() => {
            setIsLoading(false)
            if (result.success) {
                notify({
                    title: "Success",
                    message: result.message,
                    type: "info",
                    role: user.role || 'owner',
                    userId: user.id
                });
                navigate("/owner/profile")
            } else {
                notify({
                    title: "Update Failed",
                    message: result.message,
                    type: "info",
                    role: user.role || 'owner',
                    userId: user.id
                });
            }
        }, 800)
    }


    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-4 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <span className="material-symbols-outlined block">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Shop Profile</h2>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto flex-1">
                {/* Basic Info */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Business Identity</h3>
                    <div className="flex flex-col gap-4">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Workshop Name</span>
                            <Input
                                value={formData.workshopName}
                                onChange={(e) => setFormData({ ...formData, workshopName: e.target.value })}
                                placeholder="e.g. Ali's Auto Expert"
                            />
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contact Phone</span>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+60 12-345 6789"
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contact Email</span>
                                <Input
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                    placeholder="contact@shop.com"
                                />
                            </label>
                        </div>
                    </div>
                </section>

                {/* Business Hours */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Business Hours</h3>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-slate-500">Open Time</span>
                            <Input
                                type="time"
                                value={formData.businessHours?.open}
                                onChange={(e) => setFormData({ ...formData, businessHours: { ...formData.businessHours!, open: e.target.value } })}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-slate-500">Close Time</span>
                            <Input
                                type="time"
                                value={formData.businessHours?.close}
                                onChange={(e) => setFormData({ ...formData, businessHours: { ...formData.businessHours!, close: e.target.value } })}
                            />
                        </label>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Location & Map</h3>
                    <div className="space-y-6 p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">

                        <div className="space-y-4">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Street Address</span>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none h-24 text-sm"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="No. 12, Jalan SS2/67..."
                                />
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">City</span>
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Petaling Jaya"
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Postcode</span>
                                    <Input
                                        value={formData.postcode}
                                        onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                                        placeholder="47300"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Pinpoint Location</label>
                            <LocationPicker
                                initialCenter={formData.coordinates || { lat: 3.1390, lng: 101.6869 }}
                                onLocationChange={(coords, isManualDrag) => {
                                    const geo = simulateReverseGeocode(coords);
                                    setFormData(prev => ({
                                        ...prev,
                                        coordinates: coords,
                                        // Only overwrite address if manually dragging or if address is empty
                                        address: (isManualDrag || !prev.address) ? geo.address : prev.address,
                                        city: (isManualDrag || !prev.city) ? geo.city : prev.city,
                                        postcode: (isManualDrag || !prev.postcode) ? geo.postcode : prev.postcode
                                    }));
                                }}
                                placeholderAddress={`${formData.address}, ${formData.city} ${formData.postcode}`}
                            />
                        </div>

                        {/* Address Preview */}
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-700">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Preview for Users</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {formData.address || "No address set"}{formData.city ? `, ${formData.city}` : ""}{formData.postcode ? ` ${formData.postcode}` : ""}
                            </p>
                        </div>

                        {/* Advanced Toggle */}
                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <button
                                onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
                                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">{showAdvancedCoords ? 'expand_less' : 'settings'}</span>
                                {showAdvancedCoords ? 'Hide coordinates' : 'Advanced: Edit coordinates'}
                            </button>

                            {showAdvancedCoords && (
                                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-xs font-semibold text-slate-500">Latitude</span>
                                        <Input
                                            type="number"
                                            step="0.0001"
                                            value={formData.coordinates?.lat}
                                            onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates!, lat: parseFloat(e.target.value) } })}
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-xs font-semibold text-slate-500">Longitude</span>
                                        <Input
                                            type="number"
                                            step="0.0001"
                                            value={formData.coordinates?.lng}
                                            onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates!, lng: parseFloat(e.target.value) } })}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Service Categories */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Service Categories</h3>
                        <span className="text-xs text-primary font-bold">{formData.specialties?.filter(s => VALID_CATEGORIES.includes(s)).length || 0} Selected</span>
                    </div>
                    <p className="text-xs text-slate-500 px-1">Choose the categories of services your workshop provides.</p>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'General', icon: 'settings' },
                            { id: 'Engine', icon: 'engineering' },
                            { id: 'Oil', icon: 'oil_barrel' },
                            { id: 'Brakes', icon: 'minor_crash' },
                            { id: 'Tires', icon: 'tire_repair' },
                            { id: 'Aircond', icon: 'ac_unit' },
                            { id: 'Paint', icon: 'format_paint' },
                            { id: 'Electrical', icon: 'electrical_services' },
                            { id: 'Accessories', icon: 'grid_view' },
                        ].map((cat) => {
                            const isSelected = formData.specialties?.includes(cat.id);
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        const current = formData.specialties || [];
                                        const next = isSelected
                                            ? current.filter(c => c !== cat.id)
                                            : [...current, cat.id];
                                        setFormData({ ...formData, specialties: next });
                                    }}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${isSelected
                                        ? 'bg-primary/5 border-primary text-primary shadow-sm shadow-primary/10'
                                        : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 text-slate-500'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                                    <span className="text-[10px] font-bold">{cat.id}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Items Offered */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Items Offered</h3>
                        <span className="text-xs text-primary font-bold">{formData.services?.length || 0} Items</span>
                    </div>

                    {/* Existing Items List */}
                    <div className="space-y-3">
                        {(formData.services || []).map((service, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg">{service.icon || 'settings'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{service.name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{service.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{service.price}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const updated = (formData.services || []).filter((_, i) => i !== idx);
                                        setFormData({ ...formData, services: updated });
                                    }}
                                    className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add New Item Form */}
                    <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            Add New Item
                        </h4>
                        <div className="space-y-3">
                            <Input
                                placeholder="Item Name (e.g. Engine Oil Synthetic)"
                                id="new-service-name"
                            />
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Price"
                                    id="new-service-price"
                                    className="flex-1"
                                />
                                <select
                                    id="new-service-icon"
                                    className="w-36 px-3 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="settings">🔧 General</option>
                                    <option value="oil_barrel">🛢️ Oil</option>
                                    <option value="minor_crash">🔴 Brakes</option>
                                    <option value="tire_repair">🛞 Tires</option>
                                    <option value="ac_unit">❄️ Aircond</option>
                                    <option value="format_paint">🎨 Paint</option>
                                    <option value="electrical_services">⚡ Electric</option>
                                    <option value="engineering">⚙️ Engine</option>
                                </select>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const nameEl = document.getElementById('new-service-name') as HTMLInputElement;
                                        const priceEl = document.getElementById('new-service-price') as HTMLInputElement;
                                        const iconEl = document.getElementById('new-service-icon') as HTMLSelectElement;

                                        if (!nameEl?.value?.trim() || !priceEl?.value?.trim()) {
                                            notify({
                                                title: "Missing Details",
                                                message: "Item name and price are required.",
                                                type: "info",
                                                role: user?.role || 'owner',
                                                userId: user?.id || ''
                                            });
                                            return;
                                        }

                                        const iconToCategory: Record<string, string> = {
                                            settings: 'General',
                                            oil_barrel: 'Oil',
                                            minor_crash: 'Brakes',
                                            tire_repair: 'Tires',
                                            ac_unit: 'Aircond',
                                            format_paint: 'Paint',
                                            electrical_services: 'Electrical',
                                            engineering: 'Engine'
                                        };

                                        const newService = {
                                            name: nameEl.value.trim(),
                                            category: iconToCategory[iconEl.value] || 'General',
                                            price: priceEl.value.trim().startsWith('RM') ? priceEl.value.trim() : `RM ${priceEl.value.trim()}`,
                                            icon: iconEl.value,
                                            description: ''
                                        };

                                        setFormData(prev => ({
                                            ...prev,
                                            services: [...(prev.services || []), newService]
                                        }));

                                        nameEl.value = '';
                                        priceEl.value = '';
                                    }}
                                    className="px-5"
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px]">info</span>
                            Items will be displayed to customers on your profile.
                        </p>
                    </div>
                </section>

                <div className="pt-4">
                    <Button
                        onClick={handleSave}
                        isLoading={isLoading}
                        className="w-full h-14 text-base shadow-xl shadow-primary/20"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    )
}
