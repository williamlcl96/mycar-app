import { useNavigate, useParams } from "react-router-dom"
import { useState, useMemo, type ReactNode, useEffect } from "react"
import { useChat } from "../lib/chatState"
import { useUser } from "../contexts/UserContext"
import { useMockState } from "../lib/mockState"
import { messageDataProvider, USE_SUPABASE } from "../lib/dataProvider"

export function ChatPage() {
    const navigate = useNavigate()
    const { id: conversationId } = useParams()
    const { user, role: activeRole } = useUser()
    const { getConversation, sendMessage, deleteMessage, deleteConversation, refreshConversations } = useChat()
    const { workshops, bookings, vehicles } = useMockState()

    const [isLoaded, setIsLoaded] = useState(false)

    // Real-time subscription
    useEffect(() => {
        if (!USE_SUPABASE || !conversationId) return

        const subscription = messageDataProvider.subscribeToMessages(conversationId, (newMessage) => {
            console.log("New message received via Supabase subscription:", newMessage)
            refreshConversations() // Re-fetch all to stay in sync
        })

        return () => {
            if (subscription && (subscription as any).unsubscribe) {
                (subscription as any).unsubscribe()
            }
        }
    }, [conversationId, refreshConversations])

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 300)
        return () => clearTimeout(timer)
    }, [])

    const conversation = useMemo(() => {
        const conv = getConversation(conversationId || "");
        console.log('[DEBUG] ChatPage: Conversation lookup', { conversationId, found: !!conv, bookingId: conv?.bookingId });
        return conv;
    }, [conversationId, getConversation])
    const chatMessages = conversation?.messages || []
    const [inputText, setInputText] = useState("")

    const workshop = useMemo(() => workshops.find(w => w.id === conversation?.workshopId), [workshops, conversation])
    const booking = useMemo(() => {
        const b = bookings.find(b => b.id === conversation?.bookingId);
        console.log('[DEBUG] ChatPage: Booking lookup', { bookingId: conversation?.bookingId, found: !!b, status: b?.status });
        return b;
    }, [bookings, conversation])

    // Determine names from context
    const customerName = conversation?.userName || (booking?.customerName) || 'Customer'
    const shopName = conversation?.workshopName || (workshop?.name) || 'Workshop'

    const vehicle = useMemo(() => {
        let name = booking?.vehicleName || '';
        let plate = booking?.vehiclePlate || '';

        // Handle legacy combined strings "Name • Plate"
        if (name.includes(' • ')) {
            const parts = name.split(' • ');
            name = parts[0];
            plate = parts[1];
        }

        if (name) return { name, plate: plate && plate !== 'undefined' ? plate : null };

        // Fallback to primary vehicle of user for consultations
        const userVehicles = vehicles.filter(v => v.userId === conversation?.userId);
        const primary = userVehicles.find(v => v.isPrimary) || userVehicles[0];
        return primary ? { name: primary.name, plate: primary.plate && primary.plate !== 'undefined' ? primary.plate : null } : null;
    }, [booking, vehicles, conversation])

    const handleSend = () => {
        if (!inputText.trim() || !conversationId || !user) return
        const role = activeRole === 'owner' ? 'workshop' : 'user'
        sendMessage(conversationId, inputText, role, user.id)
        setInputText("")
    }

    const handleDeleteChat = () => {
        if (!conversationId) return
        if (window.confirm("Are you sure you want to delete this entire chat history?")) {
            deleteConversation(conversationId)
            navigate(-1)
        }
    }


    if (!conversation || !isLoaded) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-4 text-center bg-white dark:bg-zinc-950">
                <div className="size-20 bg-slate-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-slate-300 animate-pulse">forum</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Initializing Chat</h2>
                <p className="text-sm text-slate-500 mb-6">Connecting you to the conversation...</p>
                <div className="flex flex-col gap-2">
                    <Button onClick={() => navigate(-1)}>Back to Safety</Button>
                    <p className="text-[10px] text-slate-400">ID: {conversationId || "missing"}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden max-w-md mx-auto shadow-2xl relative">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 shrink-0 z-20">
                <div className="flex items-center p-4 py-3 justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-1 -ml-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
                        </button>
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                {activeRole === 'owner' ? (
                                    conversation.userAvatar ? (
                                        <img src={conversation.userAvatar} alt={customerName} className="w-10 h-10 rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-zinc-800">
                                            <span className="material-symbols-outlined text-2xl">person</span>
                                        </div>
                                    )
                                ) : (
                                    workshop?.image ? (
                                        <img src={workshop.image} alt={workshop.name} className="w-10 h-10 rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {workshop?.name?.charAt(0) || 'W'}
                                        </div>
                                    )
                                )}
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                            </div>
                            <div>
                                <h2 className="text-slate-900 dark:text-white text-sm font-bold leading-tight">
                                    {activeRole === 'owner' ? customerName : shopName}
                                </h2>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                        {conversation.contextType === 'booking' ? `Booking #${booking?.id}` : 'Consultation'}
                                    </p>
                                    {activeRole === 'owner' && vehicle && (
                                        <>
                                            <span className="text-[10px] text-slate-300">•</span>
                                            <p className="text-primary text-[10px] font-black uppercase tracking-tighter">
                                                {vehicle.name} {vehicle.plate ? `[${vehicle.plate}]` : ''}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleDeleteChat}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-xl transition-all group"
                        title="Delete Entire Chat"
                    >
                        <span className="material-symbols-outlined text-xl">delete_sweep</span>
                    </button>
                </div>

                {/* Context Banner / Service Summary */}
                {conversation.contextType === 'booking' && booking ? (
                    <div className="px-4 pb-3">
                        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-primary border border-slate-100 dark:border-zinc-700">
                                    <span className="material-symbols-outlined text-xl">handyman</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Service</p>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{booking.serviceType}</h4>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Status</p>
                                <span className="text-[10px] font-black text-primary uppercase">{booking.status}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-zinc-800/30 py-2 px-4 flex justify-between items-center border-t border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                            <h4 className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Consultation Mode</h4>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">General Inquiry</span>
                    </div>
                )}
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto relative bg-background-light dark:bg-background-dark p-4 pb-24 flex flex-col gap-4">
                {chatMessages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none">
                        <span className="material-symbols-outlined text-6xl mb-2">message</span>
                        <p className="text-[10px] font-black uppercase tracking-widest">No messages yet</p>
                    </div>
                )}
                {chatMessages.map((msg) => {
                    const isMe = (activeRole === 'owner' && msg.senderRole === 'workshop') ||
                        (activeRole !== 'owner' && msg.senderRole === 'user')

                    return (
                        <div key={msg.id} className={`flex flex-col gap-1 max-w-[85%] group/msg ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                            {/* Sender Label (only for "Them") */}
                            {!isMe && (
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-0.5">
                                    {msg.senderRole === 'workshop' ? shopName : customerName}
                                </span>
                            )}

                            <div className="flex items-center gap-2 group">
                                {isMe && (
                                    <button
                                        onClick={() => deleteMessage(conversation.id, msg.id)}
                                        className="opacity-0 group-hover/msg:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                )}

                                <div className={`text-sm font-medium leading-relaxed rounded-2xl px-4 py-2.5 shadow-sm border ${isMe
                                    ? 'bg-primary text-white border-primary/20 rounded-br-none'
                                    : 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border-slate-100 dark:border-zinc-700 rounded-bl-none'
                                    }`}>
                                    {msg.text}
                                </div>

                                {!isMe && (
                                    <button
                                        onClick={() => deleteMessage(conversation.id, msg.id)}
                                        className="opacity-0 group-hover/msg:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                )}
                            </div>

                            <span className="text-[8px] font-bold text-slate-400 mx-1 uppercase">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )
                })}
            </main>

            {/* CTA & Input Area */}
            <div className="shrink-0 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 z-30 pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {/* Dynamic CTA for Consultation */}
                {conversation.contextType === 'consultation' && activeRole === 'customer' && (
                    <div className="px-4 py-3">
                        <button
                            onClick={() => navigate(`/workshops/${conversation.workshopId}/book`)}
                            className="w-full bg-primary text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-[10px] active:scale-[0.98] transition-transform"
                        >
                            <span className="material-symbols-outlined text-sm">event_available</span>
                            Proceed to Booking
                        </button>
                    </div>
                )}

                <div className="p-4 pt-1 flex items-center gap-3">
                    <button className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-2xl">add_circle</span>
                    </button>
                    <div className="relative flex-1">
                        <input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            className="w-full bg-slate-50 dark:bg-zinc-800/80 border-slate-100 dark:border-zinc-700 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white transition-all outline-none"
                            placeholder="Type a message..."
                            type="text"
                        />
                    </div>
                    <button onClick={handleSend} className="bg-primary text-white h-10 w-10 flex items-center justify-center rounded-full shadow-md active:scale-90 transition-transform">
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

function Button({ children, onClick }: { children: ReactNode, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm"
        >
            {children}
        </button>
    )
}
