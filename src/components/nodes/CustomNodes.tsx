import React from 'react';
import { BaseNode } from './BaseNode';
import { StartNodeData, TaskNodeData, ApprovalNodeData, AutomatedNodeData, EndNodeData } from '../../types';

export const StartNode = (props: any) => {
    return (
        <BaseNode {...props} type="START">
            <div className="text-xs text-slate-500">Entry point triggered by system.</div>
        </BaseNode>
    );
};

export const TaskNode = (props: { id: string; data: TaskNodeData; selected: boolean; isConnectable: boolean }) => {
    return (
        <BaseNode {...props} type="TASK">
            <div className="text-xs space-y-1">
                {props.data.description && <div className="text-slate-700 truncate">{props.data.description}</div>}
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-100">
                    <span className="font-medium text-slate-500">Assignee:</span>
                    <span>{props.data.assignee || 'Unassigned'}</span>
                </div>
            </div>
        </BaseNode>
    );
};

export const ApprovalNode = (props: { id: string; data: ApprovalNodeData; selected: boolean; isConnectable: boolean }) => {
    return (
        <BaseNode {...props} type="APPROVAL">
            <div className="text-xs space-y-1">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-500">Approver:</span>
                    <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 font-medium">{props.data.approverRole || 'Unassigned'}</span>
                </div>
            </div>
        </BaseNode>
    );
};

export const AutomatedNode = (props: { id: string; data: AutomatedNodeData; selected: boolean; isConnectable: boolean }) => {
    return (
        <BaseNode {...props} type="AUTOMATED">
            <div className="text-xs space-y-1">
                <div className="flex items-center text-slate-600 font-medium">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {props.data.actionId ? props.data.actionId.replace('_', ' ') : 'No action selected'}
                </div>
            </div>
        </BaseNode>
    );
};

export const EndNode = (props: any) => {
    return (
        <BaseNode {...props} type="END">
            <div className="text-xs text-slate-500">{props.data.endMessage || (props.data.summaryFlag ? 'Summary will be generated' : 'Workflow completed')}</div>
        </BaseNode>
    );
};

export const customNodeTypes = {
    START: StartNode,
    TASK: TaskNode,
    APPROVAL: ApprovalNode,
    AUTOMATED: AutomatedNode,
    END: EndNode,
};
