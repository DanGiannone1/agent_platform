import React, { useEffect, useState } from 'react';
import { Agent, AgentExecutionInfo } from '../types/Agent';
import { Activity, AlertCircle, Bot, PlayCircle, Clock, CheckCircle2, Loader2 } from 'lucide-react';
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
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="text-lg">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center max-w-md mx-auto p-6 bg-neutral-900/50 rounded-xl border border-red-500/20">
          <AlertCircle className="w-12 h-12 text-red-500/80 mx-auto mb-4" />
          <div className="text-lg text-neutral-200 mb-2">Something went wrong</div>
          <p className="text-neutral-400 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700 transition-colors inline-flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-400">Available Agents</p>
              <h3 className="text-2xl font-bold text-blue-300">{agents.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 backdrop-blur-sm rounded-xl border border-amber-500/20 p-6 hover:border-amber-500/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-400">Running Agents</p>
              <h3 className="text-2xl font-bold text-amber-300">{executionInfo.currentlyRunning.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-sm rounded-xl border border-emerald-500/20 p-6 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-400">Completed Agents</p>
              <h3 className="text-2xl font-bold text-emerald-300">{executionInfo.recentlyCompleted.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Agents */}
        <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-neutral-800 p-6">
          <h2 className="text-xl font-semibold text-neutral-200 mb-6 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            Available Agents
          </h2>
          <div className="space-y-4">
            {agents.map(agent => (
              <div 
                key={agent.id}
                className="group bg-neutral-800/50 rounded-xl border border-neutral-700 p-5 hover:border-blue-500/30 hover:bg-neutral-800/80 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-200">
                        <Bot className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-medium text-neutral-200 truncate">{agent.name}</h3>
                    </div>
                    <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2">{agent.description}</p>
                  </div>
                  <button 
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/20"
                    onClick={() => {/* Add start handler */}}
                  >
                    <PlayCircle className="w-4 h-4" />
                    Start
                  </button>
                </div>
              </div>
            ))}
            {agents.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No agents available</p>
              </div>
            )}
          </div>
        </div>

        {/* Running Agents */}
        <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-neutral-800 p-6">
          <h2 className="text-xl font-semibold text-neutral-200 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            Running Agents
          </h2>
          <div className="space-y-4">
            {executionInfo.currentlyRunning.map(agent => (
              <div 
                key={agent.id}
                className="group bg-neutral-800/50 rounded-xl border border-neutral-700 p-5 hover:border-amber-500/30 hover:bg-neutral-800/80 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-medium text-neutral-200 truncate">{agent.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Started: {new Date(agent.startTime!).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {executionInfo.currentlyRunning.length === 0 && (
              <div className="text-center py-12 px-6">
                <div className="max-w-sm mx-auto">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-neutral-500 opacity-50" />
                  <p className="text-neutral-400 mb-2">No agents currently running</p>
                  <p className="text-sm text-neutral-500">Start an agent from the available list to see it here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;