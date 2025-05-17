export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type AgentStatus = 'idle' | 'busy' | 'error';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  capabilities: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface TaskChain {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceMetrics {
  agentId: string;
  tasksCompleted: number;
  failedTasks: number;
  averageCompletionTime: number;
  successRate: number;
  lastUpdated: Date;
} 