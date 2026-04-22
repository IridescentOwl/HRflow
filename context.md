# HR Workflow Designer - Project Context Handoff

## Project Identity & Current State
**Project:** Tredence Analytics AI Agentic Framework - HR Workflow Designer
**Tech Stack:** React (Vite), TypeScript, TailwindCSS, React Flow, Zustand (with Zundo middleware for undo/redo), Zod, Dagre (Auto-layout), Lucide-React.
**Status:** **100% COMPLETE** mapping up to Phase 14 extensions. Production-ready, enterprise-grade prototype designed via strict MVC architecture rather than monolithic coupling. 

## Core Architectural Layout & File Map

### 1. Data Models & Registries (The "M" in MVC)
* **`src/registry/nodeRegistry.ts`**: The absolute single source of truth for the entire platform. Defines `Start`, `Task`, `Approval`, `Automated`, and `End` nodes. Provides default colors, fields, labels, and crucially holds the **Zod Schemas** utilized by the global store.
* **`src/types.ts`**: Contains types mapped globally (`NodeType`, `NodeDefinition`, `SimulationLog`, etc). 

### 2. Global State & History Management
* **`src/store/store.ts`**: Utilizes `Zustand` completely removed from the React DOM lifecycles. Contains the `nodes`, `edges`, scaling `executionState`, and `validationErrors`. Encapsulated using `zundo` to support deep multi-dimensional **Undo / Redo** history queues implicitly mapping the entire graph tree on any state updates.

### 3. Canvas & UI (The "V" & "C")
* **`src/App.tsx`**: Sets the root structural logic utilizing absolute Figma-style floating module placements.
* **`src/components/canvas/Workspace.tsx`**: Handles the ReactFlow mapping, custom node assignments, Top Toolbar, Minimap bounds, custom background corporate Swimlanes, and handles JSON Import/Export drops mapping directly to standard Blob URLs.
* **`src/components/forms/NodeEditor.tsx` & `DynamicForm.tsx`**: Natively generates mapping payload inputs (select, text, number, etc.) on the fly dictated entirely by the `nodeRegistry.ts` config. Pushes immediately upwards into `Zod` validation on `blur` interactions. 
* **`src/components/nodes/BaseNode.tsx` & `CustomNodes.tsx`**: Visual wrappers displaying Lucide icons, contextual "Approve" buttons conditionally, highlighting visually if selected, currently running, or invalid.

### 4. Graph Execution Backend (The Engine)
* **`src/engine/engine.ts`**: Object-Oriented generic graph parser utilizing adjacency lists. Operates recursive **DFS (Depth First Search)** to trap cyclical loops and missing execution parameters natively before runtime.
* **`src/components/sandbox/SandboxPanel.tsx`**: Uses **JavaScript Generator Iterators (`function*`)** to execute the Workflow. This allows the system to seamlessly "yield" execution gracefully to wait for a human user to natively click "Approve" or "Reject" directly on a node UI block before resuming parsing the DFS array.

## Core Technical Solutions Solved
1. **Interactive Node Waiting:** Handled via JavaScript Generators to allow continuous simulated waiting without locking React rendering paths or destroying the simulated `Timeout` mock layers. 
2. **Divergent Paths:** Paths branch visually parsing `edge.data.condition` vectors based on dynamic interactive Sandbox inputs.
3. **Dynamic Object Tracking:** Prevented constant complete-graph re-renders by enforcing Zod/Zustand single path update tracking strictly on current properties. 

## Next Steps for Future Continued Development
1. **Database Persistence Layer:** The native JSON Import/Export mechanism works flawlessly. This now requires an endpoint translation API to sync into a proper NoSQL/SQL system (Firebase / PostgreSQL) instead of raw JSON downloads.
2. **True Active Directory Bindings:** The `ApprovalNode` simulates role assignments (e.g., `Management`, `Admin`). This should be transitioned to fetch live Active Directory user pools parsing standard identity resolution frameworks.
3. **Advanced Auto-Layout Logic:** Expand the `dagre` implementation in `Workspace.tsx` to handle highly complex sub-trees natively avoiding horizontal overlaps.
