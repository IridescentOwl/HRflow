import { create } from 'zustand';
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
    nodes: HRNode[];
    edges: HREdge[];
    selectedNodeId: string | null;
    simulationLogs: SimulationLog[];

    // React Flow Handlers
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;

    // Custom Actions
    addNode: (node: HRNode) => void;
    updateNodeData: (id: string, newData: any) => void;
    setSelectedNodeId: (id: string | null) => void;

    // Simulation Actions
    addSimulationLog: (log: SimulationLog) => void;
    clearSimulationLogs: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    simulationLogs: [],

    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes) as HRNode[],
        });
    },

    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges) as HREdge[],
        });
    },

    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },

    addNode: (node: HRNode) => {
        set({ nodes: [...get().nodes, node] });
    },

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

    setSelectedNodeId: (id: string | null) => {
        set({ selectedNodeId: id });
    },

    addSimulationLog: (log: SimulationLog) => {
        set({ simulationLogs: [...get().simulationLogs, log] });
    },

    clearSimulationLogs: () => {
        set({ simulationLogs: [] });
    },
}));
