import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const toastStyles = {
  success: 'gradient-btn-success',
  error: 'gradient-btn-danger',
  info: 'gradient-btn-info'
};

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info
};

export const Toast = ({ message, type = 'success', visible }) => {
  const Icon = toastIcons[type];

  if (!visible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-8 right-8 px-6 py-4 rounded-xl font-semibold z-[3000] flex items-center gap-3 text-foreground animate-slide-in-right",
        toastStyles[type]
      )}
    >
      <Icon className="w-5 h-5" />
      {message}
    </div>
  );
};
