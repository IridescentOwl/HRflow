import { useEffect } from 'react';
import { Workspace } from './components/canvas/Workspace';
import { Sidebar } from './components/canvas/Sidebar';
import { NodeEditor } from './components/forms/NodeEditor';
import { SandboxPanel } from './components/sandbox/SandboxPanel';
import { Sun, Moon } from 'lucide-react';
import { useWorkflowStore } from './store/store';

function App() {
    const { theme, toggleTheme } = useWorkflowStore();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // We add 'dark' class mappings to structural containers here
    return (
        <div className="w-screen h-screen flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
            <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 shrink-0 shadow-sm z-20 transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-sky-500 rounded-md flex items-center justify-center shadow-inner">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight ml-2 transition-colors">HR Workflow Designer</h1>
                </div>

                <button
                    onClick={toggleTheme}
                    className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm active:scale-95"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden">
                {/* Workspace Canvas is now full width underneath everything */}
                <div className="absolute inset-0">
                    <Workspace />
                </div>

                {/* Left Floating Sidebar */}
                <div className="absolute top-4 left-4 bottom-20 z-20 flex flex-col pointer-events-none">
                    <div className="pointer-events-auto h-full">
                        <Sidebar />
                    </div>
                </div>

                {/* Right Floating Configuration Panel */}
                <div className="absolute top-4 right-4 bottom-20 z-20 flex flex-col pointer-events-none">
                    <div className="pointer-events-auto h-full">
                        <NodeEditor />
                    </div>
                </div>
            </main>

            {/* Bottom sliding panel for dev sandbox */}
            <SandboxPanel />
        </div>
    );
}

export default App;
