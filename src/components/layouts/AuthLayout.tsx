import { Outlet } from 'react-router-dom';

export function AuthLayout() {
    return (
        <div className="flex justify-center min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
            <div className="w-full max-w-md bg-white dark:bg-background-dark shadow-2xl relative flex flex-col min-h-screen overflow-x-hidden">
                <Outlet />
            </div>
        </div>
    );
}
