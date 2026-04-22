import { SimulationLog, HRNode, HREdge } from '../types';

export const mockActions = [
    { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
    { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
    { id: 'slack_message', label: 'Send Slack Message', params: ['channel', 'message'] },
    { id: 'update_db', label: 'Update Database', params: ['table', 'status'] }
];

export const fetchAutomations = async () => {
    // Simulate network delay
    return new Promise<typeof mockActions>((resolve) => {
        setTimeout(() => {
            resolve(mockActions);
        }, 400);
    });
};

export const simulateWorkflow = async (nodes: HRNode[], edges: HREdge[]) => {
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
