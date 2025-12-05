import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-lg p-6 shadow-sm flex items-center justify-between transition-all hover:border-dashboard-muted/50">
      <div>
        <p className="text-dashboard-muted text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-dashboard-text mt-2 font-mono">
          {new Intl.NumberFormat('en-US').format(value)}
        </h3>
      </div>
      <div className={`p-4 rounded-full bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
        <Icon className={`w-8 h-8 ${colorClass}`} />
      </div>
    </div>
  );
};