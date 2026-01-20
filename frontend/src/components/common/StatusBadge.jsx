import React from 'react';
import { cn } from '../../lib/utils';

const statusStyles = {
  Pending: 'bg-warning/20 text-yellow-400',
  Approved: 'bg-green-500/20 text-green-400',
  Denied: 'bg-destructive/20 text-red-400',
  Completed: 'bg-accent/20 text-accent'
};

export const StatusBadge = ({ status }) => {
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
      statusStyles[status] || statusStyles.Pending
    )}>
      {status}
    </span>
  );
};
