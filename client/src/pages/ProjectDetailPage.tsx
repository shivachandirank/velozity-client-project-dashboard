import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../hooks/useAuth';
import { Project, Task, TaskStatus } from '../types';
import { joinProjectRoom, leaveProjectRoom } from '../services/socketService';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ArrowLeft, Plus, Building2, User, CheckSquare } from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Real-time WebSocket room joining
  useEffect(() => {
    if (id) {
      joinProjectRoom(id);
      return () => leaveProjectRoom(id);
    }
  }, [id]);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await apiClient.get(`/projects/${id}`);
      return res.data.data as Project;
    },
    enabled: Boolean(id),
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/tasks', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const res = await apiClient.patch(`/tasks/${taskId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  if (isLoading) return <LoadingSkeleton count={4} />;

  if (error || !project) {
    return (
      <div className="glass-panel p-8 rounded-xl text-center space-y-4 my-8">
        <h3 className="text-lg font-bold text-rose-400">Access Denied or Project Not Found</h3>
        <p className="text-xs text-slate-400">
          You do not have permission to view this project, or it has been removed.
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const canManageTasks = user?.role === 'ADMIN' || (user?.role === 'PROJECT_MANAGER' && project.ownerId === user?.id);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  const handleCreateTask = async (values: any) => {
    await createTaskMutation.mutateAsync({ ...values, projectId: id });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100">{project.name}</h2>
          <p className="text-xs text-slate-400">{project.description}</p>
        </div>
      </div>

      {/* Project Meta Info Banner */}
      <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-6 text-slate-300">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-400" />
            <span>Client: <strong className="text-slate-100 font-semibold">{project.client?.name}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Owner: <strong className="text-slate-100 font-semibold">{project.owner?.name}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Tasks: <strong className="text-slate-100 font-semibold">{project.tasks?.length || 0}</strong></span>
          </div>
        </div>

        {canManageTasks && (
          <button
            onClick={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-slate-200">Project Tasks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.tasks && project.tasks.length > 0 ? (
            project.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={canManageTasks ? (taskId) => deleteTaskMutation.mutate(taskId) : undefined}
                canEdit={canManageTasks}
              />
            ))
          ) : (
            <p className="text-xs text-slate-500 col-span-full py-8 text-center">No tasks in this project yet.</p>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        defaultProjectId={id}
      />
    </div>
  );
};
