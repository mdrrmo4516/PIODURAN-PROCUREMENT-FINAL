import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSamplePurchase,
  exportToCSV,
  parseCSV
} from '../lib/storage';
import { mergePurchasesOverwriteById } from '../lib/csvPurchaseMerge';
import * as DB from '../services/indexedDbPurchases';

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

  // Initialize purchases from IndexedDB (offline-first)
  useEffect(() => {
    const initializePurchases = async () => {
      setLoading(true);
      try {
        await DB.ensureInitialized(getSamplePurchase);
        const all = await DB.listPurchases();
        console.log('[PurchaseContext] Loaded from IndexedDB:', all.length, 'purchases');
        setPurchases(all);
      } catch (error) {
        console.error('[PurchaseContext] IndexedDB init/load failed:', error);
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    initializePurchases();
  }, []);

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Add new purchase (IndexedDB)
  const addPurchase = useCallback(async (purchaseData) => {
    try {
      const created = await DB.createPurchase(purchaseData);
      const all = await DB.listPurchases();
      setPurchases(all);
      showToast('Purchase saved successfully!', 'success');
      return created;
    } catch (error) {
      showToast(error?.message || 'Failed to create purchase', 'error');
      return null;
    }
  }, [showToast]);

  // Update existing purchase (IndexedDB)
  const updatePurchase = useCallback(async (id, purchaseData) => {
    try {
      const updated = await DB.updatePurchase(id, purchaseData);
      setPurchases(prev => prev.map(p => p.id === id ? updated : p));
      showToast('Purchase updated successfully!', 'success');
    } catch (error) {
      showToast(error?.message || 'Failed to update purchase', 'error');
    }
  }, [showToast]);

  // Delete purchase (IndexedDB)
  const deletePurchase = useCallback(async (id) => {
    try {
      await DB.deletePurchase(id);
      setPurchases(prev => prev.filter(p => p.id !== id));
      showToast('Purchase deleted successfully!', 'info');
    } catch (error) {
      showToast(error?.message || 'Failed to delete purchase', 'error');
    }
  }, [showToast]);

  // Update status (IndexedDB)
  const updateStatus = useCallback(async (id, newStatus) => {
    try {
      const updated = await DB.updatePurchaseStatus(id, newStatus);
      setPurchases(prev => prev.map(p => p.id === id ? updated : p));
      const toastType = newStatus === 'Approved' ? 'success' : newStatus === 'Denied' ? 'error' : 'info';
      showToast(`Status updated to ${newStatus}!`, toastType);
    } catch (error) {
      showToast(error?.message || 'Failed to update status', 'error');
    }
  }, [showToast]);

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

  // Import from CSV (IndexedDB)
  // Requirement: if imported CSV contains an ID that already exists, OVERWRITE existing record.
  const handleImport = useCallback(async (text, replace = false) => {
    try {
      const imported = parseCSV(text, purchases);

      if (imported.length === 0) {
        showToast('No valid data found in CSV!', 'error');
        return false;
      }

      let next;
      if (replace) {
        // Full replace: treat imported as the new dataset
        next = imported;
      } else {
        // Append/merge but overwrite duplicates by id
        next = mergePurchasesOverwriteById(purchases, imported);
      }

      await DB.upsertManyPurchases(next);
      const all = await DB.listPurchases();
      setPurchases(all);

      showToast(`Loaded ${imported.length} records from CSV!`, 'success');
      return true;
    } catch (error) {
      showToast(error?.message || 'Failed to import CSV', 'error');
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
