import React, { useEffect, useState } from 'react';
import { Agent, AgentExecutionInfo } from '../types/Agent';
import { Activity, AlertCircle } from 'lucide-react';
import StatsOverview from './StatsOverview';

const AgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [executionInfo, setExecutionInfo] = useState<AgentExecutionInfo>({
    currentlyRunning: [],
    recentlyCompleted: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch functions remain the same
  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:5000/available_agents');
      const data = await response.json();
      return data as Agent[];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch agents');
    }
  };

  const fetchExecutionInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/agent_execution_info');
      const data = await response.json();
      return data as AgentExecutionInfo;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch execution info');
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [availableAgents, agentExecution] = await Promise.all([
          fetchAgents(),
          fetchExecutionInfo(),
        ]);
        setAgents(availableAgents);
        setExecutionInfo(agentExecution);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex items-center space-x-3 text-neutral-400">
          <Activity className="w-6 h-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
          <div className="text-lg text-neutral-400 mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Stats Overview */}
      <StatsOverview 
        availableCount={agents.length}
        runningCount={executionInfo.currentlyRunning.length}
        completedCount={executionInfo.recentlyCompleted.length}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Available Agents */}
        <div className="bg-neutral-900/50 backdrop-blur-sm rounded-lg border border-neutral-800 p-6">
          <h2 className="text-xl font-semibold text-neutral-200 mb-6">Available Agents</h2>
          <div className="space-y-4">
            {agents.map(agent => (
              <div 
                key={agent.id}
                className="bg-neutral-800/50 rounded-lg border border-neutral-700 p-4 hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-neutral-200 font-medium">{agent.name}</h3>
                    <p className="text-neutral-500 text-sm mt-1">ID: {agent.id}</p>
                  </div>
                  <button className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600 transition-colors">
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Running Agents */}
        <div className="bg-neutral-900/50 backdrop-blur-sm rounded-lg border border-neutral-800 p-6">
          <h2 className="text-xl font-semibold text-neutral-200 mb-6">Running Agents</h2>
          <div className="space-y-4">
            {executionInfo.currentlyRunning.map(agent => (
              <div 
                key={agent.id}
                className="bg-neutral-800/50 rounded-lg border border-neutral-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-neutral-200 font-medium">{agent.name}</h3>
                    <p className="text-neutral-500 text-sm mt-1">
                      Started: {new Date(agent.startTime!).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-neutral-400">
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Running</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;