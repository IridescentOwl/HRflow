import { v4 as uuidv4 } from 'uuid';
import { HRNode, HREdge, SimulationLog } from '../types';
import { nodeRegistry } from '../registry/nodeRegistry';

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

        const startNode = startNodes[0];
        const visited = new Set<string>();

        if (startNode) {
            const stack = [startNode.id];
            while (stack.length > 0) {
                const current = stack.pop()!;
                if (!visited.has(current)) {
                    visited.add(current);
                    const neighbors = this.adjacencyList[current] || [];
                    stack.push(...neighbors);
                }
            }
        }

        for (const [nodeId, node] of this.nodes.entries()) {
            if (startNode && !visited.has(nodeId)) {
                errors.push({ nodeId, message: `Node disconnected from workflow path.` });
            }

            // Enforce Zod Schema strictly
            const config = nodeRegistry[node.type as keyof typeof nodeRegistry];
            if (config && config.schema) {
                const validation = config.schema.safeParse(node.data);
                if (!validation.success) {
                    errors.push({ nodeId, message: 'Node configuration schema validation failed. Required fields missing.' });
                }
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

    public *simulateInteractive(): Generator<SimulationLog | { type: 'PAUSE'; nodeId: string; prompt: string }, void, string | undefined> {
        const startNodes = Array.from(this.nodes.values()).filter(n => n.type === 'START');
        if (startNodes.length === 0) return;

        const queue: string[] = [startNodes[0].id];
        const visited = new Set<string>();

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (visited.has(currentId)) continue;
            visited.add(currentId);

            const node = this.nodes.get(currentId)!;

            yield {
                id: crypto.randomUUID(),
                nodeId: currentId,
                timestamp: new Date().toISOString(),
                status: 'PENDING',
                message: `Executing [${node.type}]: ${node.data.title || node.id}`,
            };

            let nextNodes = this.adjacencyList[currentId] || [];

            if (node.type === 'APPROVAL') {
                const action = yield { type: 'PAUSE', nodeId: currentId, prompt: `Awaiting action from ${node.data.approverRole?.replace('role_', '').toUpperCase() || 'Manager'}` };
                yield {
                    id: crypto.randomUUID(),
                    nodeId: currentId,
                    timestamp: new Date().toISOString(),
                    status: action === 'Rejected' ? 'ERROR' : 'SUCCESS',
                    message: `Approval Node Processed: Decision was [${action}]`,
                };

                // Pathway Branch Logic
                if (action === 'Rejected') {
                    const rejectedEdge = this.edges.find(e => e.source === currentId && e.data?.condition === 'Rejected');
                    nextNodes = rejectedEdge ? [rejectedEdge.target] : [];
                } else if (action === 'Approved') {
                    const approvedEdge = this.edges.find(e => e.source === currentId && e.data?.condition === 'Approved');
                    if (approvedEdge) nextNodes = [approvedEdge.target];
                }
            } else if (node.type === 'TASK') {
                const action = yield { type: 'PAUSE', nodeId: currentId, prompt: `Awaiting human task completion by ${node.data.assignee || 'User'}` };
                yield {
                    id: crypto.randomUUID(),
                    nodeId: currentId,
                    timestamp: new Date().toISOString(),
                    status: 'SUCCESS',
                    message: `Manual Task Completed: Marked as [${action}]`,
                };
            } else if (node.type === 'AUTOMATED') {
                yield {
                    id: crypto.randomUUID(),
                    nodeId: currentId,
                    timestamp: new Date().toISOString(),
                    status: 'SUCCESS',
                    message: `Mock System API Triggered Action: ${node.data.actionId}`,
                };
            } else {
                yield {
                    id: crypto.randomUUID(),
                    nodeId: currentId,
                    timestamp: new Date().toISOString(),
                    status: 'SUCCESS',
                    message: `Processed structural node`,
                };
            }

            queue.push(...nextNodes);
        }

        yield {
            id: crypto.randomUUID(),
            nodeId: 'system',
            timestamp: new Date().toISOString(),
            status: 'SUCCESS',
            message: `Workflow completed execution successfully.`,
        };
    }
}
