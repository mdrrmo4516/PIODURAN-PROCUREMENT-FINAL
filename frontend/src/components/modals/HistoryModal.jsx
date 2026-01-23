import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { History, CheckCircle, XCircle, Edit, Plus, Paperclip, Trash2, Clock } from 'lucide-react';
import { formatDate } from '../../lib/storage';

const getActionIcon = (action) => {
  switch (action) {
    case 'created': return <Plus className="w-4 h-4 text-blue-500" />;
    case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'denied': return <XCircle className="w-4 h-4 text-red-500" />;
    case 'updated': return <Edit className="w-4 h-4 text-yellow-500" />;
    case 'status_changed': return <Clock className="w-4 h-4 text-purple-500" />;
    case 'attachment_added': return <Paperclip className="w-4 h-4 text-cyan-500" />;
    case 'attachment_removed': return <Trash2 className="w-4 h-4 text-orange-500" />;
    default: return <History className="w-4 h-4 text-gray-500" />;
  }
};

const getActionColor = (action) => {
  switch (action) {
    case 'created': return 'bg-blue-100 border-blue-300';
    case 'approved': return 'bg-green-100 border-green-300';
    case 'denied': return 'bg-red-100 border-red-300';
    case 'updated': return 'bg-yellow-100 border-yellow-300';
    case 'status_changed': return 'bg-purple-100 border-purple-300';
    case 'attachment_added': return 'bg-cyan-100 border-cyan-300';
    case 'attachment_removed': return 'bg-orange-100 border-orange-300';
    default: return 'bg-gray-100 border-gray-300';
  }
};

const formatActionLabel = (action) => {
  switch (action) {
    case 'created': return 'Created';
    case 'approved': return 'Approved';
    case 'denied': return 'Denied';
    case 'updated': return 'Updated';
    case 'status_changed': return 'Status Changed';
    case 'attachment_added': return 'Attachment Added';
    case 'attachment_removed': return 'Attachment Removed';
    default: return action;
  }
};

export const HistoryModal = ({ open, onClose, purchase }) => {
  if (!purchase) return null;

  const history = purchase.auditTrail || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-popover border-border">
        <DialogHeader className="gradient-btn-primary -m-6 mb-0 p-6 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <History className="w-5 h-5" />
            Audit History
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {purchase.prNo} - {purchase.title}
          </p>
        </DialogHeader>

        <div className="pt-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No history available</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-accent/50" />
                
                <div className="space-y-4">
                  {[...history].reverse().map((entry, index) => (
                    <div key={index} className="relative flex gap-4 pl-4">
                      {/* Timeline dot */}
                      <div className={`relative z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center ${getActionColor(entry.action)}`}>
                        {getActionIcon(entry.action)}
                      </div>
                      
                      {/* Content */}
                      <div className={`flex-1 rounded-lg border p-4 ${getActionColor(entry.action)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">
                            {formatActionLabel(entry.action)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-foreground/80 mb-2">
                          {entry.details}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>By: {entry.user}</span>
                          {entry.previousValue && entry.newValue && (
                            <span className="ml-2">
                              ({entry.previousValue} → {entry.newValue})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
