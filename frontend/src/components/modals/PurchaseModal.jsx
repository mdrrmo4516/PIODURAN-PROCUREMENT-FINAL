import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Plus, Trash2, Save, X, Info, Store, List } from 'lucide-react';
import { cn } from '../../lib/utils';

const unitOptions = ['pc', 'unit', 'box', 'pack', 'set', 'roll', 'ream', 'gallon', 'liter', 'kg', 'meter', 'foot'];

const emptyItem = {
  name: '',
  description: '',
  unit: 'pc',
  quantity: 1,
  unitPrice: 0,
  total: 0
};

export const PurchaseModal = ({ open, onClose, onSave, editingPurchase }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    department: 'MDRRMO',
    purpose: '',
    status: 'Pending',
    supplier1: { name: '', address: '' },
    supplier2: { name: '', address: '' },
    supplier3: { name: '', address: '' },
    items: [{ ...emptyItem }]
  });

  const isEditing = !!editingPurchase;

  useEffect(() => {
    if (editingPurchase) {
      setFormData({
        title: editingPurchase.title || '',
        date: editingPurchase.date || new Date().toISOString().split('T')[0],
        department: editingPurchase.department || 'MDRRMO',
        purpose: editingPurchase.purpose || '',
        status: editingPurchase.status || 'Pending',
        supplier1: editingPurchase.supplier1 || { name: '', address: '' },
        supplier2: editingPurchase.supplier2 || { name: '', address: '' },
        supplier3: editingPurchase.supplier3 || { name: '', address: '' },
        items: editingPurchase.items?.length > 0 
          ? editingPurchase.items.map(item => ({ ...item }))
          : [{ ...emptyItem }]
      });
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        department: 'MDRRMO',
        purpose: '',
        status: 'Pending',
        supplier1: { name: '', address: '' },
        supplier2: { name: '', address: '' },
        supplier3: { name: '', address: '' },
        items: [{ ...emptyItem }]
      });
    }
  }, [editingPurchase, open]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSupplierChange = (supplierKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      [supplierKey]: { ...prev[supplierKey], [field]: value }
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(newItems[index].quantity) || 0;
      const price = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(newItems[index].unitPrice) || 0;
      newItems[index].total = qty * price;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...emptyItem }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const grandTotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a purchase title');
      return;
    }
    if (!formData.supplier1.name.trim()) {
      alert('Please enter at least one supplier');
      return;
    }
    const validItems = formData.items.filter(item => item.name.trim());
    if (validItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const purchaseData = {
      ...formData,
      items: validItems.map((item, index) => ({
        ...item,
        number: index + 1,
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
        total: parseFloat(item.total) || 0
      })),
      totalAmount: grandTotal
    };

    onSave(purchaseData, editingPurchase?.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-popover border-border custom-scrollbar">
        <DialogHeader className="gradient-btn-primary -m-6 mb-0 p-6 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            {isEditing ? (
              <>
                <span>✏️</span> Edit Purchase Request
              </>
            ) : (
              <>
                <span>➕</span> New Purchase Request
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-accent font-medium flex items-center gap-2 pb-2 border-b border-border">
              <Info className="w-4 h-4" /> Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Purchase Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter purchase title"
                  className="bg-foreground/5 border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="bg-foreground/5 border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger className="bg-foreground/5 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="MDRRMO">MDRRMO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Purpose/Remarks</Label>
                <Input
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  placeholder="Enter purpose"
                  className="bg-foreground/5 border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="bg-foreground/5 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Denied">Denied</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="space-y-4">
            <h4 className="text-accent font-medium flex items-center gap-2 pb-2 border-b border-border">
              <Store className="w-4 h-4" /> Supplier Information
            </h4>
            {[1, 2, 3].map((num) => (
              <div key={num} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Supplier {num} {num === 1 && '(Main) *'}
                  </Label>
                  <Input
                    value={formData[`supplier${num}`]?.name || ''}
                    onChange={(e) => handleSupplierChange(`supplier${num}`, 'name', e.target.value)}
                    placeholder="Store Name"
                    className="bg-foreground/5 border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Address</Label>
                  <Input
                    value={formData[`supplier${num}`]?.address || ''}
                    onChange={(e) => handleSupplierChange(`supplier${num}`, 'address', e.target.value)}
                    placeholder="Address"
                    className="bg-foreground/5 border-border text-foreground"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Items */}
          <div className="space-y-4">
            <h4 className="text-accent font-medium flex items-center gap-2 pb-2 border-b border-border">
              <List className="w-4 h-4" /> Items
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-accent font-medium w-8">#</th>
                    <th className="text-left py-2 text-accent font-medium">Item Name</th>
                    <th className="text-left py-2 text-accent font-medium">Description</th>
                    <th className="text-left py-2 text-accent font-medium w-24">Unit</th>
                    <th className="text-left py-2 text-accent font-medium w-20">Qty</th>
                    <th className="text-left py-2 text-accent font-medium w-28">Unit Price</th>
                    <th className="text-left py-2 text-accent font-medium w-28">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-2 text-muted-foreground">{index + 1}</td>
                      <td className="py-2">
                        <Input
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          placeholder="Item name"
                          className="bg-foreground/5 border-border text-foreground h-9"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="bg-foreground/5 border-border text-foreground h-9"
                        />
                      </td>
                      <td className="py-2">
                        <Select
                          value={item.unit}
                          onValueChange={(value) => handleItemChange(index, 'unit', value)}
                        >
                          <SelectTrigger className="bg-foreground/5 border-border text-foreground h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {unitOptions.map(unit => (
                              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="bg-foreground/5 border-border text-foreground h-9"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="bg-foreground/5 border-border text-foreground h-9"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          value={item.total.toFixed(2)}
                          readOnly
                          className="bg-foreground/10 border-border text-foreground h-9"
                        />
                      </td>
                      <td className="py-2">
                        {index > 0 && (
                          <button
                            onClick={() => removeItem(index)}
                            className="p-1 rounded bg-destructive/20 text-destructive hover:bg-destructive/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="6" className="text-right py-3 font-bold text-foreground">
                      GRAND TOTAL:
                    </td>
                    <td colSpan="2" className="py-3">
                      <Input
                        value={`₱${grandTotal.toFixed(2)}`}
                        readOnly
                        className="bg-foreground/10 border-border text-foreground font-bold h-9"
                      />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button
              onClick={addItem}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-green-500 text-green-400 rounded-lg hover:bg-green-500/10 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 pt-6 border-t border-border mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="gradient-btn-success hover:shadow-btn-success"
          >
            <Save className="w-4 h-4 mr-2" /> Save Purchase
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
