import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { ClientEntity } from '../types';
import { ClientModal } from '../components/ClientModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Building2, Plus, Mail, FolderKanban } from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientEntity | null>(null);

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await apiClient.get('/clients');
      return res.data.data as ClientEntity[];
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/clients', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const handleCreateClient = async (values: any) => {
    await createClientMutation.mutateAsync(values);
  };

  if (isLoading) return <LoadingSkeleton count={4} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-400" />
            <span>Clients</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage external organization client accounts</p>
        </div>

        <button
          onClick={() => {
            setSelectedClient(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {clients && clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div key={c.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-950/60 border border-brand-500/30 text-brand-400 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-100">{c.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{c.company}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c._count?.projects || 0} Active Projects</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Clients Registered"
          description="Register your first client organization to link projects."
          actionLabel="Add Client"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateClient}
        client={selectedClient}
      />
    </div>
  );
};
