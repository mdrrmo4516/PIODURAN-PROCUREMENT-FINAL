import React from 'react';
import { Button } from '../ui/button';
import { Plus, Download, Upload } from 'lucide-react';

const sectionTitles = {
  dashboard: { title: 'Dashboard', icon: '📊' },
  purchases: { title: 'All Purchases', icon: '🛒' },
  pr: { title: 'Purchase Requests', icon: '📄' },
  po: { title: 'Purchase Orders', icon: '📋' },
  obr: { title: 'Obligation Requests', icon: '📑' },
  dv: { title: 'Disbursement Vouchers', icon: '💰' },
  canvass: { title: 'Canvass Forms', icon: '⚖️' },
  abstract: { title: 'Abstract of Canvass', icon: '🏆' },
  par: { title: 'Property Acknowledgement Receipt', icon: '✅' },
  ris: { title: 'Requisition and Issue Slip', icon: '🔄' },
  air: { title: 'Acceptance & Inspection Report', icon: '🔍' }
};

export const Header = ({ 
  activeSection, 
  onNewPurchase, 
  onExport, 
  onImportClick,
  showActions = true 
}) => {
  const sectionInfo = sectionTitles[activeSection] || { title: 'Dashboard', icon: '📊' };

  return (
    <header className="flex flex-wrap justify-between items-center gap-4 pb-6 mb-8 border-b border-border">
      <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
        <span>{sectionInfo.icon}</span>
        {sectionInfo.title}
      </h2>
      
      {showActions && (activeSection === 'dashboard' || activeSection === 'purchases' || activeSection === 'pr') && (
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={onNewPurchase}
            className="gradient-btn-primary hover:shadow-btn-primary hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Purchase
          </Button>
          <Button 
            onClick={onExport}
            className="gradient-btn-success hover:shadow-btn-success hover:-translate-y-0.5 transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={onImportClick}
            className="gradient-btn-info hover:-translate-y-0.5 transition-all duration-200"
          >
            <Upload className="w-4 h-4 mr-2" />
            Load CSV
          </Button>
        </div>
      )}
    </header>
  );
};
