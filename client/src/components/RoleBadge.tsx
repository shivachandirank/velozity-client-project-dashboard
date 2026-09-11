import React from 'react';
import { Role } from '../types';
import { ShieldCheck, UserCheck, Code2 } from 'lucide-react';

const roleConfig: Record<Role, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  ADMIN: { label: 'Admin', bg: 'bg-purple-950/60 border border-purple-500/30', text: 'text-purple-300', icon: ShieldCheck },
  PROJECT_MANAGER: { label: 'Project Manager', bg: 'bg-indigo-950/60 border border-indigo-500/30', text: 'text-indigo-300', icon: UserCheck },
  DEVELOPER: { label: 'Developer', bg: 'bg-teal-950/60 border border-teal-500/30', text: 'text-teal-300', icon: Code2 },
};

export const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const config = roleConfig[role] || roleConfig.DEVELOPER;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};
