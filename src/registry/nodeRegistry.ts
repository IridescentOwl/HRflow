import { z } from 'zod';
import { NodeDefinition, NodeType } from '../types';
import { PlayCircle, CheckSquare, UserCheck, Zap, StopCircle } from 'lucide-react';

export const nodeRegistry: Record<NodeType, NodeDefinition> = {
    START: {
        type: 'START',
        label: 'Start Event',
        description: 'The entry point of the workflow.',
        color: '#0ea5e9', // sky-500
        icon: PlayCircle,
        fields: [
            { name: 'title', label: 'Title', type: 'text', defaultValue: 'Start' },
            { name: 'metadata', label: 'Custom Metadata', type: 'key-value' },
        ],
        schema: z.object({
            title: z.string().optional(),
            metadata: z.any().optional(),
        }),
    },
    TASK: {
        type: 'TASK',
        label: 'Manual Task',
        description: 'A task to be completed by a human.',
        color: '#8b5cf6', // violet-500
        icon: CheckSquare,
        fields: [
            { name: 'title', label: 'Task Title', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'assignee', label: 'Assignee Email or Group', type: 'text', required: true },
            { name: 'dueDate', label: 'Due Date', type: 'text' },
        ],
        schema: z.object({
            title: z.string().min(1, 'Task title is strictly required'),
            description: z.string().optional(),
            assignee: z.string().min(1, 'Assignee is strictly required'),
            dueDate: z.string().optional(),
        }),
    },
    APPROVAL: {
        type: 'APPROVAL',
        label: 'Approval Step',
        description: 'Requires sign-off from a designated manager or role.',
        color: '#f97316', // orange-500
        icon: UserCheck,
        fields: [
            { name: 'title', label: 'Approval Title', type: 'text', defaultValue: 'Pending Approval' },
            { name: 'approverRole', label: 'Approver Role', type: 'select', required: true },
            { name: 'autoApproveThreshold', label: 'Auto-Approve Threshold (Days)', type: 'number' },
        ],
        schema: z.object({
            title: z.string().optional(),
            approverRole: z.string().min(1, 'Active Directory Role binding is required'),
            autoApproveThreshold: z.number().optional().or(z.string().regex(/^\d+$/).transform(Number)),
        }),
    },
    AUTOMATED: {
        type: 'AUTOMATED',
        label: 'Automated Action',
        description: 'System triggered action (e.g. Email, Webhook).',
        color: '#10b981', // emerald-500
        icon: Zap,
        fields: [
            { name: 'title', label: 'Action Title', type: 'text' },
            { name: 'actionId', label: 'Action Type', type: 'select', required: true },
        ],
        schema: z.object({
            title: z.string().optional(),
            actionId: z.string().min(1, 'System action type must be selected'),
        }),
    },
    END: {
        type: 'END',
        label: 'End Event',
        description: 'Terminates the workflow successfully.',
        color: '#64748b', // slate-500
        icon: StopCircle,
        fields: [
            { name: 'title', label: 'Title', type: 'text', defaultValue: 'End' },
            { name: 'endMessage', label: 'Completion Message', type: 'textarea' },
            { name: 'summaryFlag', label: 'Generate Summary Report', type: 'boolean', defaultValue: false },
        ],
        schema: z.object({
            title: z.string().optional(),
            endMessage: z.string().optional(),
            summaryFlag: z.boolean().optional(),
        }),
    },
};
