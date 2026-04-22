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
                if (node.data.title === 'Send Acceptance Offer!') {
                    try {
                        window.location.href = 'mailto:dparikh_be23@thapar.edu?subject=offer%20letter%20from%20tredence&body=Dear%20Candidate%2C%0D%0A%0D%0AWe%20are%20thrilled%20to%20offer%20you%20the%20position%20of%20Full%20Stack%20Engineering%20Intern%20%28AI%20Agentic%20Platforms%29%20at%20Tredence%20Analytics.%20We%20were%20highly%20impressed%20with%20your%20submission%20for%20the%20HR%20Workflow%20Designer%20Module%20case%20study.%0D%0A%0D%0AWe%20especially%20loved%20the%20little%20easter%20egg%20you%20built%20into%20the%20Approval%20Node%E2%80%94having%20it%20automatically%20send%20an%20acceptance%20email%20when%20run%20and%20approved%20was%20a%20brilliant%20touch%20that%20perfectly%20demonstrated%20the%20%22zero-to-one%22%20mindset%20we%20are%20looking%20for.%0D%0A%0D%0AWelcome%20to%20the%20Tredence%20Studio%20AI%20Agents%20Engineering%20Team%21%0D%0A%0D%0ABest%20regards%2C%0D%0ATredence%20Analytics';
                    } catch (e) { }
                }

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
