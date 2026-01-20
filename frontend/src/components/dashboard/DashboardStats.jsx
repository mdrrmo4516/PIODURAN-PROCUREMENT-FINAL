import React from 'react';
import { StatCard } from './StatCard';
import { usePurchases } from '../../context/PurchaseContext';
import { formatCurrency } from '../../lib/storage';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Banknote 
} from 'lucide-react';

export const DashboardStats = () => {
  const { stats } = usePurchases();

  const statCards = [
    {
      icon: FileText,
      value: stats.total,
      label: 'Total Requests',
      colorClass: 'icon-blue'
    },
    {
      icon: CheckCircle,
      value: stats.approved,
      label: 'Approved',
      colorClass: 'icon-green'
    },
    {
      icon: Clock,
      value: stats.pending,
      label: 'Pending',
      colorClass: 'icon-orange'
    },
    {
      icon: XCircle,
      value: stats.denied,
      label: 'Denied',
      colorClass: 'icon-red'
    },
    {
      icon: Banknote,
      value: formatCurrency(stats.totalAmount).split('.')[0],
      label: 'Total Amount',
      colorClass: 'icon-purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
      {statCards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
};
