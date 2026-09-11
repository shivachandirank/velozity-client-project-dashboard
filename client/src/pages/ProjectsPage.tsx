import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../hooks/useAuth';
import { Project } from '../types';
import { ProjectModal } from '../components/ProjectModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { FolderKanban, Plus, ArrowRight, User, Building2 } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await apiClient.get('/projects');
      return res.data.data as Project[];
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/projects', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiClient.patch(`/projects/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleCreateOrUpdate = async (values: any) => {
    if (selectedProject) {
      await updateProjectMutation.mutateAsync({ id: selectedProject.id, data: values });
    } else {
      await createProjectMutation.mutateAsync(values);
    }
  };

  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  if (isLoading) return <LoadingSkeleton count={6} />;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-brand-400" />
            <span>Projects</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'DEVELOPER'
              ? 'Projects containing your assigned tasks'
              : 'Manage client project deliverables and milestones'}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setSelectedProject(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/projects/${proj.id}`)}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base text-slate-100 group-hover:text-brand-300 transition-colors">
                    {proj.name}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{proj.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate font-medium text-slate-300">{proj.client?.name || 'No Client'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-brand-400 font-semibold text-[11px]">
                    {proj._count?.tasks || 0} Tasks
                  </span>
                </div>

                {proj.owner && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Owner: <strong className="text-slate-300 font-medium">{proj.owner.name}</strong></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Projects Found"
          description={
            canCreate
              ? 'Get started by creating your first client project.'
              : 'You have not been assigned tasks in any active projects.'
          }
          actionLabel={canCreate ? 'Create Project' : undefined}
          onAction={canCreate ? () => setIsModalOpen(true) : undefined}
        />
      )}

      {/* Project Creation / Edit Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        project={selectedProject}
      />
    </div>
  );
};
