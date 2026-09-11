import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { User } from '../types';
import { RoleBadge } from '../components/RoleBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Users, Mail, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const UsersPage: React.FC = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.get('/users');
      return res.data.data as User[];
    },
  });

  if (isLoading) return <LoadingSkeleton count={6} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-400" />
          <span>Team Directory</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Registered system users, role assignments, and online activity status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users?.map((u) => (
          <div key={u.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                {u.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-slate-100 truncate">{u.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{u.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <RoleBadge role={u.role} />
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3 h-3 text-slate-600" />
                <span>
                  {u.lastSeenAt
                    ? `Seen ${formatDistanceToNow(new Date(u.lastSeenAt), { addSuffix: true })}`
                    : 'Active'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
