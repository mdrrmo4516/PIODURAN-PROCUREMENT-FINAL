import React, { useState, useRef } from 'react';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { DataTable } from '../components/tables/DataTable';
import { usePurchases } from '../context/PurchaseContext';
import { formatCurrency, formatDate } from '../lib/storage';

const dashboardColumns = [
  { key: 'prNo', label: 'PR No.' },
  { key: 'title', label: 'Title' },
  { key: 'department', label: 'Department' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'totalAmount', label: 'Amount', type: 'currency' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'actions', label: 'Actions', type: 'actions' }
];

export const Dashboard = ({ onEdit, onPrint }) => {
  const { purchases, updateStatus, deletePurchase } = usePurchases();

  // Show most recent first
  const recentPurchases = [...purchases].reverse();

  const handleApprove = (id) => updateStatus(id, 'Approved');
  const handleDeny = (id) => updateStatus(id, 'Denied');
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      deletePurchase(id);
    }
  };

  return (
    <div className="animate-fade-in">
      <DashboardStats />
      <DataTable
        title="Recent Purchases"
        columns={dashboardColumns}
        data={recentPurchases}
        onApprove={handleApprove}
        onDeny={handleDeny}
        onEdit={onEdit}
        onPrint={onPrint}
        onDelete={handleDelete}
      />
    </div>
  );
};
