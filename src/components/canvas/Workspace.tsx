import React, { useCallback, useRef, useEffect, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    useReactFlow,
    SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { useWorkflowStore } from '../../store/store';
import { NodeType, HRNodeData } from '../../types';
import { nodeRegistry } from '../../registry/nodeRegistry';
import { customNodeTypes } from '../nodes/CustomNodes';
import { Sidebar } from './Sidebar';
import { Undo2, Redo2, Download, Upload, Network, MousePointer2, Hand, Trash2, FileJson } from 'lucide-react';
import dagre from 'dagre';
import { WorkflowEngine } from '../../engine/engine';

interface ToolbarProps {
    selectionMode: boolean;
    setSelectionMode: (mode: boolean) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ selectionMode, setSelectionMode }) => {
    const { nodes, edges, setNodes, setEdges } = useWorkflowStore();
    const { undo, redo, pastStates, futureStates } = useWorkflowStore.temporal.getState();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeTagName = document.activeElement?.tagName.toLowerCase();
            if (activeTagName === 'input' || activeTagName === 'textarea') return;

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                if (e.shiftKey) {
                    if (futureStates.length > 0) redo();
                } else {
                    if (pastStates.length > 0) undo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, pastStates, futureStates]);

    const handleDelete = () => {
        const selectedNodeIds = new Set(nodes.filter(n => n.selected).map(n => n.id));
        if (selectedNodeIds.size === 0 && !edges.some(e => e.selected)) return;

        setNodes(nodes.filter(n => !n.selected));
        setEdges(edges.filter(e => !e.selected && !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)));
    };

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
        dagreGraph.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 100 });

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
        <div className="absolute top-4 left-6 z-10 flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-white/20 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all">
            <button onClick={() => setSelectionMode(false)} className={`p-2 rounded-lg transition-all ${!selectionMode ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 shadow-inner' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Pan Tool (Space + Drag)">
                <Hand className="w-4 h-4" />
            </button>
            <button onClick={() => setSelectionMode(true)} className={`p-2 rounded-lg transition-all ${selectionMode ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 shadow-inner' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Box Select Tool (Shift + Drag)">
                <MousePointer2 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button onClick={handleDelete} className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-all shadow-sm active:scale-95" title="Delete Selected">
                <Trash2 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button onClick={() => undo()} disabled={pastStates.length === 0} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-all" title="Undo (Ctrl+Z)">
                <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={() => redo()} disabled={futureStates.length === 0} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-all" title="Redo (Ctrl+Shift+Z)">
                <Redo2 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button onClick={handleLayout} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-all group" title="Auto-Layout">
                <Network className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold tracking-wide">Tidy Up</span>
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button onClick={handleExport} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-all group" title="Export">
                <Download className="w-4 h-4 text-emerald-500 group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-xs font-bold tracking-wide">Export</span>
            </button>
            <label className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer group" title="Import JSON">
                <Upload className="w-4 h-4 text-violet-500 group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-xs font-bold tracking-wide">Import</span>
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
        </div>
    );
};

const FlowCanvas = () => {
    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        setSelectedNodeId,
        setValidationErrors,
        theme
    } = useWorkflowStore();

    const [selectionMode, setSelectionMode] = useState(true);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const dragCounter = useRef(0);

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    // Prevent accidental refresh execution loss
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (nodes.length > 0) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes in your workflow. Are you sure you want to refresh?';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [nodes]);

    // Real-time silent validation
    useEffect(() => {
        const engine = new WorkflowEngine(nodes, edges);
        const { errors } = engine.validate();
        setValidationErrors(errors);
    }, [nodes, edges, setValidationErrors]);

    const onDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.items && Array.from(e.dataTransfer.items).some(i => i.kind === 'file')) {
            dragCounter.current += 1;
            setIsDraggingFile(true);
        }
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.items && Array.from(e.dataTransfer.items).some(i => i.kind === 'file')) {
            dragCounter.current -= 1;
            if (dragCounter.current === 0) {
                setIsDraggingFile(false);
            }
        }
    }, []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = event.dataTransfer.types.includes('Files') ? 'copy' : 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            dragCounter.current = 0;
            setIsDraggingFile(false);

            // Native Drag and Drop JSON behavior
            if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                const file = event.dataTransfer.files[0];
                if (file.type === "application/json" || file.name.endsWith(".json")) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const parsed = JSON.parse(e.target?.result as string);
                            if (parsed.nodes && parsed.edges) {
                                setNodes(parsed.nodes);
                                setEdges(parsed.edges);
                            }
                        } catch (err) {
                            alert("Failed to parse JSON file.");
                        }
                    };
                    reader.readAsText(file);
                    return;
                }
            }

            // Handle dragging from the node palette
            const type = event.dataTransfer.getData('application/reactflow') as NodeType;
            if (!type || !nodeRegistry[type]) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            let finalPosition = position;
            const isOverlap = (pos: { x: number; y: number }) => {
                return nodes.some(n => {
                    const dx = Math.abs(n.position.x - pos.x);
                    const dy = Math.abs(n.position.y - pos.y);
                    return dx < 30 && dy < 30;
                });
            };

            let attempt = 0;
            while (isOverlap(finalPosition) && attempt < 20) {
                finalPosition = { x: finalPosition.x + 30, y: finalPosition.y + 30 };
                attempt++;
            }

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
                position: finalPosition,
                data: initialData as HRNodeData,
            };

            addNode(newNode as any);
        },
        [screenToFlowPosition, addNode, setNodes, setEdges, nodes]
    );

    return (
        <div className="flex-1 h-full w-full relative" ref={reactFlowWrapper} onDragEnter={onDragEnter}>
            {isDraggingFile && (
                <div
                    className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-all duration-300"
                    onDragLeave={onDragLeave}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                >
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center pointer-events-none transform scale-100 animate-in fade-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-sky-50 dark:bg-sky-900/50 rounded-full flex items-center justify-center mb-6">
                            <FileJson className="w-10 h-10 text-sky-500 animate-bounce" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Drop JSON to Import Workflow</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Your current canvas nodes will be replaced entirely.</p>
                    </div>
                </div>
            )}

            <Toolbar selectionMode={selectionMode} setSelectionMode={setSelectionMode} />
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
                panOnDrag={!selectionMode ? [0, 1, 2] : [1, 2]} // 0=left, 1=middle, 2=right
                panOnScroll={false}
                zoomOnScroll={true}
                multiSelectionKeyCode={['Shift', 'Control', 'Meta']}
                selectionKeyCode={['Shift', 'Control', 'Meta']}
                selectionOnDrag={selectionMode}
                selectionMode={SelectionMode.Partial}
                deleteKeyCode={['Backspace', 'Delete']}
                className="bg-slate-50/50 dark:bg-slate-950/50"
            >
                <Background gap={16} color={theme === 'dark' ? '#334155' : '#cbd5e1'} />
                <Controls className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 fill-slate-700 dark:fill-slate-300 shadow-sm rounded-md mb-8" />
                <MiniMap className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-md mb-8 ring-1 ring-slate-200 dark:ring-slate-800" maskColor={theme === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(248, 250, 252, 0.7)'} />
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
