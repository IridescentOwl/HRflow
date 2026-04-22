import { HRNode, HREdge } from '../types';

export const workflowTemplates: Record<string, { id: string, name: string, nodes: HRNode[], edges: HREdge[] }> = {
    hiring: {
        id: 'hiring',
        name: "Technical Hiring Pipeline (Dhairya)",
        nodes: [
            {
                id: 'start-1',
                type: 'START',
                position: { x: 50, y: 150 },
                data: { title: 'Application Received', metadata: { Candidate: 'Dhairya', Role: 'Full Stack Engineering Intern' } }
            },
            {
                id: 'task-1',
                type: 'TASK',
                position: { x: 300, y: 150 },
                data: { title: 'Technical Interview', description: 'Evaluate React Flow & Zustand state management skills.', assignee: 'Engineering Team' }
            },
            {
                id: 'approval-1',
                type: 'APPROVAL',
                position: { x: 600, y: 150 },
                data: { title: 'Final Hiring Decision', approverRole: 'role_director', autoApproveThreshold: 1 }
            },
            {
                id: 'automated-1',
                type: 'AUTOMATED',
                position: { x: 900, y: 50 },
                data: { title: 'Send Acceptance Offer!', actionId: 'send_email' }
            },
            {
                id: 'end-1',
                type: 'END',
                position: { x: 1200, y: 50 },
                data: { title: 'Candidate Hired 🎉', endMessage: 'Onboarding sequences successfully initiated.' }
            }
        ],
        edges: [
            { id: 'edge-1', source: 'start-1', target: 'task-1', animated: true },
            { id: 'edge-2', source: 'task-1', target: 'approval-1', animated: true },
            {
                id: 'edge-3', source: 'approval-1', target: 'automated-1', animated: true,
                label: 'Approved',
                style: { stroke: '#10b981', strokeWidth: 2 },
                labelStyle: { fill: '#10b981', fontWeight: 700, fontSize: 13 },
                data: { condition: 'Approved' }
            },
            { id: 'edge-4', source: 'automated-1', target: 'end-1', animated: true }
        ]
    },
    onboarding: {
        id: 'onboarding',
        name: "Employee Onboarding",
        nodes: [
            { id: 'ob-start', type: 'START', position: { x: 50, y: 150 }, data: { title: 'New Hire Contract Signed' } },
            { id: 'ob-task1', type: 'TASK', position: { x: 350, y: 150 }, data: { title: 'Provision IT Equipment', assignee: 'IT Operations' } },
            { id: 'ob-task2', type: 'TASK', position: { x: 650, y: 150 }, data: { title: 'HR Orientation & Benefits', assignee: 'HR Generalist' } },
            { id: 'ob-end', type: 'END', position: { x: 950, y: 150 }, data: { title: 'Onboarding Complete' } },
        ],
        edges: [
            { id: 'obe1', source: 'ob-start', target: 'ob-task1', animated: true },
            { id: 'obe2', source: 'ob-task1', target: 'ob-task2', animated: true },
            { id: 'obe3', source: 'ob-task2', target: 'ob-end', animated: true },
        ]
    },
    leave: {
        id: 'leave',
        name: "Leave Time Request",
        nodes: [
            { id: 'lr-start', type: 'START', position: { x: 50, y: 150 }, data: { title: 'Absence Requested' } },
            { id: 'lr-approval', type: 'APPROVAL', position: { x: 350, y: 150 }, data: { title: 'Manager Approval', approverRole: 'role_manager' } },
            { id: 'lr-auto', type: 'AUTOMATED', position: { x: 650, y: 150 }, data: { title: 'Update Core HRIS', actionId: 'update_db' } },
            { id: 'lr-auto2', type: 'AUTOMATED', position: { x: 950, y: 150 }, data: { title: 'Slack Notification', actionId: 'slack_message' } },
            { id: 'lr-end', type: 'END', position: { x: 1250, y: 150 }, data: { title: 'Absence Scheduled' } },
        ],
        edges: [
            { id: 'lre1', source: 'lr-start', target: 'lr-approval', animated: true },
            { id: 'lre2', source: 'lr-approval', target: 'lr-auto', animated: true, label: 'Approved', style: { stroke: '#10b981', strokeWidth: 2 }, data: { condition: 'Approved' } },
            { id: 'lre3', source: 'lr-auto', target: 'lr-auto2', animated: true },
            { id: 'lre4', source: 'lr-auto2', target: 'lr-end', animated: true },
        ]
    }
};
