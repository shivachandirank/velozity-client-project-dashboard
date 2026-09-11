import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { TaskCard } from '../components/TaskCard';
import { ActivityFeedItem } from '../components/ActivityFeedItem';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { TaskStatus } from '../types';
import { CheckSquare, AlertCircle, Clock, Activity } from 'lucide-react';

export const DeveloperDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'developer'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/developer');
      return res.data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const res = await apiClient.patch(`/tasks/${taskId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });

  if (isLoading) return <LoadingSkeleton count={6} />;

  const {
    totalAssignedTasks = 0,
    overdueTasksCount = 0,
    tasksByStatus = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] },
    taskActivity = [],
  } = data || {};

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Assigned Tasks</span>
          <p className="text-2xl sm:text-3xl font-bold text-slate-100">{totalAssignedTasks}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-1">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Overdue Tasks</span>
          <p className="text-2xl sm:text-3xl font-bold text-rose-400">{overdueTasksCount}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-1">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">In Review</span>
          <p className="text-2xl sm:text-3xl font-bold text-amber-300">
            {tasksByStatus.IN_REVIEW?.length || 0}
          </p>
        </div>
      </div>

      {/* Task Status Lanes (Kanban View) */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-slate-200">Tasks Grouped by Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* TODO Lane */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300">To Do</span>
              <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded-full font-medium">
                {tasksByStatus.TODO?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {tasksByStatus.TODO?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No tasks to do</p>
              ) : (
                tasksByStatus.TODO?.map((t: any) => (
                  <TaskCard key={t.id} task={t} onStatusChange={handleStatusChange} />
                ))
              )}
            </div>
          </div>

          {/* IN_PROGRESS Lane */}
          <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 bg-blue-950/10 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-blue-400">In Progress</span>
              <span className="px-2 py-0.5 text-xs bg-blue-900/60 text-blue-300 rounded-full font-medium">
                {tasksByStatus.IN_PROGRESS?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {tasksByStatus.IN_PROGRESS?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No tasks in progress</p>
              ) : (
                tasksByStatus.IN_PROGRESS?.map((t: any) => (
                  <TaskCard key={t.id} task={t} onStatusChange={handleStatusChange} />
                ))
              )}
            </div>
          </div>

          {/* IN_REVIEW Lane */}
          <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 bg-amber-950/10 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400">In Review</span>
              <span className="px-2 py-0.5 text-xs bg-amber-900/60 text-amber-300 rounded-full font-medium">
                {tasksByStatus.IN_REVIEW?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {tasksByStatus.IN_REVIEW?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No tasks in review</p>
              ) : (
                tasksByStatus.IN_REVIEW?.map((t: any) => (
                  <TaskCard key={t.id} task={t} onStatusChange={handleStatusChange} />
                ))
              )}
            </div>
          </div>

          {/* DONE Lane */}
          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400">Done</span>
              <span className="px-2 py-0.5 text-xs bg-emerald-900/60 text-emerald-300 rounded-full font-medium">
                {tasksByStatus.DONE?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {tasksByStatus.DONE?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No completed tasks</p>
              ) : (
                tasksByStatus.DONE?.map((t: any) => (
                  <TaskCard key={t.id} task={t} onStatusChange={handleStatusChange} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Developer Activity Feed */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Activity className="w-4 h-4 text-brand-400" />
          <h3 className="font-semibold text-sm text-slate-200">Your Task Activity</h3>
        </div>
        <div className="space-y-2.5">
          {taskActivity.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No task activity logged</p>
          ) : (
            taskActivity.map((act: any) => <ActivityFeedItem key={act.id} activity={act} />)
          )}
        </div>
      </div>
    </div>
  );
};
