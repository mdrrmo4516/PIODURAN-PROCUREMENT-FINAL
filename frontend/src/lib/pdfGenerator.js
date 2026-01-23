import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generatePurchaseRequestPDF = (purchase) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Republic of the Philippines', pageWidth / 2, 15, { align: 'center' });
  doc.text('Province of [Province Name]', pageWidth / 2, 20, { align: 'center' });
  doc.text('Municipality of [Municipality Name]', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PURCHASE REQUEST', pageWidth / 2, 35, { align: 'center' });
  
  // PR Number and Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`PR No: ${purchase.prNo}`, 15, 45);
  doc.text(`Date: ${formatDate(purchase.date)}`, pageWidth - 15, 45, { align: 'right' });
  
  // Department and Purpose
  doc.text(`Department: ${purchase.department}`, 15, 52);
  doc.text(`Purpose: ${purchase.purpose || 'N/A'}`, 15, 59);
  
  // Items Table
  const tableData = purchase.items.map((item, index) => [
    index + 1,
    item.name,
    item.description || '',
    item.unit,
    item.quantity,
    formatCurrency(item.unitPrice),
    formatCurrency(item.total)
  ]);
  
  doc.autoTable({
    startY: 65,
    head: [['#', 'Item Name', 'Description', 'Unit', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    foot: [['', '', '', '', '', 'TOTAL:', formatCurrency(purchase.totalAmount)]],
    theme: 'grid',
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: 0,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 10 },
      4: { halign: 'center' },
      5: { halign: 'right' },
      6: { halign: 'right' }
    }
  });
  
  // Supplier Information
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Supplier Information:', 15, finalY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (purchase.supplier1?.name) {
    doc.text(`1. ${purchase.supplier1.name} - ${purchase.supplier1.address || 'N/A'}`, 20, finalY + 7);
  }
  if (purchase.supplier2?.name) {
    doc.text(`2. ${purchase.supplier2.name} - ${purchase.supplier2.address || 'N/A'}`, 20, finalY + 14);
  }
  if (purchase.supplier3?.name) {
    doc.text(`3. ${purchase.supplier3.name} - ${purchase.supplier3.address || 'N/A'}`, 20, finalY + 21);
  }
  
  // Signature Section
  const sigY = finalY + 40;
  doc.setFontSize(10);
  
  // Requested By
  doc.text('Requested By:', 30, sigY);
  doc.line(25, sigY + 15, 75, sigY + 15);
  doc.text('Signature over Printed Name', 30, sigY + 20);
  doc.text('Date: ____________', 30, sigY + 27);
  
  // Approved By
  doc.text('Approved By:', pageWidth - 70, sigY);
  doc.line(pageWidth - 75, sigY + 15, pageWidth - 25, sigY + 15);
  doc.text('Signature over Printed Name', pageWidth - 70, sigY + 20);
  doc.text('Date: ____________', pageWidth - 70, sigY + 27);
  
  // Status Badge
  if (purchase.status) {
    const statusColors = {
      'Pending': [255, 193, 7],
      'Approved': [40, 167, 69],
      'Denied': [220, 53, 69],
      'Completed': [23, 162, 184]
    };
    const color = statusColors[purchase.status] || [108, 117, 125];
    
    doc.setFillColor(...color);
    doc.roundedRect(pageWidth - 45, 10, 35, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(purchase.status.toUpperCase(), pageWidth - 27.5, 15.5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  
  return doc;
};

export const generatePurchaseOrderPDF = (purchase) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Header
  doc.setFontSize(10);
  doc.text('Republic of the Philippines', pageWidth / 2, 15, { align: 'center' });
  doc.text('Province of [Province Name]', pageWidth / 2, 20, { align: 'center' });
  doc.text('Municipality of [Municipality Name]', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PURCHASE ORDER', pageWidth / 2, 35, { align: 'center' });
  
  // PO Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`PO No: ${purchase.poNo}`, 15, 45);
  doc.text(`PR No: ${purchase.prNo}`, 15, 52);
  doc.text(`Date: ${formatDate(purchase.date)}`, pageWidth - 15, 45, { align: 'right' });
  
  // Supplier
  doc.setFont('helvetica', 'bold');
  doc.text('Supplier:', 15, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(purchase.supplier1?.name || 'N/A', 40, 62);
  doc.text(`Address: ${purchase.supplier1?.address || 'N/A'}`, 15, 69);
  
  // Items Table
  const tableData = purchase.items.map((item, index) => [
    index + 1,
    item.name,
    item.description || '',
    item.unit,
    item.quantity,
    formatCurrency(item.unitPrice),
    formatCurrency(item.total)
  ]);
  
  doc.autoTable({
    startY: 75,
    head: [['#', 'Item', 'Description', 'Unit', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    foot: [['', '', '', '', '', 'TOTAL:', formatCurrency(purchase.totalAmount)]],
    theme: 'grid',
    headStyles: {
      fillColor: [40, 167, 69],
      textColor: 255,
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: 0,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });
  
  // Terms
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.text('Terms and Conditions:', 15, finalY);
  doc.text('1. Delivery within 15 days from receipt of PO', 20, finalY + 6);
  doc.text('2. Subject to inspection and acceptance', 20, finalY + 12);
  doc.text('3. Payment terms: Upon complete delivery', 20, finalY + 18);
  
  // Signatures
  const sigY = finalY + 35;
  doc.text('Conforme:', 30, sigY);
  doc.line(25, sigY + 15, 75, sigY + 15);
  doc.text('Supplier Representative', 30, sigY + 20);
  
  doc.text('Approved By:', pageWidth - 70, sigY);
  doc.line(pageWidth - 75, sigY + 15, pageWidth - 25, sigY + 15);
  doc.text('Authorized Official', pageWidth - 70, sigY + 20);
  
  return doc;
};

export const downloadPDF = (doc, filename) => {
  doc.save(filename);
};

export const printPDF = (doc) => {
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};
