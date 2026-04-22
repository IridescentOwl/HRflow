import React from 'react';
import { nodeRegistry } from '../../registry/nodeRegistry';
import { NodeType } from '../../types';

export const Sidebar: React.FC = () => {
    const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10 relative">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm uppercase tracking-wider font-bold text-slate-500">Node Palette</h2>
                <p className="text-xs text-slate-400 mt-1">Drag nodes into the canvas to build your workflow.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(Object.keys(nodeRegistry) as NodeType[]).map((type) => {
                    const config = nodeRegistry[type];
                    return (
                        <div
                            key={type}
                            onDragStart={(event) => onDragStart(event, type)}
                            draggable
                            className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white cursor-grab hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all active:cursor-grabbing"
                        >
                            <div
                                className="w-3 h-3 rounded-full mt-1 shrink-0 shadow-sm"
                                style={{ backgroundColor: config.color }}
                            />
                            <div>
                                <div className="text-sm font-semibold text-slate-700">{config.label}</div>
                                <div className="text-xs text-slate-500 leading-snug mt-1">{config.description}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};
