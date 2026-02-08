import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useChat } from "../../lib/chatState"
import { useUser } from "../../contexts/UserContext"
import { useMockState } from "../../lib/mockState"
import { shopService } from "../../lib/shopService"

export function OwnerMessages() {
    const navigate = useNavigate()
    const { conversations } = useChat()
    const { user, switchRole } = useUser()
    const { workshops } = useMockState()
    const [activeTab, setActiveTab] = useState<'consultation' | 'booking'>('consultation')

    const shopId = useMemo(() => {
        if (!user) return 'w1'
        if (user.workshopId) return user.workshopId;
        const shopData = shopService.getShopData(user.email)
        const workshop = workshops.find(w => w.name === shopData?.workshopName)
        return workshop?.id || 'w1'
    }, [user, workshops])

    const ownerConversations = conversations
        .filter(c => c.workshopId === shopId && c.contextType === activeTab)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const consultationCount = conversations.filter(c => c.workshopId === shopId && c.contextType === 'consultation').length
    const bookingCount = conversations.filter(c => c.workshopId === shopId && c.contextType === 'booking').length

    return (
        <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-slate-50 dark:bg-zinc-950">
            <div className="p-4 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">chat_bubble</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 dark:bg-zinc-800/50 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('consultation')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'consultation' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-slate-500'}`}
                    >
                        Inquiries
                        {consultationCount > 0 && <span className="bg-primary text-white size-4 rounded-full text-[8px] flex items-center justify-center">{consultationCount}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('booking')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'booking' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-slate-500'}`}
                    >
                        Active Jobs
                        {bookingCount > 0 && <span className="bg-primary text-white size-4 rounded-full text-[8px] flex items-center justify-center">{bookingCount}</span>}
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 pb-24 space-y-3">
                {ownerConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="size-20 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <span className="material-symbols-outlined text-4xl opacity-20">
                                {activeTab === 'consultation' ? 'chat_paste' : 'receipt_long'}
                            </span>
                        </div>
                        <p className="font-bold uppercase tracking-widest text-[10px]">No {activeTab} messages</p>
                    </div>
                ) : (
                    ownerConversations.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => {
                                switchRole('owner')
                                navigate(`/messages/${chat.id}`)
                            }}
                            className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 cursor-pointer active:scale-[0.98] transition-all group"
                        >
                            <div className="relative shrink-0">
                                <div className="size-14 rounded-xl bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-zinc-800">
                                    <span className="material-symbols-outlined text-2xl">person</span>
                                </div>
                                <div className={`absolute -bottom-1 -right-1 size-6 rounded-lg flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-sm ${chat.contextType === 'consultation' ? 'bg-blue-500 text-white' : 'bg-primary text-white'}`}>
                                    <span className="material-symbols-outlined text-[14px]">
                                        {chat.contextType === 'consultation' ? 'forum' : 'handyman'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate">
                                        {chat.userName || `Customer ${chat.userId.slice(-4).toUpperCase()}`}
                                    </h3>
                                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                        {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className={`text-[10px] font-black uppercase tracking-tight mb-1 ${chat.contextType === 'consultation' ? 'text-blue-500' : 'text-primary'}`}>
                                    {chat.contextType === 'consultation' ? 'Consultation Request' : `Job #${chat.bookingId}`}
                                </p>
                                <p className="text-sm truncate text-slate-500 font-medium">
                                    {chat.lastMessage || "Click to open chat..."}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
