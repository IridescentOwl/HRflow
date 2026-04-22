# Tredence Analytics: AI Agentic Framework - HR Workflow Designer

**Submission For:** Full Stack Engineering Intern (AI Agentic Platforms)  
**Objective:** Design and implement an extensible mini-HR Workflow Designer module leveraging state-of-the-art React Flow architectures.

---

## 🚀 Quick Start (How to Run)

1. **Prerequisites:** Ensure you have Node.js installed (v18+ recommended).
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Run the Development Server (Vite):**
   ```bash
   npm run dev
   ```
   *The application will launch typically at `http://localhost:5173`.*

---

## 🏛 Architecture & Design Principles

This prototype was built specifically targeting Tredence's core objectives: **scalable modular frontend design, complex graph traversal, type-safety, and "zero-to-one" problem solving.** 

To achieve an enterprise-ready architecture, the application is strictly partitioned utilizing the **Model-View-Controller (MVC)** methodology, rejecting tightly coupled "React-heavy" monoliths in favor of cleanly decoupled logic layers:

### 1. The Model (Metadata & Schema Registry)
- **`src/registry/nodeRegistry.ts`:** Instead of hardcoding 50 different React node forms across 50 UI files, this project uses a central Metadata Registry. Adding a new node (like "Payroll Node" or "Background Check") requires precisely 10 lines of configuration in a single file. 
- **Zod Data Validation:** Every configuration object maps directly to a `Zod` validation schema ensuring strict corporate type-safety.

### 2. State & History Management
- **`src/store/store.ts` (Zustand + Zundo):** The entire application state (Canvas Nodes, Active Workflows, Validation Flags, Theme Selection) is lifted completely out of the React DOM lifecycle.
- This allows implementing true temporal history natively across the DAG! Thanks to `zundo` middleware wrappers, we map full multi-dimensional **Undo / Redo** history queues.

### 3. The Execution Engine (Graph Abstraction)
- **`src/engine/engine.ts`:** A completely isolated object-oriented graph traversal class. It independently parses the workflows into mathematical adjacency lists, mapping deep Depth-First Search (DFS) traversals to instantly flag dead-cycles, missing edge paths, and missing required variables—all operating blazingly fast in the background.

---

## ⚙️ Implemented Functional Features

✔ **Fully Dynamic React-Flow Canvas:**
Featuring custom UI visual bindings for Start, Task, Approval, Automated, and End Node events with multi-selection and seamless mouse traversal.

✔ **Dynamic Configuration Forms:**
Selecting a node dynamically translates the `nodeRegistry` blueprints into a React input interface. Form state pushes immediately to the global Zod validators and automatically visually scales error outputs if the submission fails.

✔ **Mock API Sandbox Execution:**
A localized Developer Console (Sandbox) panel allows for the serialization of the graph into JSON, deploying it concurrently simulating asynchronous API delays, mapping executing nodes to timeline log components.

✔ **Auto-Layout Formatting Arrays:**
Utilizing the `dagre` deterministic layout engine allowing users to automatically "Tidy Up" severely disjointed maps.

✔ **Dark / Light Mode Corporate Theming:**
Complete scalable TailwindCSS mapping linked dynamically through the global UI architecture.

---

## 🔮 What Was Completed vs What I Would Add With More Time

### Achieved 100% of Primary and Bonus Deliverables:
- ✅ React Vite App with robust Multi-custom Node mapping
- ✅ Centralized Configurable Edit Forms (Zod Verified)
- ✅ Sandbox Panel Simulation Logic 
- ✅ JSON Import & Exporting 
- ✅ Undo / Redo Global State Actions
- ✅ Intelligent Dagre Auto-graph mapping
- ✅ Responsive visually alerting Node errors across Canvas nodes.

### Long Term "Scale to Enterprise" Architecture (Phase 12+ Scope):
If granted extending development cycles mapping to a corporate ecosystem equivalent to Workday or BambooHR:

1. **Conditional Divergent Routing:** Expand `HREdge` endpoints mapping exact bifurcating branch routes visually (e.g. `If Approved => Path A` vs `If Rejected => Path B`).
2. **Active Directory Node Bindings:** Tie the current Role bindings natively into Active Server environments, forcefully fetching organizational Role Hierarchies to lock distinct tasks off to validated managers.
3. **Workspace Minimap Query Zooming:** Implement a search bar layered over the Map for instances involving 500+ node paths allowing 60FPS pan-zooming.
4. **Department Swimlanes:** Categorically partition the background workspace grid natively separating HR divisions ("Legal", "Finance", "Talent Acquisition").
