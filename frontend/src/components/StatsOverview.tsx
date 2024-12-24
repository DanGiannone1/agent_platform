import React from 'react';
import { Play, Clock, CheckCircle } from 'lucide-react';

interface StatsOverviewProps {
  availableCount: number;
  runningCount: number;
  completedCount: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  availableCount,
  runningCount,
  completedCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {/* Available Agents Card */}
      <div className="bg-neutral-900/50 backdrop-blur-sm rounded-lg p-4 border border-neutral-800">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-neutral-800">
            <Play className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="ml-4">
            <div className="text-sm text-neutral-400">Available Agents</div>
            <div className="text-2xl font-semibold text-neutral-200">{availableCount}</div>
          </div>
        </div>
      </div>

      {/* Running Agents Card */}
      <div className="bg-neutral-900/50 backdrop-blur-sm rounded-lg p-4 border border-neutral-800">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-neutral-800">
            <Clock className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="ml-4">
            <div className="text-sm text-neutral-400">Running Agents</div>
            <div className="text-2xl font-semibold text-neutral-200">{runningCount}</div>
          </div>
        </div>
      </div>

      {/* Completed Agents Card */}
      <div className="bg-neutral-900/50 backdrop-blur-sm rounded-lg p-4 border border-neutral-800">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-neutral-800">
            <CheckCircle className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="ml-4">
            <div className="text-sm text-neutral-400">Completed Agents</div>
            <div className="text-2xl font-semibold text-neutral-200">{completedCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;