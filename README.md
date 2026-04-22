# HR Workflow Designer

This project is a functional, enterprise-grade HR Workflow Designer built for processing modular business logic. I built this from a "zero-to-one" framework to solve the problem of hardcoded, rigid internal tools by moving heavily towards a metadata-driven graph architecture.

## Origin and Problem Statement

When I initially approached this project, the immediate challenge was clear: how do we build an extensible workflow engine without creating a massive, tightly coupled React monolith? Typical workflow builders suffer from rendering bottlenecks, where state loops trigger constant DOM re-renders, and introducing a single new "Task Node" requires creating multiple new component files and hooking them individually into the core state. 

The first iteration started as a simple visual React Flow canvas, but it quickly became apparent that scaling this to handle complex data like HR role assignments and automated wait states would be impossible without a strict decoupling strategy. 

## Architectural Decisions and Reasoning

To solve this, I structured the application using a strict Model-View-Controller (MVC) separation. It is designed so that future developers can understand the "why" behind the core logic, rather than just the "what".

1. **The Model (Metadata & Schema Registry):** I completely decoupled the visual nodes from their configuration logic. By creating a central `nodeRegistry.ts`, every node operates merely as a visual shell. The registry dictates exactly what fields a node requires. If the engineering team needs to add a new "Payroll" node tomorrow, they only need to modify 10 lines of JSON in the registry instead of writing new React components. 
2. **Validation (Zod):** Relying on loose TypeScript interfaces wasn't enough for enterprise compliance. I integrated Zod to forcefully validate every form input against the registry schema before any state mutation is allowed.
3. **State Management (Zustand + Zundo):** I moved the entire canvas array outside of the React lifecycle. Using Zustand allowed me to bypass traditional prop-drilling, while Zundo middleware enabled true temporal history. The system natively supports multi-dimensional Undo/Redo tracking without writing complex immutable array logic manually.
4. **Graph Execution (Custom Engine):** React Flow is great for visualization, but poor for business logic. I built an isolated object-oriented graph traversal class (`engine.ts`) to independently parse the React Flow output into mathematical adjacency lists. This lets the system execute deep Depth-First Search (DFS) algorithms in the background to detect dead cycles or missing edges instantly without locking the frontend.

## Technical Challenges and Solutions

The hardest problems I faced during development revolved around state synchronization and execution mechanics:

1. **Interactive Sandbox Execution:** The most complex challenge was building a simulation engine that could actually pause midway through a graph traversal to wait for human input (like an Approval step). Traditional async/await loops inside React components were locking up the browser or losing state tracking. It took me a significant amount of time to figure out that I needed to shift to JavaScript Generator iterators (`function*`). This allowed the DFS traversal to yield cleanly, pass control back to the UI to render "Approve/Reject" buttons natively on the nodes, and then safely resume traversal exactly where it left off.
2. **Dynamic Form Re-renders:** Initially, typing into the configuration panel was causing the entire React Flow canvas to re-render, dropping performance heavily for larger graphs. I resolved this by isolating the `updateNodeData` mechanism strictly to the selected node's object path within the Zustand setter, ensuring only the target node repaints.
3. **Divergent Path Logic:** For the Approval nodes, the system had to understand how to branch paths based on specific "Approved" vs "Rejected" connections. Mapping edge conditions natively required writing custom React Flow edge components, injecting conditional payloads into edge schemas, and modifying the DFS engine to read edge metadata before conditionally parsing to the next neighbor block. 

## Final Implemented Features

- Complete React Flow drag-and-drop environment with custom UI bindings.
- Node palette with distinct configurations (Start, Task, Approval, Automated Action, End).
- Zod-schema verified dynamic configuration property panels.
- JSON Import and Export capabilities with timestamped version control.
- Intelligent Auto-Layout routing utilizing Dagre graph sorting.
- Interactive Simulator utilizing Generator Iterators to seamlessly wait for user input.
- Divergent Edge branches highlighting pass/fail execution states conditionally.
- Search Engine toolbar integration for instantaneous node discovery and panning.
- Visual corporate swimlanes dynamically separating functional zones.
- Layered Figma-style absolute positioned glassmorphic UI panels.

## Setup Instructions

Ensure Node.js (v18+) is installed.

```bash
npm install
npm run dev
```

The server will load the design client natively on `http://localhost:5173`.
