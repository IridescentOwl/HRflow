import React from 'react';
import { Handle, Position } from 'reactflow';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NodeType } from '../../types';
import { nodeRegistry } from '../../registry/nodeRegistry';

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

    return (
        <div
            className={cn(
                "min-w-[200px] max-w-[280px] bg-white rounded-lg shadow-sm border-2 overflow-hidden transition-all",
                selected ? "border-sky-500 shadow-md ring-2 ring-sky-100" : "border-slate-200"
            )}
        >
            {/* Node Header */}
            <div
                className="px-3 py-2 flex items-center justify-between border-b border-white/20"
                style={{ backgroundColor: config.color }}
            >
                <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-white tracking-wide">
                        {title || config.label}
                    </div>
                </div>
            </div>

            {/* Node Body */}
            <div className="p-3 text-sm text-slate-600 bg-white shadow-inner">
                {children}
            </div>

            {type !== 'START' && (
                <Handle
                    type="target"
                    position={Position.Left}
                    isConnectable={isConnectable}
                    className="w-3 h-3 border-2 border-white bg-slate-400"
                />
            )}

            {type !== 'END' && (
                <Handle
                    type="source"
                    position={Position.Right}
                    isConnectable={isConnectable}
                    className="w-3 h-3 border-2 border-white bg-slate-400"
                />
            )}
        </div>
    );
};
