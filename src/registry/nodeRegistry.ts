import { NodeDefinition, NodeType } from '../types';

export const nodeRegistry: Record<NodeType, NodeDefinition> = {
    START: {
        type: 'START',
        label: 'Start Node',
        description: 'The entry point of the workflow.',
        color: '#10b981', // emerald-500
        fields: [
            { name: 'title', label: 'Title', type: 'text', required: true, defaultValue: 'Start' },
            { name: 'metadata', label: 'Metadata', type: 'key-value' },
        ],
    },
    TASK: {
        type: 'TASK',
        label: 'Human Task',
        description: 'A manual task assigned to a person (e.g., collect documents).',
        color: '#3b82f6', // blue-500
        fields: [
            { name: 'title', label: 'Title', type: 'text', required: true, defaultValue: 'New Task' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'assignee', label: 'Assignee', type: 'text' },
            { name: 'dueDate', label: 'Due Date', type: 'text' },
            { name: 'customFields', label: 'Custom Fields', type: 'key-value' },
        ],
    },
    APPROVAL: {
        type: 'APPROVAL',
        label: 'Approval Node',
        description: 'An approval step requiring manager or HR review.',
        color: '#f59e0b', // amber-500
        fields: [
            { name: 'title', label: 'Title', type: 'text', required: true, defaultValue: 'Approval' },
            {
                name: 'approverRole',
                label: 'Approver Role',
                type: 'select',
                options: [
                    { label: 'Manager', value: 'Manager' },
                    { label: 'HRBP', value: 'HRBP' },
                    { label: 'Director', value: 'Director' },
                ],
            },
            { name: 'autoApproveThreshold', label: 'Auto-approve Threshold', type: 'number' },
        ],
    },
    AUTOMATED: {
        type: 'AUTOMATED',
        label: 'Automated Step',
        description: 'A system-triggered action.',
        color: '#8b5cf6', // violet-500
        fields: [
            { name: 'title', label: 'Title', type: 'text', required: true, defaultValue: 'Auto Action' },
            { name: 'actionId', label: 'Action', type: 'select', options: [] }, // Will be hydrated from mock API
            { name: 'actionParams', label: 'Action Parameters', type: 'key-value' },
        ],
    },
    END: {
        type: 'END',
        label: 'End Node',
        description: 'The completion of the workflow.',
        color: '#64748b', // slate-500
        fields: [
            { name: 'title', label: 'Title', type: 'text', required: true, defaultValue: 'End' },
            { name: 'endMessage', label: 'End Message', type: 'textarea' },
            { name: 'summaryFlag', label: 'Generate Summary?', type: 'boolean', defaultValue: false },
        ],
    },
};
