import React from 'react';
import { DataTable } from '../components/tables/DataTable';
import { usePurchases } from '../context/PurchaseContext';

export const AllPurchases = ({ onEdit, onPrint }) => {
  const { purchases, updateStatus, deletePurchase } = usePurchases();

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'prNo', label: 'PR No.' },
    { key: 'poNo', label: 'PO No.' },
    { key: 'title', label: 'Title' },
    { key: 'supplier1.name', label: 'Supplier' },
    { key: 'totalAmount', label: 'Amount', type: 'currency' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  // Transform data to flatten supplier name
  const transformedData = purchases.map(p => ({
    ...p,
    'supplier1.name': p.supplier1?.name || '-'
  }));

  const handleApprove = (id) => updateStatus(id, 'Approved');
  const handleDeny = (id) => updateStatus(id, 'Denied');
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      deletePurchase(id);
    }
  };

  return (
    <div className="animate-fade-in">
      <DataTable
        columns={columns}
        data={transformedData}
        onApprove={handleApprove}
        onDeny={handleDeny}
        onEdit={onEdit}
        onPrint={onPrint}
        onDelete={handleDelete}
      />
    </div>
  );
};

export const PurchaseRequests = ({ onEdit, onPrint }) => {
  const { purchases, updateStatus, deletePurchase } = usePurchases();

  const columns = [
    { key: 'prNo', label: 'PR No.' },
    { key: 'title', label: 'Title' },
    { key: 'department', label: 'Department' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'totalAmount', label: 'Amount', type: 'currency' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  const handleApprove = (id) => updateStatus(id, 'Approved');
  const handleDeny = (id) => updateStatus(id, 'Denied');
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      deletePurchase(id);
    }
  };

  return (
    <div className="animate-fade-in">
      <DataTable
        columns={columns}
        data={purchases}
        onApprove={handleApprove}
        onDeny={handleDeny}
        onEdit={onEdit}
        onPrint={onPrint}
        onDelete={handleDelete}
      />
    </div>
  );
};

export const PurchaseOrders = ({ onEdit, onPrint }) => {
  const { purchases, deletePurchase } = usePurchases();

  const columns = [
    { key: 'poNo', label: 'PO No.' },
    { key: 'prNo', label: 'PR No.' },
    { key: 'supplier1.name', label: 'Supplier' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'totalAmount', label: 'Amount', type: 'currency' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  const filteredData = purchases
    .filter(p => p.status === 'Approved' || p.status === 'Completed')
    .map(p => ({
      ...p,
      'supplier1.name': p.supplier1?.name || '-'
    }));

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      deletePurchase(id);
    }
  };

  return (
    <div className="animate-fade-in">
      <DataTable
        columns={columns}
        data={filteredData}
        onEdit={onEdit}
        onPrint={(purchase) => onPrint(purchase, 'po')}
        onDelete={handleDelete}
        showStatusActions={false}
      />
    </div>
  );
};

export const ObligationRequests = ({ onEdit, onPrint }) => {
  const { purchases, deletePurchase } = usePurchases();

  const columns = [
    { key: 'obrNo', label: 'OBR No.' },
    { key: 'supplier1.name', label: 'Payee' },
    { key: 'department', label: 'Office' },
    { key: 'accountCode', label: 'Account Code' },
    { key: 'totalAmount', label: 'Amount', type: 'currency' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  const filteredData = purchases
    .filter(p => p.status === 'Approved' || p.status === 'Completed')
    .map(p => ({
      ...p,
      'supplier1.name': p.supplier1?.name || '-',
      accountCode: '5-02-05-010'
    }));

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      deletePurchase(id);
    }
  };

  return (
    <div className="animate-fade-in">
      <DataTable
        columns={columns}
        data={filteredData}
        onEdit={onEdit}
        onPrint={(purchase) => onPrint(purchase, 'obr')}
        onDelete={handleDelete}
        showStatusActions={false}
      />
    </div>
  );
};

export const DisbursementVouchers = ({ onEdit, onPrint }) => {
  const { purchases, deletePurchase } = usePurchases();

  const columns = [
    { key: 'dvNo', label: 'DV No.' },
    { key: 'supplier1.name', label: 'Payee' },
    { key: 'purpose', label: 'Explanation' },
    { key: 'totalAmount', label: 'Gross Amount', type: 'currency' },
    { key: 'netAmount', label: 'Net Amount', type: 'currency' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  const filteredData = purchases
    .filter(p => p.status === 'Approved' || p.status === 'Completed')
    .map(p => {
      const tax5 = p.totalAmount * 0.05;
      const tax1 = p.totalAmount * 0.01;
      return {
        ...p,
        'supplier1.name': p.supplier1?.name || '-',
        purpose: p.purpose || p.title,
        netAmount: p.totalAmount - tax5 - tax1
      };
    });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      deletePurchase(id);
    }
  };

  return (
    <div className="animate-fade-in">
      <DataTable
        columns={columns}
        data={filteredData}
        onEdit={onEdit}
        onPrint={(purchase) => onPrint(purchase, 'dv')}
        onDelete={handleDelete}
        showStatusActions={false}
      />
    </div>
  );
};

