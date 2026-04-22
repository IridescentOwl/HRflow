import { BaseNode } from './BaseNode';
import { TaskNodeData, ApprovalNodeData, AutomatedNodeData } from '../../types';
import { useWorkflowStore } from '../../store/store';

export const StartNode = (props: any) => {
    return (
        <BaseNode {...props} type="START">
            <div className="text-xs text-slate-500">Entry point triggered by system.</div>
        </BaseNode>
    );
};

export const TaskNode = (props: { id: string; data: TaskNodeData; selected: boolean; isConnectable: boolean }) => {
    const triggerExecutionAction = useWorkflowStore(state => state.triggerExecutionAction);
    const execState = useWorkflowStore(state => state.executionState);
    const isAwaiting = execState.isPaused && execState.activeNodeId === props.id;

    return (
        <BaseNode {...props} type="TASK">
            <div className="text-xs space-y-1">
                {props.data.description && <div className="text-slate-700 dark:text-slate-300 truncate">{props.data.description}</div>}
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <span className="font-medium text-slate-500">Assignee:</span>
                    <span>{props.data.assignee || 'Unassigned'}</span>
                </div>
                {isAwaiting && (
                    <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-sky-100 dark:border-sky-900/50">
                        <span className="text-[10px] font-bold tracking-wide text-sky-500 uppercase animate-pulse">Awaiting Completion</span>
                        <button onClick={() => triggerExecutionAction?.('Completed')} className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded py-1.5 font-bold shadow-sm transition-all active:scale-95">Complete Task</button>
                    </div>
                )}
            </div>
        </BaseNode>
    );
};

export const ApprovalNode = (props: { id: string; data: ApprovalNodeData; selected: boolean; isConnectable: boolean }) => {
    const triggerExecutionAction = useWorkflowStore(state => state.triggerExecutionAction);
    const execState = useWorkflowStore(state => state.executionState);
    const isAwaiting = execState.isPaused && execState.activeNodeId === props.id;

    return (
        <BaseNode {...props} type="APPROVAL">
            <div className="text-xs space-y-1">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-500">Approver:</span>
                    <span className="bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-900/50 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{props.data.approverRole?.replace('role_', '').toUpperCase() || 'Unassigned'}</span>
                </div>
                {isAwaiting && (
                    <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-orange-100 dark:border-orange-900/50">
                        <span className="text-[10px] font-bold tracking-wide text-amber-500 uppercase animate-pulse">Authorization Required</span>
                        <div className="flex gap-2">
                            <button onClick={() => triggerExecutionAction?.('Approved')} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded py-1.5 font-bold shadow-sm transition-all active:scale-95">Approve</button>
                            <button onClick={() => triggerExecutionAction?.('Rejected')} className="flex-1 bg-rose-500 hover:bg-rose-400 text-white rounded py-1.5 font-bold shadow-sm transition-all active:scale-95">Reject</button>
                        </div>
                    </div>
                )}
            </div>
        </BaseNode>
    );
};

export const AutomatedNode = (props: { id: string; data: AutomatedNodeData; selected: boolean; isConnectable: boolean }) => {
    return (
        <BaseNode {...props} type="AUTOMATED">
            <div className="text-xs space-y-1">
                <div className="flex items-center text-slate-600 dark:text-slate-300 font-medium">
                    <svg className="w-3 h-3 mr-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {props.data.actionId ? props.data.actionId.replace('_', ' ').toUpperCase() : 'No action selected'}
                </div>
            </div>
        </BaseNode>
    );
};

export const EndNode = (props: any) => {
    return (
        <BaseNode {...props} type="END">
            <div className="text-xs text-slate-500 line-clamp-2">{props.data.endMessage || (props.data.summaryFlag ? 'Summary will be generated.' : 'Workflow completed.')}</div>
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
