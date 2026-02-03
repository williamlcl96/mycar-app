import { useNavigate } from "react-router-dom"

export function SupportPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col">
            <div className="sticky top-0 z-50 flex items-center bg-white dark:bg-[#1a2632] p-4 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold flex-1 text-center pr-10">Contact Support</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-5xl text-primary">support_agent</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">How can we help?</h1>
                <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-xs">
                    Our support team is available Mon-Fri, 9am - 6pm.
                </p>

                <button className="w-full max-w-sm bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mb-4">
                    <span className="material-symbols-outlined">chat</span>
                    Start Live Chat
                </button>

                <button className="w-full max-w-sm bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-gray-700 text-slate-900 dark:text-white font-bold py-4 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">mail</span>
                    Send Email
                </button>
            </div>
        </div>
    )
}
