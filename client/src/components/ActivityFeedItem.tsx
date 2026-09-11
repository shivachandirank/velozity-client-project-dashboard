import React from 'react';
import { ActivityLog } from '../types';
import { Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ActivityFeedItem: React.FC<{ activity: ActivityLog }> = ({ activity }) => {
  return (
    <div className="flex items-start gap-3 p-3.5 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl border border-slate-800/80 transition-all">
      <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg shrink-0">
        <Activity className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-200 leading-snug font-medium break-words">
          {activity.description}
        </p>
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">{activity.user?.name || 'System'}</span>
          {activity.project && (
            <>
              <span>•</span>
              <span className="text-brand-400 font-medium">{activity.project.name}</span>
            </>
          )}
          <span>•</span>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
