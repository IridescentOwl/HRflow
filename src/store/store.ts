import { create } from 'zustand';
import { temporal } from 'zundo';
import {
    Connection,
    EdgeChange,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { HRNode, HREdge, SimulationLog } from '../types';

export interface WorkflowState {
    theme: 'light' | 'dark';
    nodes: HRNode[];
    edges: HREdge[];
    selectedNodeId: string | null;
    simulationLogs: SimulationLog[];
    validationErrors: { nodeId: string; message: string }[];

    toggleTheme: () => void;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;

    addNode: (node: HRNode) => void;
    setNodes: (nodes: HRNode[]) => void;
    setEdges: (edges: HREdge[]) => void;
    updateNodeData: (id: string, newData: any) => void;
    setSelectedNodeId: (id: string | null) => void;
    setValidationErrors: (errors: { nodeId: string; message: string }[]) => void;

    addSimulationLog: (log: SimulationLog) => void;
    clearSimulationLogs: () => void;
    executionState: {
        isRunning: boolean;
        activeNodeId: string | null;
        isPaused: boolean;
    };
    setExecutionState: (state: Partial<WorkflowState['executionState']>) => void;
    triggerExecutionAction: ((action: string) => void) | null;
    setTriggerExecutionAction: (fn: ((action: string) => void) | null) => void;

    showSwimlanes: boolean;
    toggleSwimlanes: () => void;
}

const initialNodes: HRNode[] = [
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
];

const initialEdges: HREdge[] = [
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
];

export const useWorkflowStore = create<WorkflowState>()(
    temporal(
        (set, get) => ({
            theme: 'light',
            showSwimlanes: false,
            toggleSwimlanes: () => set(state => ({ showSwimlanes: !state.showSwimlanes })),

            toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

            nodes: initialNodes,
            edges: initialEdges,
            selectedNodeId: null,
            simulationLogs: [],
            validationErrors: [],

            executionState: {
                isRunning: false,
                activeNodeId: null,
                isPaused: false,
            },
            setExecutionState: (state) => set((s) => ({ executionState: { ...s.executionState, ...state } })),
            triggerExecutionAction: null,
            setTriggerExecutionAction: (fn) => set({ triggerExecutionAction: fn }),

            onNodesChange: (changes: NodeChange[]) => {
                set({ nodes: applyNodeChanges(changes, get().nodes) as HRNode[] });
            },
            onEdgesChange: (changes: EdgeChange[]) => {
                set({ edges: applyEdgeChanges(changes, get().edges) as HREdge[] });
            },
            onConnect: (connection: Connection) => {
                const sourceNode = get().nodes.find(n => n.id === connection.source);
                let edgePayload: any = { ...connection, id: `edge-${uuidv4()}` };

                if (sourceNode?.type === 'APPROVAL') {
                    const existingOutEdges = get().edges.filter(e => e.source === connection.source);
                    if (existingOutEdges.length >= 2) return; // Prevent more than 2 condition paths

                    const label = existingOutEdges.length === 0 ? 'Approved' : 'Rejected';

                    edgePayload = {
                        ...edgePayload,
                        label,
                        style: { stroke: label === 'Approved' ? '#10b981' : '#f43f5e', strokeWidth: 2 },
                        animated: true,
                        labelStyle: { fill: label === 'Approved' ? '#10b981' : '#f43f5e', fontWeight: 700, fontSize: 13 },
                        data: { condition: label }
                    };
                }

                set({ edges: addEdge(edgePayload, get().edges) as HREdge[] });
            },
            addNode: (node: HRNode) => {
                set({ nodes: [...get().nodes, node] });
            },
            setNodes: (nodes: HRNode[]) => set({ nodes }),
            setEdges: (edges: HREdge[]) => set({ edges }),
            updateNodeData: (id: string, newData: any) => {
                set({
                    nodes: get().nodes.map((node) => {
                        if (node.id === id) {
                            return { ...node, data: { ...node.data, ...newData } };
                        }
                        return node;
                    }),
                });
            },
            setSelectedNodeId: (id: string | null) => set({ selectedNodeId: id }),
            setValidationErrors: (validationErrors) => set({ validationErrors }),
            addSimulationLog: (log: SimulationLog) => set({ simulationLogs: [...get().simulationLogs, log] }),
            clearSimulationLogs: () => set({ simulationLogs: [] }),
        }),
        {
            partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
            limit: 50,
        }
    )
);
