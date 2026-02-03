import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

export function OwnerLayout() {
    const { switchRole } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-background-light dark:bg-background-dark overflow-x-hidden shadow-2xl pb-24">
            {/* Mock Owner Header */}
            <div className="sticky top-0 z-50 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
                <h1 className="text-lg font-bold">Workshop Dashboard</h1>
                <button
                    onClick={() => {
                        const result = switchRole('customer')
                        if (result.success) {
                            navigate('/')
                        }
                    }}
                    className="text-xs text-primary font-bold"
                >
                    Switch to User
                </button>
            </div>

            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>

            {/* Owner Bottom Nav (Distinct from User) */}
            <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 px-1 py-1 pb-safe flex justify-around items-center z-50 h-16">
                <button
                    onClick={() => navigate('/owner/dashboard')}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/owner/dashboard') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                >
                    <span className={`material-symbols-outlined text-[26px] ${isActive('/owner/dashboard') ? 'filled' : ''}`} style={{ fontVariationSettings: isActive('/owner/dashboard') ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
                    <span className="text-[10px] font-medium">Dashboard</span>
                </button>

                <button
                    onClick={() => navigate('/owner/jobs')}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/owner/jobs') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                >
                    <span className={`material-symbols-outlined text-[26px] ${isActive('/owner/jobs') ? 'filled' : ''}`} style={{ fontVariationSettings: isActive('/owner/jobs') ? "'FILL' 1" : "'FILL' 0" }}>assignment</span>
                    <span className="text-[10px] font-medium">Tasks</span>
                </button>

                <button
                    onClick={() => navigate('/owner/messages')}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/owner/messages') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                >
                    <span className={`material-symbols-outlined text-[26px] ${isActive('/owner/messages') ? 'filled' : ''}`} style={{ fontVariationSettings: isActive('/owner/messages') ? "'FILL' 1" : "'FILL' 0" }}>chat_bubble</span>
                    <span className="text-[10px] font-medium">Messages</span>
                </button>

                <button
                    onClick={() => navigate('/owner/analytics')}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/owner/analytics') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                >
                    <span className="material-symbols-outlined text-[26px]">monitoring</span>
                    <span className="text-[10px] font-medium">Revenue</span>
                </button>

                <button
                    onClick={() => navigate('/owner/profile')}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/owner/profile') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                >
                    <span className={`material-symbols-outlined text-[26px] ${isActive('/owner/profile') ? 'filled' : ''}`} style={{ fontVariationSettings: isActive('/owner/profile') ? "'FILL' 1" : "'FILL' 0" }}>storefront</span>
                    <span className="text-[10px] font-medium">Shop</span>
                </button>
            </div>
        </div>
    );
}
