import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredPurchases,
  savePurchases,
  generateId,
  getSamplePurchase,
  exportToCSV,
  parseCSV
} from '../lib/storage';

const PurchaseContext = createContext(null);

export const usePurchases = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchases must be used within a PurchaseProvider');
  }
  return context;
};

export const PurchaseProvider = ({ children }) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Initialize purchases from localStorage
  useEffect(() => {
    const stored = getStoredPurchases();
    if (stored.length === 0) {
      // Add sample data
      const sample = getSamplePurchase([]);
      setPurchases([sample]);
      savePurchases([sample]);
    } else {
      setPurchases(stored);
    }
    setLoading(false);
  }, []);

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Add new purchase
  const addPurchase = useCallback((purchaseData) => {
    const newPurchase = {
      id: generateId('PF', purchases),
      prNo: generateId('PR', purchases),
      poNo: generateId('PO', purchases),
      obrNo: generateId('OBR', purchases),
      dvNo: generateId('DV', purchases),
      ...purchaseData,
      createdAt: new Date().toISOString()
    };

    const updated = [...purchases, newPurchase];
    setPurchases(updated);
    savePurchases(updated);
    showToast('Purchase saved successfully!', 'success');
    return newPurchase;
  }, [purchases, showToast]);

  // Update existing purchase
  const updatePurchase = useCallback((id, purchaseData) => {
    const updated = purchases.map(p => 
      p.id === id 
        ? { ...p, ...purchaseData, updatedAt: new Date().toISOString() }
        : p
    );
    setPurchases(updated);
    savePurchases(updated);
    showToast('Purchase updated successfully!', 'success');
  }, [purchases, showToast]);

  // Delete purchase
  const deletePurchase = useCallback((id) => {
    const updated = purchases.filter(p => p.id !== id);
    setPurchases(updated);
    savePurchases(updated);
    showToast('Purchase deleted successfully!', 'info');
  }, [purchases, showToast]);

  // Update status
  const updateStatus = useCallback((id, newStatus) => {
    const updated = purchases.map(p =>
      p.id === id
        ? { ...p, status: newStatus, updatedAt: new Date().toISOString() }
        : p
    );
    setPurchases(updated);
    savePurchases(updated);
    const toastType = newStatus === 'Approved' ? 'success' : newStatus === 'Denied' ? 'error' : 'info';
    showToast(`Status updated to ${newStatus}!`, toastType);
  }, [purchases, showToast]);

  // Export to CSV
  const handleExport = useCallback(() => {
    const csvContent = exportToCSV(purchases);
    if (!csvContent) {
      showToast('No data to export!', 'error');
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `procurement_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV exported successfully!', 'success');
  }, [purchases, showToast]);

  // Import from CSV
  const handleImport = useCallback((text, replace = false) => {
    const newPurchases = parseCSV(text, purchases);
    
    if (newPurchases.length > 0) {
      const updated = replace ? newPurchases : [...purchases, ...newPurchases];
      setPurchases(updated);
      savePurchases(updated);
      showToast(`Loaded ${newPurchases.length} records from CSV!`, 'success');
      return true;
    } else {
      showToast('No valid data found in CSV!', 'error');
      return false;
    }
  }, [purchases, showToast]);

  // Get purchase by ID
  const getPurchaseById = useCallback((id) => {
    return purchases.find(p => p.id === id);
  }, [purchases]);

  // Dashboard stats
  const stats = {
    total: purchases.length,
    approved: purchases.filter(p => p.status === 'Approved').length,
    pending: purchases.filter(p => p.status === 'Pending').length,
    denied: purchases.filter(p => p.status === 'Denied').length,
    completed: purchases.filter(p => p.status === 'Completed').length,
    totalAmount: purchases.filter(p => p.status !== 'Denied').reduce((sum, p) => sum + p.totalAmount, 0)
  };

  const value = {
    purchases,
    loading,
    toast,
    stats,
    addPurchase,
    updatePurchase,
    deletePurchase,
    updateStatus,
    handleExport,
    handleImport,
    getPurchaseById,
    showToast
  };

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  );
};
