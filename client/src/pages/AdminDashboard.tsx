import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { ActivityFeedItem } from '../components/ActivityFeedItem';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { FolderKanban, CheckSquare, AlertCircle, Radio, Activity, Bell } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/admin');
      return res.data.data;
    },
  });

  if (isLoading) return <LoadingSkeleton count={6} />;

  const {
    totalProjects = 0,
    totalTasks = 0,
    tasksByStatus = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 },
    overdueTaskCount = 0,
    activeUsersOnline = 1,
    recentActivity = [],
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
            <FolderKanban className="w-5 h-5 text-brand-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-100">{totalProjects}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <CheckSquare className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-100">{totalTasks}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Tasks</span>
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-rose-400">{overdueTaskCount}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Users Online</span>
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-300">{activeUsersOnline}</p>
          <p className="text-[10px] text-emerald-400/80">Real-time Socket.IO connection count</p>
        </div>
      </div>

      {/* Task Status Breakdown */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-semibold text-sm text-slate-200">Tasks Breakdown by Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-xs font-medium text-slate-400">To Do</span>
            <p className="text-xl font-bold text-slate-200 mt-1">{tasksByStatus.TODO || 0}</p>
          </div>
          <div className="p-4 bg-blue-950/30 rounded-xl border border-blue-500/20">
            <span className="text-xs font-medium text-blue-400">In Progress</span>
            <p className="text-xl font-bold text-blue-300 mt-1">{tasksByStatus.IN_PROGRESS || 0}</p>
          </div>
          <div className="p-4 bg-amber-950/30 rounded-xl border border-amber-500/20">
            <span className="text-xs font-medium text-amber-400">In Review</span>
            <p className="text-xl font-bold text-amber-300 mt-1">{tasksByStatus.IN_REVIEW || 0}</p>
          </div>
          <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-500/20">
            <span className="text-xs font-medium text-emerald-400">Done</span>
            <p className="text-xl font-bold text-emerald-300 mt-1">{tasksByStatus.DONE || 0}</p>
          </div>
        </div>
      </div>

      {/* Global Real-Time Activity Feed */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-400" />
            <h3 className="font-semibold text-sm text-slate-200">Global Activity Feed</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Real-time updates</span>
        </div>

        <div className="space-y-2.5">
          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No recent activity recorded</p>
          ) : (
            recentActivity.map((act: any) => <ActivityFeedItem key={act.id} activity={act} />)
          )}
        </div>
      </div>
    </div>
  );
};
