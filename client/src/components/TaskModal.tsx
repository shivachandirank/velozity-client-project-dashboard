import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from './Modal';
import { Task, Priority, TaskStatus } from '../types';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  task?: Task | null;
  defaultProjectId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  defaultProjectId,
}) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      projectId: task?.projectId || defaultProjectId || '',
      assignedDeveloperId: task?.assignedDeveloperId || '',
      priority: task?.priority || 'MEDIUM',
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    },
  });

  React.useEffect(() => {
    reset({
      title: task?.title || '',
      description: task?.description || '',
      projectId: task?.projectId || defaultProjectId || '',
      assignedDeveloperId: task?.assignedDeveloperId || '',
      priority: task?.priority || 'MEDIUM',
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    });
  }, [task, defaultProjectId, reset]);

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await apiClient.get('/projects');
      return res.data.data;
    },
    enabled: isOpen,
  });

  const { data: developers } = useQuery({
    queryKey: ['developers'],
    queryFn: async () => {
      const res = await apiClient.get('/users?role=DEVELOPER');
      return res.data.data;
    },
    enabled: isOpen,
  });

  const handleFormSubmit = async (values: any) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Create New Task'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="Task title"
          />
          {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title.message as string}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="Detailed description of deliverables"
          />
          {errors.description && (
            <p className="text-rose-400 text-xs mt-1">{errors.description.message as string}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project *</label>
            <select
              {...register('projectId', { required: 'Project is required' })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
            >
              <option value="">Select Project</option>
              {projects?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="text-rose-400 text-xs mt-1">{errors.projectId.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Developer</label>
            <select
              {...register('assignedDeveloperId')}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
            >
              <option value="">Unassigned</option>
              {developers?.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
            <select
              {...register('priority')}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date *</label>
            <input
              type="date"
              {...register('dueDate', { required: 'Due date is required' })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
            />
            {errors.dueDate && (
              <p className="text-rose-400 text-xs mt-1">{errors.dueDate.message as string}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
