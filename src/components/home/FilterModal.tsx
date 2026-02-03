import { Button } from "../ui/Button";
import { useState } from "react";
import { clsx } from "clsx";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
}

export function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
    const [sortOption, setSortOption] = useState('nearest');
    const [priceRange, setPriceRange] = useState(1000);
    const [minRating, setMinRating] = useState<number>(0);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    if (!isOpen) return null;

    const toggleService = (service: string) => {
        setSelectedServices(prev =>
            prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    const handleClearAll = () => {
        setSortOption('nearest');
        setPriceRange(1000);
        setMinRating(0);
        setSelectedServices([]);
    };

    const handleApply = () => {
        onApply({
            sort: sortOption,
            maxPrice: priceRange,
            rating: minRating,
            categories: selectedServices
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end max-w-md mx-auto left-0 right-0">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-[#1a2632] rounded-t-[2rem] flex flex-col max-h-[92%] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">

                {/* Handle */}
                <div className="flex flex-col items-center pt-3 pb-1">
                    <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                </div>

                {/* Header */}
                <div className="flex items-center bg-white dark:bg-[#1a2632] p-4 border-b border-gray-100 dark:border-gray-800 justify-between">
                    <h2 className="text-[#111418] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1">Filter & Sort</h2>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 text-[#111418] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">

                    {/* Sort By */}
                    <div className="px-4 pt-6">
                        <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Sort By</h3>
                        <div className="flex flex-col gap-3">
                            {[
                                { id: 'nearest', label: 'Nearest Distance' },
                                { id: 'rating', label: 'Highest Rating' },
                                { id: 'price_low', label: 'Price: Low to High' }
                            ].map((option) => (
                                <label
                                    key={option.id}
                                    className={clsx(
                                        "flex items-center gap-4 rounded-xl border p-4 flex-row-reverse transition-colors cursor-pointer",
                                        sortOption === option.id
                                            ? "border-primary bg-primary/5"
                                            : "border-[#dbe0e6] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="sort-option"
                                        checked={sortOption === option.id}
                                        onChange={() => setSortOption(option.id)}
                                        className="h-6 w-6 border-2 border-[#dbe0e6] text-primary focus:ring-primary checked:border-primary bg-transparent"
                                    />
                                    <div className="flex grow flex-col">
                                        <p className="text-[#111418] dark:text-white text-base font-semibold">{option.label}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-2 bg-[#f6f7f8] dark:bg-black/20 my-6"></div>

                    {/* Rating */}
                    <div className="px-4">
                        <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight mb-4 tracking-tight">Rating</h3>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((stars) => (
                                <button
                                    key={stars}
                                    onClick={() => setMinRating(prev => (prev === stars ? 0 : stars))}
                                    className={clsx(
                                        "flex-1 flex items-center justify-center gap-1 border-2 py-2.5 rounded-xl font-bold transition-all",
                                        minRating === stars
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                    )}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="text-xs">{stars}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="px-4 mt-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[#111418] dark:text-white text-lg font-bold">Price Range</h3>
                            <span className="text-primary font-bold">RM 0 - RM {priceRange}{priceRange === 1000 ? '+' : ''}</span>
                        </div>
                        <div className="px-2">
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                step="50"
                                value={priceRange}
                                onChange={(e) => setPriceRange(Number(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between mt-2 text-sm text-gray-500 font-medium">
                                <span>RM 0</span>
                                <span>RM 1000+</span>
                            </div>
                        </div>
                    </div>

                    {/* Services Checklist */}
                    <div className="px-4 mt-8">
                        <h3 className="text-[#111418] dark:text-white text-lg font-bold mb-4">Services</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Oil Change', 'Engine', 'Tires', 'Brakes', 'Air-cond', 'Battery', 'Paint', 'Major Service'].map((service) => {
                                const isSelected = selectedServices.includes(service);
                                return (
                                    <div
                                        key={service}
                                        onClick={() => toggleService(service)}
                                        className={clsx(
                                            "flex items-center gap-2 px-4 py-2 rounded-full font-medium cursor-pointer transition-colors border",
                                            isSelected
                                                ? "bg-primary text-white border-primary"
                                                : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        <span>{service}</span>
                                        {isSelected && <span className="material-symbols-outlined text-sm">check</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Car Brand Specialization (Visual Only for now) */}
                    <div className="px-4 mt-8 mb-4 opacity-50">
                        <h3 className="text-[#111418] dark:text-white text-lg font-bold mb-4 tracking-[-0.015em]">Car Brand Specialization</h3>
                        <div className="relative">
                            <div className="flex items-center justify-between w-full border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800 cursor-not-allowed">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-gray-500">directions_car</span>
                                    <span className="text-gray-900 dark:text-white font-medium">All Brands Supported</span>
                                </div>
                                <span className="material-symbols-outlined text-gray-400">lock</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1a2632] p-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 pb-8">
                    <button
                        onClick={handleClearAll}
                        className="flex-none px-4 py-3 text-gray-500 dark:text-gray-400 font-bold hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Clear All
                    </button>
                    <Button
                        onClick={handleApply}
                        className="flex-1 h-14 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                    >
                        Apply Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}
