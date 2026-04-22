import React from 'react';
import { Workspace } from './components/canvas/Workspace';
import { NodeEditor } from './components/forms/NodeEditor';
import { SandboxPanel } from './components/sandbox/SandboxPanel';

function App() {
    return (
        <div className="w-screen h-screen flex flex-col bg-slate-100 overflow-hidden font-sans">
            <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-sky-500 rounded-md flex items-center justify-center shadow-inner">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-extrabold text-slate-800 tracking-tight ml-2">HR Workflow Designer</h1>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-1 overflow-hidden pb-12">
                {/* Workspace contains Sidebar and Canvas */}
                <div className="flex-1 flex overflow-hidden">
                    <Workspace />
                </div>

                {/* Right Panel for configuration */}
                <NodeEditor />
            </main>

            {/* Bottom sliding panel for dev sandbox */}
            <SandboxPanel />
        </div>
    );
}

export default App;
