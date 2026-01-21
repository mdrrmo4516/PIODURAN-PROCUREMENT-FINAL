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
    <header className="flex flex-wrap justify-between items-center gap-4 pb-6 mb-8 border-b-2 border-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 relative">
      {/* Animated Title */}
      <div className="relative">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 animate-slide-down">
          <span className="text-4xl animate-bounce-gentle">{sectionInfo.icon}</span>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {sectionInfo.title}
          </span>
        </h2>
        {/* Decorative underline */}
        <div className="absolute -bottom-2 left-0 h-1 w-24 bg-gradient-to-r from-primary to-accent rounded-full" />
      </div>
      
      {showActions && (activeSection === 'dashboard' || activeSection === 'purchases' || activeSection === 'pr') && (
        <div className="flex flex-wrap gap-3 animate-slide-in-right">
          <Button 
            onClick={onNewPurchase}
            className="gradient-btn-primary hover:shadow-btn-primary hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-semibold shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Purchase
          </Button>
          <Button 
            onClick={onExport}
            className="gradient-btn-success hover:shadow-btn-success hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-semibold shadow-md"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={onImportClick}
            className="gradient-btn-info hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-semibold shadow-md"
          >
            <Upload className="w-4 h-4 mr-2" />
            Load CSV
          </Button>
        </div>
      )}
      
      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </header>
  );
};
