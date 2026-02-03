import { useNavigate } from "react-router-dom"
import { useState } from "react"


export function LanguagePage() {
    const navigate = useNavigate()
    const [selectedLanguage, setSelectedLanguage] = useState("English")

    const languages = [
        { name: "English", flag: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcRFvHSJdoXx-4YkSPXptHbUmau2ftRm1EuE_1mWaNOMbisilfnqj45k04lYlhAAPnacG93F2EIM4CEP9kaMMv8YHLz6AmvhoI7tmk6da2_b81tvm5AAEWUZYGAX8XnrQWaQ6cKyRwNug983UafKlhxNXKj6po8KCGBfG0sjLN61mxIELlRPngLyGy3efq0rHKrqdXb6_OOjvdwh-YvpyOeeJ3vZjwtIUahozZz9YPhft5CEcpT5MEjPoeZ3b_LckMy9GyRW218RQ" },
        { name: "Bahasa Malaysia", flag: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5aDYOJG3XgE7DJYznAFYoRekWHLxzHKBpsjGo9ovwwi1URD-SXgo6KtUUWzFxXZZ-y7NYZsGj_myXT8J6F9XLCZz6fSLcQMzSQem9LCcpMUsvUntqeX7ceinSgFuee6WtE0DT6h0fG4N6y2lWTyOk5JySGMGisi14M2aA5EDxEiIutFgtQ1h3t6XcILhm74XMIJT-15P-XJ2unPiGWphrgx_Cv4ik2yf9yV1N0qMsND26utTkMN-G0aW8cJ9qFun1ejhsSrnG6rk" },
        { name: "Mandarin (Simplified)", flag: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXY_kw6WmaQPZIkogLOUahdrcHmqnPrCQ842WA9I0FxfKDx_GPT_6895PLJa4WvpSlawYt-qPia6k7qLXEq39gP2pKkWfSSdDT5EYw0b-Y1vGUFUpdUe7njOcUEtbFIAP2byBVlZRZLfkseS0WCjqyesfkSWMuB3MYRAGvlRW2_L2pc6PoL53K_7SUlk84pTyQ9CGjbykJrrzKRYIMH9-YbPP61jqD6e4a-bz-ZY8mWcllZ7fRPdHtwNfim1aEntWKkjNlrRvkbEI" }
    ]

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-[#111418] dark:text-white">
            {/* TopAppBar */}
            <div className="flex items-center bg-white dark:bg-[#1a2632] p-4 pb-2 justify-between border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="text-[#111418] dark:text-white flex size-12 shrink-0 items-center justify-center -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Language</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="bg-white dark:bg-[#1a2632]">
                    <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-4 pt-6">Choose your preferred language</h3>
                </div>

                <div className="flex flex-col bg-white dark:bg-[#1a2632]">
                    {languages.map((lang) => (
                        <div
                            key={lang.name}
                            onClick={() => setSelectedLanguage(lang.name)}
                            className="flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-4 px-4 min-h-[72px] justify-between">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10 border border-gray-200 dark:border-gray-700 shadow-sm"
                                        style={{ backgroundImage: `url("${lang.flag}")` }}
                                    />
                                    <p className="text-[#111418] dark:text-white text-base font-medium leading-normal flex-1 truncate">{lang.name}</p>
                                </div>
                                {selectedLanguage === lang.name && (
                                    <div className="shrink-0">
                                        <span className="material-symbols-outlined text-primary text-2xl">check</span>
                                    </div>
                                )}
                            </div>
                            <div className="ml-[72px] h-[1px] bg-gray-100 dark:bg-gray-800"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a2632] p-4 border-t border-gray-100 dark:border-gray-800 pb-8 safe-area-bottom">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-blue-600 transition-colors shadow-sm">
                    <span className="truncate">Save Changes</span>
                </button>
            </div>
        </div>
    )
}
