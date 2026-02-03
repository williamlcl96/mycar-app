import { useNavigate } from "react-router-dom"
import { useChat } from "../lib/chatState"
import { useUser } from "../contexts/UserContext"
import { useMockState } from "../lib/mockState"

export function Messages() {
    const navigate = useNavigate()
    const { conversations } = useChat()
    const { user, switchRole } = useUser()
    const { workshops } = useMockState()

    const userConversations = conversations
        .filter(c => c.userId === user?.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return (
        <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-background-light dark:bg-background-dark">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
            </div>

            <div className="flex-1 p-4 pb-24">
                {userConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">chat_bubble_outline</span>
                        <p className="font-black uppercase tracking-widest text-[10px]">No messages yet</p>
                    </div>
                ) : (
                    userConversations.map((chat) => {
                        const workshop = workshops.find(w => w.id === chat.workshopId)
                        return (
                            <div
                                key={chat.id}
                                onClick={() => {
                                    switchRole('customer')
                                    navigate(`/messages/${chat.id}`)
                                }}
                                className="flex gap-4 p-4 mb-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-700 cursor-pointer active:scale-[0.98] transition-all group"
                            >
                                <div className="relative">
                                    <img
                                        src={workshop?.image || "https://images.unsplash.com/photo-1613214292775-430961239c89?q=80&w=200&auto=format&fit=crop"}
                                        alt={workshop?.name}
                                        className="w-14 h-14 rounded-2xl object-cover border border-slate-100 dark:border-zinc-700 group-hover:border-primary/30 transition-colors"
                                    />
                                    <div className={`absolute -bottom-1 -right-1 size-6 rounded-lg flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm ${chat.contextType === 'consultation' ? 'bg-blue-500 text-white' : 'bg-primary text-white'}`}>
                                        <span className="material-symbols-outlined text-[14px]">
                                            {chat.contextType === 'consultation' ? 'forum' : 'handyman'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">
                                            {workshop?.name || "Workshop"}
                                        </h3>
                                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                            {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-tight mb-1 ${chat.contextType === 'consultation' ? 'text-blue-500' : 'text-primary'}`}>
                                        {chat.contextType === 'consultation' ? 'Consultation' : `Booking #${chat.bookingId}`}
                                    </p>
                                    <p className="text-xs truncate text-slate-500 font-medium">
                                        {chat.lastMessage || "Click to start chatting..."}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
