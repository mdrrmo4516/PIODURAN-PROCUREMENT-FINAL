import React from 'react';
import { cn } from '../../lib/utils';
import { Check, Ban, Edit, Printer, Trash2 } from 'lucide-react';

const ActionButton = ({ onClick, icon: Icon, colorClass, title }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-8 h-8 rounded-md flex items-center justify-center transition-transform duration-200 hover:scale-110",
      colorClass
    )}
    title={title}
  >
    <Icon className="w-4 h-4" />
  </button>
);

export const ActionButtons = ({ 
  purchase, 
  onApprove, 
  onDeny, 
  onEdit, 
  onPrint, 
  onDelete,
  showStatusActions = true 
}) => {
  const isPending = purchase.status === 'Pending';

  return (
    <div className="flex flex-wrap gap-1">
      {showStatusActions && isPending && (
        <>
          <ActionButton
            onClick={() => onApprove(purchase.id)}
            icon={Check}
            colorClass="bg-green-500/30 text-green-400 hover:bg-green-500/40"
            title="Approve"
          />
          <ActionButton
            onClick={() => onDeny(purchase.id)}
            icon={Ban}
            colorClass="bg-red-500/30 text-red-400 hover:bg-red-500/40"
            title="Deny"
          />
        </>
      )}
      <ActionButton
        onClick={() => onEdit(purchase)}
        icon={Edit}
        colorClass="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
        title="Edit"
      />
      <ActionButton
        onClick={() => onPrint(purchase)}
        icon={Printer}
        colorClass="bg-green-500/20 text-green-400 hover:bg-green-500/30"
        title="Print"
      />
      <ActionButton
        onClick={() => onDelete(purchase.id)}
        icon={Trash2}
        colorClass="bg-red-500/20 text-red-400 hover:bg-red-500/30"
        title="Delete"
      />
    </div>
  );
};
