import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { BottomNav } from '../layout/BottomNav';
import { NotificationContainer } from "../ui/NotificationContainer";

export function AppLayout() {
    const { isAuthenticated } = useUser();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto bg-background-light dark:bg-zinc-950 shadow-2xl relative overflow-x-hidden transition-colors">
            <NotificationContainer />
            <main className="flex-1 pb-20">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}
