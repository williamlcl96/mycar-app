import { useState, useEffect, useRef } from "react"
import motulBanner from "../../assets/motul_banner.png"

export function PromoCarousel() {
    const [activeIndex, setActiveIndex] = useState(0)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Dragging state
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    const promos = [
        {
            id: 1,
            title: "Ultimate Engine Care\nwith Motul 8100",
            subtitle: "Premium Synthetic Oil for Peak Performance",
            tag: "NEW ARRIVAL",
            tagColor: "bg-red-600 text-white",
            image: motulBanner,
            gradient: "from-black/80 via-black/40 to-transparent",
        },
        {
            id: 2,
            title: "Raya Special:\n20% Off Air-Cond",
            subtitle: "Valid until 30th April",
            tag: "LIMITED OFFER",
            tagColor: "bg-yellow-400 text-black",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA05_R8e4HbGO7IGKPDuyEeM649Tcf2SIid1coE8pY9a1xP15Q0uH3-FnEnbNJOiGP0RTf0QEk_kgW3HRAoMp27PFT-28p4WgwjAtFHd4_55zu7MJE2FTCwl-QeK9dby0q33tDGrl506HT9B8fQ1RE0edvPIzdGLqsIC7zIqueQ3SV85L-_4Wb1oIu3Ol5Xt0Xls1j2teFzotD8qwmGEeQd4-pPYjHzbBDA9tZZdXPvP5Fwe6M__rl0Pr_SVvUR9P9lPAg5zAKRpiM",
            gradient: "from-black/80 via-black/40 to-transparent",
        },
        {
            id: 3,
            title: "Free Diagnostics\nFirst Visit",
            subtitle: "At participating workshops",
            tag: "NEW USER",
            tagColor: "bg-white text-primary",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7f3AsSc-4E8b9qqQHw1kvKmv-t_ZNNl8p0AMdxFGpzkfp8hvO7lp0jqDXcM1c_qRAdeCIeuWjE2lBGEJyTP-JuTCttcUaJFs9TYvgBNg4Vvubbzgc3N4bPwA5Ju_Qi17syUqe6hTf3dK0cWgKlioU0nU0P9n8aN_Yba9p4XY0BFvW4FjJEZpxaZfm2lCPryo_wQgUhomuAr-esKwhI3El7L49KhON26oWx81BcJOP3A8XYm7NawgmzdL0LiJXlGeUHFjS0Bjelb0",
            gradient: "from-primary/90 to-blue-900/40",
        },
    ]

    // Scroll to the active slide on manual index change (e.g. dot click or initial)
    useEffect(() => {
        if (scrollContainerRef.current && !isDragging) {
            const container = scrollContainerRef.current
            const slideWidth = 320 + 16 // w-80 (320px) + gap-4 (16px)
            container.scrollTo({
                left: activeIndex * slideWidth,
                behavior: "smooth"
            })
        }
    }, [activeIndex])

    // Sync activeIndex with scroll position when manual scroll/swipe happens
    const handleScroll = () => {
        if (!scrollContainerRef.current) return
        const container = scrollContainerRef.current
        const slideWidth = 320 + 16
        // Calculate index based on scroll position
        const index = Math.round(container.scrollLeft / slideWidth)
        if (index !== activeIndex) {
            setActiveIndex(index)
        }
    }

    // Mouse Drag Logic
    const startDragging = (e: React.MouseEvent) => {
        setIsDragging(true)
        setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0))
        setScrollLeft(scrollContainerRef.current?.scrollLeft || 0)
    }

    const stopDragging = () => {
        setIsDragging(false)
    }

    const onDragging = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return
        e.preventDefault()
        const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0)
        const walk = (x - startX) * 1.5 // Multiplier for faster drag
        scrollContainerRef.current.scrollLeft = scrollLeft - walk
    }

    return (
        <div className="pt-2 pb-6">
            <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Featured Promotions
                </h2>
                <div className="flex gap-1.5">
                    {promos.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? "w-4 bg-primary" : "w-1.5 bg-slate-200 dark:bg-zinc-800"
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className={`flex overflow-x-auto gap-4 px-4 pb-2 hide-scrollbar snap-x snap-mandatory ${isDragging ? "cursor-grabbing scroll-auto" : "cursor-grab"
                    }`}
                onScroll={handleScroll}
                onMouseDown={startDragging}
                onMouseLeave={stopDragging}
                onMouseUp={stopDragging}
                onMouseMove={onDragging}
            >
                {promos.map((promo, index) => (
                    <div
                        key={promo.id}
                        className={`snap-center shrink-0 w-80 h-40 rounded-2xl overflow-hidden relative shadow-lg group select-none transition-all duration-500 ${index === activeIndex ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-900" : "opacity-80 scale-95"
                            }`}
                        onClick={() => setActiveIndex(index)}
                    >
                        <img
                            src={promo.image}
                            alt={promo.title}
                            draggable={false} // Prevent image dragging ghosting
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-r ${promo.gradient} p-6 flex flex-col justify-end pointer-events-none`}>
                            <span className={`${promo.tagColor} text-[10px] font-black px-2 py-1 rounded-lg w-fit mb-2 uppercase tracking-wider`}>
                                {promo.tag}
                            </span>
                            <h3 className="text-white text-xl font-black leading-tight mb-1 whitespace-pre-line drop-shadow-md">
                                {promo.title}
                            </h3>
                            <p className="text-slate-100 text-[11px] font-medium opacity-90">{promo.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
