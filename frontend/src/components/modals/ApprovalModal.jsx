import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { CheckCircle, XCircle, AlertCircle, User, MessageSquare } from 'lucide-react';

export const ApprovalModal = ({ open, onClose, purchase, onApprove, onDeny }) => {
  const [approverName, setApproverName] = useState('');
  const [comments, setComments] = useState('');
  const [action, setAction] = useState(null); // 'approve' or 'deny'

  const handleSubmit = () => {
    if (!approverName.trim()) {
      alert('Please enter your name');
      return;
    }

    const approvalData = {
      approvedBy: approverName.trim(),
      comments: comments.trim()
    };

    if (action === 'approve') {
      onApprove(purchase.id, approvalData);
    } else {
      onDeny(purchase.id, approvalData);
    }

    // Reset and close
    setApproverName('');
    setComments('');
    setAction(null);
    onClose();
  };

  const handleClose = () => {
    setApproverName('');
    setComments('');
    setAction(null);
    onClose();
  };

  if (!purchase) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-popover border-border">
        <DialogHeader className="gradient-btn-primary -m-6 mb-0 p-6 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Approval Decision
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review and make a decision for this purchase request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Purchase Summary */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">PR Number:</span>
              <span className="font-medium text-foreground">{purchase.prNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Title:</span>
              <span className="font-medium text-foreground">{purchase.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium text-foreground">₱{purchase.totalAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Status:</span>
              <span className={`font-medium px-2 py-0.5 rounded text-sm ${
                purchase.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                purchase.status === 'Approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {purchase.status}
              </span>
            </div>
          </div>

          {/* Approver Name */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> Your Name *
            </Label>
            <Input
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-foreground/5 border-border text-foreground"
            />
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Comments / Remarks
            </Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments or remarks..."
              rows={3}
              className="bg-foreground/5 border-border text-foreground resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => {
                setAction('approve');
                setTimeout(handleSubmit, 0);
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              disabled={!approverName.trim()}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => {
                setAction('deny');
                setTimeout(handleSubmit, 0);
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              disabled={!approverName.trim()}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Deny
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full border-muted-foreground/30"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
