import React from 'react';
import { useWorkflowStore } from '../../store/store';
import { nodeRegistry } from '../../registry/nodeRegistry';
import { DynamicForm } from './DynamicForm';

export const NodeEditor = () => {
    const { selectedNodeId, nodes } = useWorkflowStore();

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    if (!selectedNodeId || !selectedNode) {
        return (
            <aside className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-sm z-10 relative">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-sm">
                    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-600">No node selected</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">Select a node on the canvas to configure its properties here.</p>
            </aside>
        );
    }

    const config = nodeRegistry[selectedNode.type as keyof typeof nodeRegistry];

    return (
        <aside className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col h-full shadow-sm z-10 relative">
            <div className="p-4 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: config.color }}
                    />
                    <h2 className="text-sm uppercase tracking-widest font-extrabold text-slate-700">Configuration</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Editing {config.label}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                <DynamicForm node={selectedNode} config={config} />
            </div>
        </aside>
    );
};
