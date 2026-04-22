import React from 'react';
import { Handle, Position } from 'reactflow';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NodeType } from '../../types';
import { nodeRegistry } from '../../registry/nodeRegistry';
import { useWorkflowStore } from '../../store/store';
import { AlertCircle } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BaseNodeProps {
    id: string;
    type: NodeType;
    data: any;
    selected: boolean;
    isConnectable: boolean;
    children?: React.ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({ id, type, data, selected, isConnectable, children }) => {
    const config = nodeRegistry[type];
    const { title } = data;
    const isInvalid = useWorkflowStore(state => state.validationErrors.some(e => e.nodeId === id));
    const execState = useWorkflowStore(state => state.executionState);
    const isActive = execState.isRunning && execState.activeNodeId === id;

    return (
        <div
            className={cn(
                "min-w-[200px] max-w-[280px] bg-white dark:bg-slate-800 rounded-lg shadow-sm border-2 overflow-hidden transition-all",
                isActive ? "border-amber-400 shadow-lg ring-4 ring-amber-100/50 dark:ring-amber-900/50 shadow-amber-400/20 scale-[1.02]" : selected ? "border-sky-500 shadow-md ring-2 ring-sky-100 dark:ring-sky-900/50" : isInvalid ? "border-rose-500 shadow-md ring-2 ring-rose-100 dark:ring-rose-900/50" : "border-slate-200 dark:border-slate-700"
            )}
        >
            {/* Node Header */}
            <div
                className="px-3 py-2 flex items-center justify-between border-b border-white/20 dark:border-black/20"
                style={{ backgroundColor: config.color }}
            >
                <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
                        {config.icon && (() => {
                            const Icon = config.icon;
                            return <Icon className="w-3.5 h-3.5 opacity-90 mr-0.5" />;
                        })()}
                        {isInvalid && <AlertCircle className="w-3.5 h-3.5 text-rose-100 shrink-0" />}
                        {title || config.label}
                    </div>
                </div>
            </div>

            {/* Node Body */}
            <div className="p-3 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 shadow-inner">
                {children}
            </div>

            {type !== 'START' && (
                <Handle
                    type="target"
                    position={Position.Left}
                    isConnectable={isConnectable}
                    className="w-3 h-3 border-2 border-white dark:border-slate-800 bg-slate-400 dark:bg-slate-500"
                />
            )}

            {type !== 'END' && (
                <Handle
                    type="source"
                    position={Position.Right}
                    isConnectable={isConnectable}
                    className="w-3 h-3 border-2 border-white dark:border-slate-800 bg-slate-400 dark:bg-slate-500"
                />
            )}
        </div>
    );
};
