# Mini-HR Workflow Designer

A modular, scalable, frontend-only prototype for an HR Workflow Designer built with React, React Flow, and Zustand. The design adheres strictly to decoupled engineering principles inspired by platforms like Langflow, packaged behind a sleek modern B2B SaaS aesthetic.

## Features & Deliverables Met
- **React Application:** Boilerplate initialized with Vite + React + TS.
- **Workflow Canvas:** Fully interactive `reactflow` workspace supporting node selection, edge connections, deletion, drops.
- **Configurable Dynamic Nodes:** Using a strictly decoupled `"Source of Truth" Node Registry`. The dynamic properties panel constructs its UI purely backwards from metadata configurations assigned to nodes.
- **Controlled Global State:** Zustand coordinates the entire DAG lifecycle without prop-drilling or component bloat.
- **Mock API Integrations:** `mockApi.ts` delivers local simulation environments and asynchronous action hydration (Automated Node populates via `/get actions`).
- **Sandbox Testing Terminal:** Built-in console log UI simulating execution paths dynamically while evaluating schema constraints like graph cycles or orphan nodes.

## Technical Architecture & Design Decisions

### 1. `useWorkflowStore` (Zustand Global state)
React Flow intrinsically carries an internal state representation but syncing that across deeply decoupled architectural layers (canvas -> forms -> simulated output) can trigger desync failures. Moving **nodes, edges, and logs** entirely into Zustand `store.ts` unifies data flow. Form actions execute `updateNodeData(id)`, guaranteeing one unidirectional sync chain back to ReactFlow.

### 2. Node Schema Registry Pattern
Usually, node definitions are tightly coupled inside UI components rendering properties. Here, every structural parameter of a node (Start, Task, automated actions etc.) exists strictly as a JSON definition residing in `registry/nodeRegistry.ts`.
**Benefit:** Scale easily. Extending to `JiraTicketAction` or `DocusignRequest` occurs immediately by modifying `nodeRegistry.ts`.

### 3. Separation of Canvas & Forms
- `/components/nodes/BaseNode.tsx`: Purely presentational. Never invokes or alters state internally. Renders structural UI.
- `/components/forms/DynamicForm.tsx`: Dynamically builds inputs mapping the active `selectedNodeId` context to input types (text, textarea, boolean).

### 4. Engine Logic Isolation (`engine/engine.ts`)
Decoupled React completely from structural graph traversals. Creating `new WorkflowEngine(nodes, edges)` converts ReactFlow edges to a directed adjacency list map. Generator functions (`yield`) simulate actual async step-by-steps traversing tree structures sequentially to the Sandbox layout UI.

## Getting Started

Because it relies on local simulation and mocks, the installation sequence is frictionless.

1. Ensure you have Node (`v18+`) installed.
2. Clone or download the repository.
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Run the local development server:
   ```bash
   npm run dev
   ```

## Assumptions & Missing Elements (Due to time constraints)
- **Undo / Redo:** React Flow makes this simple with past/future history stacks in Zustand, but skipped due to priority parsing.
- **Real Backend Validations:** Graph cycles simulate synchronous structural error checks here. A strict implementation would await server resolution blocks.
- **Persisted State:** Workflow sessions reset on page refresh. Usually solved with Zustand's localstorage middleware.
