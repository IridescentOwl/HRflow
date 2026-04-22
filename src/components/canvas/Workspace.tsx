import React, { useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { useWorkflowStore } from '../../store/store';
import { NodeType, HRNodeData, HRNode, HREdge } from '../../types';
import { nodeRegistry } from '../../registry/nodeRegistry';
import { customNodeTypes } from '../nodes/CustomNodes';
import { Sidebar } from './Sidebar';
import { Undo2, Redo2, Download, Upload, Network } from 'lucide-react';
import dagre from 'dagre';
import { WorkflowEngine } from '../../engine/engine';

const Toolbar = () => {
    const { nodes, edges, setNodes, setEdges } = useWorkflowStore();
    const { undo, redo, pastStates, futureStates } = useWorkflowStore.temporal.getState();

    const handleExport = () => {
        const data = JSON.stringify({ nodes, edges }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hr-workflow.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const { nodes, edges } = JSON.parse(event.target?.result as string);
                setNodes(nodes);
                setEdges(edges);
            } catch (err) {
                alert("Failed to parse JSON file.");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleLayout = () => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({ rankdir: 'LR' }); // Left to Right

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: 250, height: 100 });
        });
        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            return {
                ...node,
                position: {
                    x: nodeWithPosition.x - 125,
                    y: nodeWithPosition.y - 50,
                },
            };
        });

        setNodes(layoutedNodes);
    };

    return (
        <div className="absolute top-4 left-6 z-10 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200 text-slate-700">
            <button onClick={() => undo()} disabled={pastStates.length === 0} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-50 transition-colors" title="Undo">
                <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={() => redo()} disabled={futureStates.length === 0} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-50 transition-colors" title="Redo">
                <Redo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button onClick={handleLayout} className="p-1.5 hover:bg-slate-100 rounded flex items-center gap-1.5 transition-colors" title="Auto-Layout">
                <Network className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-semibold">Tidy Up</span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button onClick={handleExport} className="p-1.5 hover:bg-slate-100 rounded flex items-center gap-1.5 transition-colors" title="Export">
                <Download className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold">Export</span>
            </button>
            <label className="p-1.5 hover:bg-slate-100 rounded flex items-center gap-1.5 transition-colors cursor-pointer" title="Import JSON">
                <Upload className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-semibold">Import</span>
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
        </div>
    );
};

const FlowCanvas = () => {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        setSelectedNodeId,
        setValidationErrors
    } = useWorkflowStore();

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    // Real-time silent validation
    useEffect(() => {
        const engine = new WorkflowEngine(nodes, edges);
        const { errors } = engine.validate();
        setValidationErrors(errors);
    }, [nodes, edges, setValidationErrors]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow') as NodeType;
            if (!type || !nodeRegistry[type]) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const config = nodeRegistry[type];
            const initialData: Record<string, any> = {};
            config.fields.forEach(f => {
                if (f.defaultValue !== undefined) {
                    initialData[f.name] = f.defaultValue;
                }
            });

            const newNode = {
                id: `${type}-${uuidv4()}`,
                type,
                position,
                data: initialData as HRNodeData,
            };

            addNode(newNode as any);
        },
        [screenToFlowPosition, addNode]
    );

    return (
        <div className="flex-1 h-full w-full relative" ref={reactFlowWrapper}>
            <Toolbar />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={customNodeTypes}
                onSelectionChange={useCallback((params: { nodes: any[] }) => {
                    setSelectedNodeId(params.nodes.length > 0 ? params.nodes[0].id : null);
                }, [setSelectedNodeId])}
                onDragOver={onDragOver}
                onDrop={onDrop}
                fitView
                className="bg-slate-50/50"
            >
                <Background gap={16} color="#cbd5e1" />
                <Controls className="bg-white border-slate-200 shadow-sm rounded-md mb-8" />
                <MiniMap className="border-slate-200 shadow-sm rounded-md mb-8 ring-1 ring-slate-200" maskColor="rgba(248, 250, 252, 0.7)" />
            </ReactFlow>
        </div>
    );
};

export const Workspace = () => {
    return (
        <div className="flex w-full h-full relative">
            <Sidebar />
            <ReactFlowProvider>
                <FlowCanvas />
            </ReactFlowProvider>
        </div>
    );
};
