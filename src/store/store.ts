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
}

export const useWorkflowStore = create<WorkflowState>()(
    temporal(
        (set, get) => ({
            theme: 'light',
            toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

            nodes: [],
            edges: [],
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
                set({ edges: addEdge(connection, get().edges) });
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