export const CanvassForms = ({ onPrint }) => {
  const { purchases } = usePurchases();

  const columns = [
    { key: 'prNo', label: 'PR No.' },
    { key: 'title', label: 'Title' },
    { key: 'supplier1.name', label: 'Supplier 1' },
    { key: 'supplier2.name', label: 'Supplier 2' },
    { key: 'supplier3.name', label: 'Supplier 3' },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  const transformedData = purchases.map(p => ({
    ...p,
    'supplier1.name': p.supplier1?.name || '-',
    'supplier2.name': p.supplier2?.name || '-',
    'supplier3.name': p.supplier3?.name || '-'
  }));

  return (
    <div className="animate-fade-in">
      <DataTable
        columns={columns}
        data={transformedData}
        onPrint={(purchase) => onPrint(purchase, 'canvass')}
        onEdit={() => {}}
        onDelete={() => {}}
        showStatusActions={false}
      />
    </div>
  );
};

export const AbstractOfCanvass = ({ onPrint }) => {
  const { purchases } = usePurchases();

  const columns = [
    { key: 'prNo', label: 'PR No.' },
    { key: 'title', label: 'Project Name' },
    { key: 'supplier1.name', label: 'Winning Supplier' },
    { key: 'totalAmount', label: 'Winning Amount', type: 'currency' },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  const transformedData = purchases.map(p => ({
    ...p,
    'supplier1.name': p.supplier1?.name || '-'
  }));

  return (
    <div className="animate-fade-in">
      <DataTable
        columns={columns}
        data={transformedData}
        onPrint={(purchase) => onPrint(purchase, 'abstract')}
        onEdit={() => {}}
        onDelete={() => {}}
        showStatusActions={false}
      />
    </div>
  );
};

export const PropertyAcknowledgement = ({ onPrint }) => {
  const { purchases } = usePurchases();

  // Flatten items from completed purchases
  const parData = [];
  purchases.filter(p => p.status === 'Completed').forEach(p => {
    p.items.forEach(item => {
      parData.push({
        id: `${p.id}-${item.number}`,
        parNo: `${p.prNo}-PAR`,
        description: item.name,
        propertyNo: '-',
        date: p.date,
        cost: item.total,
        originalPurchase: p
      });
    });
  });

  const columns = [
    { key: 'parNo', label: 'PAR No.' },
    { key: 'description', label: 'Description' },
    { key: 'propertyNo', label: 'Property No.' },
    { key: 'date', label: 'Date Acquired', type: 'date' },
    { key: 'cost', label: 'Cost', type: 'currency' },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  return (
    <div className="animate-fade-in">
      <DataTable
        columns={columns}
        data={parData}
        onPrint={(item) => onPrint(item.originalPurchase, 'par')}
        onEdit={() => {}}
        onDelete={() => {}}
        showStatusActions={false}
      />
    </div>
  );
};

export const RequisitionIssueSlip = ({ onPrint }) => {
  const { purchases } = usePurchases();

  const columns = [
    { key: 'risNo', label: 'RIS No.' },
    { key: 'department', label: 'Division' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  const transformedData = purchases.map(p => ({
    ...p,
    risNo: `${p.prNo}-RIS`,
    purpose: p.purpose || p.title
  }));

  return (
    <div className="animate-fade-in">
      <DataTable
        columns={columns}
        data={transformedData}
        onPrint={(purchase) => onPrint(purchase, 'ris')}
        onEdit={() => {}}
        onDelete={() => {}}
        showStatusActions={false}
      />
    </div>
  );
};

export const InspectionReport = ({ onPrint }) => {
  const { purchases } = usePurchases();

  const columns = [
    { key: 'supplier1.name', label: 'Supplier' },
    { key: 'invoiceNo', label: 'Invoice No.' },
    { key: 'dateReceived', label: 'Date Received' },
    { key: 'dateInspected', label: 'Date Inspected' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  const filteredData = purchases
    .filter(p => p.status === 'Approved' || p.status === 'Completed')
    .map(p => ({
      ...p,
      'supplier1.name': p.supplier1?.name || '-',
      invoiceNo: '-',
      dateReceived: '-',
      dateInspected: '-'
    }));

  return (
    <div className="animate-fade-in">
      <DataTable
        columns={columns}
        data={filteredData}
        onPrint={(purchase) => onPrint(purchase, 'air')}
        onEdit={() => {}}
        onDelete={() => {}}
        showStatusActions={false}
      />
    </div>
  );
};
