import React from 'react';
import { Task, TaskStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Calendar, User, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  canEdit?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  canEdit = false,
}) => {
  const isOverdueNotDone = task.isOverdue && task.status !== 'DONE';

  return (
    <div
      className={`glass-panel p-4 rounded-xl space-y-3 transition-all border ${
        isOverdueNotDone ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-sm text-slate-100 line-clamp-2 leading-snug">{task.title}</h4>
        <div className="flex items-center gap-1 shrink-0">
          <PriorityBadge priority={task.priority} />
          {canEdit && (
            <div className="flex items-center ml-1 space-x-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>

      {task.project && (
        <div className="text-[11px] font-medium text-brand-400 bg-brand-950/40 px-2 py-0.5 rounded w-fit">
          {task.project.name}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          {onStatusChange ? (
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 focus:ring-1 focus:ring-brand-500 outline-none font-medium cursor-pointer"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          ) : (
            <StatusBadge status={task.status} />
          )}

          {isOverdueNotDone && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
              <AlertCircle className="w-3 h-3" />
              OVERDUE
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          {task.assignedDeveloper && (
            <div className="flex items-center gap-1" title={`Assigned to ${task.assignedDeveloper.name}`}>
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium text-slate-300 truncate max-w-[100px]">
                {task.assignedDeveloper.name}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
