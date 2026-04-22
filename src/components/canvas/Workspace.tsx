import React, { useCallback, useRef } from 'react';
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
import { NodeType, HRNodeData } from '../../types';
import { nodeRegistry } from '../../registry/nodeRegistry';
import { customNodeTypes } from '../nodes/CustomNodes';
import { Sidebar } from './Sidebar';

const FlowCanvas = () => {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        setSelectedNodeId,
    } = useWorkflowStore();

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

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
                <Controls className="bg-white border-slate-200 shadow-sm rounded-md" />
                <MiniMap className="border-slate-200 shadow-sm rounded-md" maskColor="rgba(248, 250, 252, 0.7)" />
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
