import React, { useState } from 'react';
import { useWorkflowStore } from '../../store/store';
import { simulateWorkflow } from '../../api/mockApi';
import { WorkflowEngine } from '../../engine/engine';
import { Play, Terminal, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { SimulationLog } from '../../types';

export const SandboxPanel = () => {
    const { nodes, edges, simulationLogs, addSimulationLog, clearSimulationLogs } = useWorkflowStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const runSimulation = async () => {
        setIsOpen(true);
        setIsRunning(true);
        clearSimulationLogs();
        setErrorMsg(null);

        const engine = new WorkflowEngine(nodes, edges);
        const { isValid, errors } = engine.validate();

        if (!isValid) {
            errors.forEach(e => addSimulationLog({
                id: crypto.randomUUID(),
                nodeId: e.nodeId,
                timestamp: new Date().toISOString(),
                status: 'ERROR',
                message: e.message,
            }));
            setErrorMsg('Validation failed. See logs for details.');
            setIsRunning(false);
            return;
        }

        try {
            // Hit local generator mock (delaying to seem real)
            const gen = engine.simulateStepByStep();

            const processNext = async () => {
                const result = gen.next();
                if (!result.done) {
                    addSimulationLog(result.value as SimulationLog);
                    setTimeout(processNext, 600); // 600ms artificial delay between logs
                } else {
                    // Simulate real API boundary hit after building timeline graph sequentially
                    await simulateWorkflow(nodes, edges);
                    setIsRunning(false);
                }
            };

            processNext();
        } catch (e: any) {
            addSimulationLog({
                id: crypto.randomUUID(),
                nodeId: 'system',
                timestamp: new Date().toISOString(),
                status: 'ERROR',
                message: e.message || 'Unknown error occurred.',
            });
            setIsRunning(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'text-emerald-400';
            case 'ERROR': return 'text-rose-400';
            case 'PENDING': return 'text-sky-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-[#1e1e1e] border-t border-slate-700 shadow-2xl transition-all duration-300 z-50 flex flex-col ${isOpen ? 'h-64' : 'h-12'}`}>
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 h-12 bg-slate-900 text-slate-100 shrink-0 cursor-pointer select-none group" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    <span className="text-sm font-semibold tracking-wide uppercase">Developer Sandbox</span>
                    <div className="flex items-center ml-2 border-l border-slate-700 pl-4">
                        {errorMsg && <span className="text-xs bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded border border-rose-500/20">{errorMsg}</span>}
                        {isRunning && <span className="text-xs bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded flex items-center gap-1.5"><Clock className="w-3 h-3 animate-spin" /> Executing Pipeline...</span>}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={(e) => { e.stopPropagation(); runSimulation(); }}
                        disabled={isRunning || nodes.length === 0}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:bg-emerald-500 text-slate-900 hover:text-slate-900 text-xs font-bold rounded shadow-sm transition-colors"
                    >
                        <Play className="w-3 h-3 fill-current" />
                        Simulate Run
                    </button>
                    <div className="p-1 rounded group-hover:bg-slate-800 transition-colors">
                        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
                    </div>
                </div>
            </div>

            {/* Terminal View */}
            {isOpen && (
                <div className="flex-1 bg-[#1e1e1e] p-6 overflow-y-auto font-mono text-sm leading-relaxed border-t border-slate-800">
                    {simulationLogs.length === 0 ? (
                        <div className="text-slate-500 flex flex-col items-center justify-center h-full mt-4">
                            <Terminal className="w-8 h-8 mb-3 opacity-20" />
                            <span>Click "Simulate Run" to generate an execution timeline.</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {simulationLogs.map(log => (
                                <div key={log.id} className="flex items-start gap-4">
                                    <span className="text-slate-500 shrink-0 opacity-50 w-24">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                    {log.status === 'ERROR' ? <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /> : <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                                    <span className={`break-all ${getStatusColor(log.status)}`}>{log.message}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
