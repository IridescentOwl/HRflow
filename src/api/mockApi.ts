import { HRNode, HREdge } from '../types';

export const mockActions = [
    { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
    { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
    { id: 'slack_message', label: 'Send Slack Message', params: ['channel', 'message'] },
    { id: 'update_db', label: 'Update Database', params: ['table', 'status'] }
];

export const activeDirectoryRoles = [
    { id: 'role_hrbp', label: 'HR Business Partner' },
    { id: 'role_manager', label: 'Direct Manager' },
    { id: 'role_director', label: 'Director' },
    { id: 'role_csuite', label: 'C-Suite Executive' },
    { id: 'role_it_admin', label: 'IT Administrator' }
];

export const fetchADRoles = async () => {
    return new Promise<typeof activeDirectoryRoles>((resolve) => {
        setTimeout(() => resolve(activeDirectoryRoles), 300);
    });
};

export const fetchAutomations = async () => {
    // Simulate network delay
    return new Promise<typeof mockActions>((resolve) => {
        setTimeout(() => {
            resolve(mockActions);
        }, 400);
    });
};

export const simulateWorkflow = async (nodes: HRNode[], _edges: HREdge[]) => {
    // Mock simulation runner hitting the endpoint
    return new Promise<{ success: boolean; resultNodes: string[] }>((resolve, reject) => {
        setTimeout(() => {
            // Very basic structural validation mock logic
            const startNode = nodes.find(n => n.type === 'START');
            if (!startNode) {
                return reject(new Error("Workflow must contain a Start Node."));
            }

            resolve({ success: true, resultNodes: nodes.map(n => n.id) });
        }, 1000);
    });
};
