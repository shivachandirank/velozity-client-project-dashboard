import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { ActivityLog } from '../types';
import { ActivityFeedItem } from '../components/ActivityFeedItem';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Activity, RefreshCw } from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const { data: activityList, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['activity', 'recent'],
    queryFn: async () => {
      const res = await apiClient.get('/activity/recent?limit=30');
      return res.data.data as ActivityLog[];
    },
  });

  if (isLoading) return <LoadingSkeleton count={6} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-400" />
            <span>Activity Feed</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historical activity log audit trail fetched from PostgreSQL
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-slate-300 font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        {activityList && activityList.length > 0 ? (
          activityList.map((item) => <ActivityFeedItem key={item.id} activity={item} />)
        ) : (
          <p className="text-xs text-slate-500 text-center py-10">No recent activity recorded.</p>
        )}
      </div>
    </div>
  );
};
