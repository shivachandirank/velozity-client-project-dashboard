import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { ActivityFeedItem } from '../components/ActivityFeedItem';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { TaskCard } from '../components/TaskCard';
import { FolderKanban, Calendar, Activity, AlertTriangle } from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'manager'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/manager');
      return res.data.data;
    },
  });

  if (isLoading) return <LoadingSkeleton count={6} />;

  const {
    projects = [],
    tasksByPriority = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
    upcomingTasks = [],
    projectActivity = [],
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Header Stat Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Projects</span>
          <p className="text-2xl sm:text-3xl font-bold text-slate-100">{projects.length}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-2">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Critical Tasks</span>
          <p className="text-2xl sm:text-3xl font-bold text-rose-400">{tasksByPriority.CRITICAL || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-orange-500/30 bg-orange-950/10 space-y-2">
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">High Priority Tasks</span>
          <p className="text-2xl sm:text-3xl font-bold text-orange-300">{tasksByPriority.HIGH || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 bg-blue-950/10 space-y-2">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Upcoming Due</span>
          <p className="text-2xl sm:text-3xl font-bold text-blue-300">{upcomingTasks.length}</p>
        </div>
      </div>

      {/* Owned Projects Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FolderKanban className="w-4 h-4 text-brand-400" />
          <h3 className="font-semibold text-sm text-slate-200">Projects Managed by You</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <p className="text-xs text-slate-500 col-span-full py-4">No projects owned yet.</p>
          ) : (
            projects.map((proj: any) => (
              <div key={proj.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-semibold text-sm text-slate-100">{proj.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>
                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    Client: {proj.client?.name}
                  </span>
                  <span>{proj._count?.tasks || 0} Tasks</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Due Tasks & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="w-4 h-4 text-brand-400" />
            <h3 className="font-semibold text-sm text-slate-200">Upcoming Due Tasks</h3>
          </div>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No upcoming tasks</p>
            ) : (
              upcomingTasks.map((task: any) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-4 h-4 text-brand-400" />
            <h3 className="font-semibold text-sm text-slate-200">Project Activity Feed</h3>
          </div>
          <div className="space-y-2.5">
            {projectActivity.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent activity</p>
            ) : (
              projectActivity.map((act: any) => <ActivityFeedItem key={act.id} activity={act} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
