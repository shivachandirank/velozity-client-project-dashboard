import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from './Modal';
import { ClientEntity } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  client?: ClientEntity | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  client,
}) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      company: client?.company || '',
    },
  });

  React.useEffect(() => {
    reset({
      name: client?.name || '',
      email: client?.email || '',
      company: client?.company || '',
    });
  }, [client, reset]);

  const handleFormSubmit = async (values: any) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? 'Edit Client' : 'Create New Client'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Client Name *</label>
          <input
            {...register('name', { required: 'Client name is required' })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="e.g. Acme Corporation"
          />
          {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name.message as string}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
          <input
            {...register('company', { required: 'Company is required' })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="e.g. Acme Inc."
          />
          {errors.company && (
            <p className="text-rose-400 text-xs mt-1">{errors.company.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email *</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="contact@acme.com"
          />
          {errors.email && (
            <p className="text-rose-400 text-xs mt-1">{errors.email.message as string}</p>
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
            {isSubmitting ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
