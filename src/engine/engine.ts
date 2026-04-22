import { v4 as uuidv4 } from 'uuid';
import { HRNode, HREdge, SimulationLog } from '../types';

interface AdjacencyList {
    [nodeId: string]: string[];
}

export class WorkflowEngine {
    private nodes: Map<string, HRNode>;
    private edges: HREdge[];
    private adjacencyList: AdjacencyList;

    constructor(nodes: HRNode[], edges: HREdge[]) {
        this.nodes = new Map(nodes.map(n => [n.id, n]));
        this.edges = edges;
        this.adjacencyList = this.buildAdjacencyList();
    }

    private buildAdjacencyList(): AdjacencyList {
        const list: AdjacencyList = {};
        for (const node of this.nodes.values()) {
            list[node.id] = [];
        }
        for (const edge of this.edges) {
            if (list[edge.source]) {
                if (!list[edge.source].includes(edge.target)) {
                    list[edge.source].push(edge.target);
                }
            }
        }
        return list;
    }

    public validate(): { isValid: boolean; errors: { nodeId: string; message: string }[] } {
        const errors: { nodeId: string; message: string }[] = [];
        const startNodes = Array.from(this.nodes.values()).filter(n => n.type === 'START');

        if (startNodes.length === 0) {
            errors.push({ nodeId: 'system', message: 'Workflow must have exactly one Start Node.' });
        } else if (startNodes.length > 1) {
            startNodes.forEach(n => errors.push({ nodeId: n.id, message: 'Workflow cannot have more than one Start Node.' }));
        }

        if (errors.length > 0) return { isValid: false, errors };

        const startNode = startNodes[0];
        const visited = new Set<string>();
        const stack = [startNode.id];

        while (stack.length > 0) {
            const current = stack.pop()!;
            if (!visited.has(current)) {
                visited.add(current);
                const neighbors = this.adjacencyList[current] || [];
                stack.push(...neighbors);
            }
        }

        for (const nodeId of this.nodes.keys()) {
            if (!visited.has(nodeId)) {
                errors.push({ nodeId, message: `Node disconnected from workflow path.` });
            }
        }

        return { isValid: errors.length === 0, errors };
    }

    public *simulateStepByStep(): Generator<SimulationLog, void, unknown> {
        const startNodes = Array.from(this.nodes.values()).filter(n => n.type === 'START');
        if (startNodes.length === 0) {
            yield this.createLog('system', 'ERROR', 'Simulation failed: No Start Node found.');
            return;
        }

        const startNode = startNodes[0];
        const queue = [startNode.id];
        const visited = new Set<string>();

        yield this.createLog('system', 'SUCCESS', 'Simulation started.');

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (visited.has(currentId)) continue;

            visited.add(currentId);
            const node = this.nodes.get(currentId);

            if (!node) continue;

            yield this.createLog(node.id, 'SUCCESS', `Executed node [${node.type}]: ${node.data.title}`);

            const neighbors = this.adjacencyList[currentId] || [];
            queue.push(...neighbors);
        }

        yield this.createLog('system', 'SUCCESS', 'Simulation completed successfully.');
    }

    private createLog(nodeId: string, status: 'SUCCESS' | 'ERROR' | 'PENDING', message: string): SimulationLog {
        return {
            id: uuidv4(),
            nodeId,
            timestamp: new Date().toISOString(),
            status,
            message,
        };
    }
}
