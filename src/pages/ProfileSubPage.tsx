import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

interface ProfileSubPageProps {
    title: string;
    description: string;
    children?: React.ReactNode;
}

export function ProfileSubPage({ title, description, children }: ProfileSubPageProps) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <div className="bg-white dark:bg-surface-dark p-6 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
                </div>
            </div>

            <div className="p-6">
                <p className="text-slate-500 mb-6">{description}</p>
                {children || (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="size-20 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl text-slate-400">construction</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Under Construction</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">This feature is coming soon in the next update.</p>
                        <Button className="mt-6" variant="outline" onClick={() => navigate(-1)}>
                            Go Back
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
