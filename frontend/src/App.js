import React, { useState, useRef } from 'react';
import { PurchaseProvider, usePurchases } from './context/PurchaseContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Toast } from './components/common/Toast';
import { PurchaseModal } from './components/modals/PurchaseModal';
import { PrintModal } from './components/modals/PrintModal';
import { Dashboard } from './pages/Dashboard';
import {
  AllPurchases,
  PurchaseRequests,
  PurchaseOrders,
  ObligationRequests,
  DisbursementVouchers,
  CanvassForms,
  AbstractOfCanvass,
  PropertyAcknowledgement,
  RequisitionIssueSlip,
  InspectionReport
} from './pages/Sections';
import { cn } from './lib/utils';

const AppContent = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [printPurchase, setPrintPurchase] = useState(null);
  const [printDocType, setPrintDocType] = useState('pr');
  
  const fileInputRef = useRef(null);
  
  const { 
    toast, 
    addPurchase, 
    updatePurchase, 
    handleExport, 
    handleImport,
    purchases 
  } = usePurchases();

  const handleNewPurchase = () => {
    setEditingPurchase(null);
    setPurchaseModalOpen(true);
  };

  const handleEditPurchase = (purchase) => {
    setEditingPurchase(purchase);
    setPurchaseModalOpen(true);
  };

  const handleSavePurchase = (purchaseData, editingId) => {
    if (editingId) {
      updatePurchase(editingId, purchaseData);
    } else {
      addPurchase(purchaseData);
    }
  };

  const handlePrintPurchase = (purchase, docType = 'pr') => {
    setPrintPurchase(purchase);
    setPrintDocType(docType);
    setPrintModalOpen(true);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        const shouldReplace = purchases.length > 0 && 
          window.confirm('Do you want to REPLACE existing data? Click Cancel to APPEND instead.');
        handleImport(text, shouldReplace);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const renderSection = () => {
    const sectionProps = {
      onEdit: handleEditPurchase,
      onPrint: handlePrintPurchase
    };

    switch (activeSection) {
      case 'dashboard':
        return <Dashboard {...sectionProps} />;
      case 'purchases':
        return <AllPurchases {...sectionProps} />;
      case 'pr':
        return <PurchaseRequests {...sectionProps} />;
      case 'po':
        return <PurchaseOrders {...sectionProps} />;
      case 'obr':
        return <ObligationRequests {...sectionProps} />;
      case 'dv':
        return <DisbursementVouchers {...sectionProps} />;
      case 'canvass':
        return <CanvassForms onPrint={handlePrintPurchase} />;
      case 'abstract':
        return <AbstractOfCanvass onPrint={handlePrintPurchase} />;
      case 'par':
        return <PropertyAcknowledgement onPrint={handlePrintPurchase} />;
      case 'ris':
        return <RequisitionIssueSlip onPrint={handlePrintPurchase} />;
      case 'air':
        return <InspectionReport onPrint={handlePrintPurchase} />;
      default:
        return <Dashboard {...sectionProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file input for CSV import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main 
        className={cn(
          "min-h-screen p-8 transition-all duration-300",
          sidebarCollapsed ? "ml-[70px]" : "ml-[280px]"
        )}
      >
        <Header
          activeSection={activeSection}
          onNewPurchase={handleNewPurchase}
          onExport={handleExport}
          onImportClick={handleImportClick}
        />
        
        {renderSection()}
      </main>

      {/* Modals */}
      <PurchaseModal
        open={purchaseModalOpen}
        onClose={() => {
          setPurchaseModalOpen(false);
          setEditingPurchase(null);
        }}
        onSave={handleSavePurchase}
        editingPurchase={editingPurchase}
      />

      <PrintModal
        open={printModalOpen}
        onClose={() => {
          setPrintModalOpen(false);
          setPrintPurchase(null);
        }}
        purchase={printPurchase}
        initialDocType={printDocType}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          visible={!!toast}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <PurchaseProvider>
      <AppContent />
    </PurchaseProvider>
  );
}

export default App;
