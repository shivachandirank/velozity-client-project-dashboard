import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from './Modal';
import { Project } from '../types';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  project?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
}) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      clientId: project?.clientId || '',
    },
  });

  React.useEffect(() => {
    reset({
      name: project?.name || '',
      description: project?.description || '',
      clientId: project?.clientId || '',
    });
  }, [project, reset]);

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await apiClient.get('/clients');
      return res.data.data;
    },
    enabled: isOpen,
  });

  const handleFormSubmit = async (values: any) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'Create New Project'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
          <input
            {...register('name', { required: 'Project name is required' })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="e.g. Website Redesign"
          />
          {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name.message as string}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Client *</label>
          <select
            {...register('clientId', { required: 'Client is required' })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
          >
            <option value="">Select Client</option>
            {clients?.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.company})
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="text-rose-400 text-xs mt-1">{errors.clientId.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={4}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="High-level project scope and objectives"
          />
          {errors.description && (
            <p className="text-rose-400 text-xs mt-1">{errors.description.message as string}</p>
          )}
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
            {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
