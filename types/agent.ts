export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type AgentStatus = 'idle' | 'busy' | 'error';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string | null;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'busy' | 'error';
  capabilities: string[];
  created_at: string;
  updated_at: string;
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