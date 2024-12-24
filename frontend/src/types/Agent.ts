export interface Agent {
    id: string;
    name: string;
    status: 'idle' | 'running' | 'completed' | 'failed';
    startTime?: string;
    endTime?: string;
  }
  
  export interface AgentExecutionInfo {
    currentlyRunning: Agent[];
    recentlyCompleted: Agent[];
  }