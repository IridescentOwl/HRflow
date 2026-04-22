import { Node, Edge } from 'reactflow';

export type NodeType = 'START' | 'TASK' | 'APPROVAL' | 'AUTOMATED' | 'END';

export interface BaseNodeData {
  title: string;
  [key: string]: any;
}

export interface StartNodeData extends BaseNodeData {
  metadata?: Record<string, string>;
}

export interface TaskNodeData extends BaseNodeData {
  description?: string;
  assignee?: string;
  dueDate?: string;
  customFields?: Record<string, string>;
}

export interface ApprovalNodeData extends BaseNodeData {
  approverRole?: string;
  autoApproveThreshold?: number;
}

export interface AutomatedNodeData extends BaseNodeData {
  actionId?: string;
  actionParams?: Record<string, any>;
}

export interface EndNodeData extends BaseNodeData {
  endMessage?: string;
  summaryFlag?: boolean;
}

export type HRNodeData = StartNodeData | TaskNodeData | ApprovalNodeData | AutomatedNodeData | EndNodeData;

export type HRNode = Node<HRNodeData>;
export type HREdge = Edge;

export interface SimulationLog {
  id: string;
  nodeId: string;
  timestamp: string;
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
  message: string;
}

// Field definition for rendering dynamic forms
export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'key-value';

export interface FieldDefinition {
  name: string; // The property key in node data
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[]; // For select type
  defaultValue?: any;
}

export interface NodeDefinition {
  type: NodeType;
  label: string;
  description: string;
  color: string;
  fields: FieldDefinition[];
}
