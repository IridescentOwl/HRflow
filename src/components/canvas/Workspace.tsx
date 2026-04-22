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
import { Undo2, Redo2, Download, Upload, Network, MousePointer2, Hand, Trash2, FileJson, Search, Layers } from 'lucide-react';
import dagre from 'dagre';
import { WorkflowEngine } from '../../engine/engine';

interface ToolbarProps {
    selectionMode: boolean;
    setSelectionMode: (mode: boolean) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ selectionMode, setSelectionMode }) => {
    const { nodes, edges, setNodes, setEdges, setSelectedNodeId, showSwimlanes, toggleSwimlanes } = useWorkflowStore();
    const { undo, redo, pastStates, futureStates } = useWorkflowStore.temporal.getState();
    const { setCenter } = useReactFlow();

    const [searchQuery, setSearchQuery] = useState('');

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
        const data = JSON.stringify({
            version: '1.0.0',
            status: 'Draft',
            lastModified: new Date().toISOString(),
            nodes,
            edges
        }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hr-workflow-draft-v1.json';
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

    const focusNode = (node: any) => {
        setCenter(node.position.x + 125, node.position.y + 50, { zoom: 1.5, duration: 800 });
        setSearchQuery('');
        nodes.forEach(n => n.selected = false);
        node.selected = true;
        setSelectedNodeId(node.id);
    };

    return (
        <div id="tutorial-toolbar" className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all">
            <div className="relative group">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-all" title="Templates">
                    <Layers className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold tracking-wide">Templates</span>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden flex flex-col z-50">
                    <button onClick={() => useWorkflowStore.getState().loadTemplate('hiring')} className="text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">Hiring Pipeline</button>
                    <button onClick={() => useWorkflowStore.getState().loadTemplate('onboarding')} className="text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">Onboarding</button>
                    <button onClick={() => useWorkflowStore.getState().loadTemplate('leave')} className="text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">Leave Request</button>
                </div>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                    type="text"
                    placeholder="Search Nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 w-40 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-text font-sans"
                />
                {searchQuery && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                        {nodes.filter(n => (n.data.title || '').toLowerCase().includes(searchQuery.toLowerCase())).map(n => (
                            <button key={n.id} onClick={() => focusNode(n)} className="w-full text-left px-4 py-2 hover:bg-sky-50 dark:hover:bg-slate-700 text-xs font-semibold block">{n.data.title || n.id}</button>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button onClick={() => setSelectionMode(false)} className={`p-2 rounded-lg transition-all ${!selectionMode ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 shadow-inner' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Pan Tool (Space + Drag)">
                <Hand className="w-4 h-4" />
            </button>
            <button onClick={() => setSelectionMode(true)} className={`p-2 rounded-lg transition-all ${selectionMode ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 shadow-inner' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Box Select Tool (Shift + Drag)">
                <MousePointer2 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button onClick={toggleSwimlanes} className={`p-2 rounded-lg transition-all flex items-center justify-center ${showSwimlanes ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Toggle Architectural Swimlanes">
                <Layers className={`w-4 h-4 ${showSwimlanes ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
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
        theme,
        showSwimlanes
    } = useWorkflowStore();

    const [selectionMode, setSelectionMode] = useState(true);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
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
        <div id="tutorial-canvas" className="flex-1 h-full w-full relative bg-slate-50 dark:bg-slate-950" ref={reactFlowWrapper} onDragEnter={onDragEnter}>

            {/* Corporate Horizontal Swimlanes */}
            {showSwimlanes && (
                <div className="absolute inset-0 pointer-events-none opacity-90 dark:opacity-50 z-0 flex flex-col justify-evenly">
                    <div className="w-full h-1/3 border-b-[3px] border-dashed border-slate-300 dark:border-slate-700 flex items-end pb-3 pr-8 justify-end">
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/80 px-4 py-1.5 rounded shadow-sm border border-slate-200 dark:border-slate-700">Executive & Management</span>
                    </div>
                    <div className="w-full h-1/3 border-b-[3px] border-dashed border-slate-300 dark:border-slate-700 flex items-end pb-3 pr-8 justify-end">
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/80 px-4 py-1.5 rounded shadow-sm border border-slate-200 dark:border-slate-700">Operations & Logistics</span>
                    </div>
                    <div className="w-full h-1/3 flex items-end pb-3 pr-8 justify-end">
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/80 px-4 py-1.5 rounded shadow-sm border border-slate-200 dark:border-slate-700">Finance & Administration</span>
                    </div>
                </div>
            )}

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
                onMoveStart={() => setIsMoving(true)}
                onMoveEnd={() => setIsMoving(false)}
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
                className="bg-transparent z-10"
            >
                <Background gap={24} size={2} color={theme === 'dark' ? '#64748b' : '#94a3b8'} />
                <Controls
                    position="bottom-left"
                    className="!bg-white dark:!bg-slate-800 !border-2 !border-slate-300 dark:!border-slate-600 shadow-xl rounded-lg !mb-8 !ml-8 !z-20 overflow-hidden"
                    style={{ '--xy-controls-button-bg-color': theme === 'dark' ? '#1e293b' : '#ffffff', '--xy-controls-button-color': theme === 'dark' ? '#f1f5f9' : '#334155', '--xy-controls-button-border-color': theme === 'dark' ? '#334155' : '#e2e8f0', '--xy-controls-button-bg-color-hover': theme === 'dark' ? '#334155' : '#f1f5f9' } as React.CSSProperties}
                />
                <MiniMap
                    className={`!bg-white dark:!bg-slate-800 !border-2 !border-slate-300 dark:!border-slate-600 shadow-2xl rounded-lg mb-8 !z-20 transition-opacity duration-300 ${isMoving ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    maskColor={theme === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(241, 245, 249, 0.85)'}
                    nodeColor={(n: any) => n.selected ? '#0ea5e9' : theme === 'dark' ? '#475569' : '#cbd5e1'}
                />
            </ReactFlow>
        </div>
    );
};

export const Workspace = () => {
    return (
        <div className="w-full h-full relative">
            <ReactFlowProvider>
                <FlowCanvas />
            </ReactFlowProvider>
        </div>
    );
};
