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
      colorClass: 'icon-blue',
      delay: '0s'
    },
    {
      icon: CheckCircle,
      value: stats.approved,
      label: 'Approved',
      colorClass: 'icon-green',
      delay: '0.1s'
    },
    {
      icon: Clock,
      value: stats.pending,
      label: 'Pending',
      colorClass: 'icon-orange',
      delay: '0.2s'
    },
    {
      icon: XCircle,
      value: stats.denied,
      label: 'Denied',
      colorClass: 'icon-red',
      delay: '0.3s'
    },
    {
      icon: Banknote,
      value: formatCurrency(stats.totalAmount).split('.')[0],
      label: 'Total Amount',
      colorClass: 'icon-purple',
      delay: '0.4s'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div 
          key={index}
          style={{ 
            animationDelay: card.delay,
            animationFillMode: 'both'
          }}
        >
          <StatCard {...card} />
        </div>
      ))}
    </div>
  );
};
