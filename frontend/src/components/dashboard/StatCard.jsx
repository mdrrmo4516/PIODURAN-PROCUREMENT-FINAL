import React from 'react';
import { cn } from '../../lib/utils';

export const StatCard = ({ icon: Icon, value, label, colorClass = 'icon-blue' }) => {
  return (
    <div className="gradient-card rounded-xl p-6 border border-border hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center text-foreground text-xl mb-4",
        colorClass
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
};
