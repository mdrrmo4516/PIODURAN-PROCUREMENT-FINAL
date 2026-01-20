// Local storage utilities for the MDRRMO Procurement System

const STORAGE_KEY = 'mdrrmo_purchases';

export const getStoredPurchases = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

export const savePurchases = (purchases) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const generateId = (prefix, purchases) => {
  const year = new Date().getFullYear();
  const count = purchases.length + 1;
  return `${year}-${prefix}-${String(count).padStart(3, '0')}`;
};

export const formatCurrency = (amount) => {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PH', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

// Sample data for initial state
export const getSamplePurchase = (purchases) => ({
  id: generateId('PF', purchases),
  prNo: generateId('PR', purchases),
  poNo: generateId('PO', purchases),
  obrNo: generateId('OBR', purchases),
  dvNo: generateId('DV', purchases),
  title: 'Repair and Maintenance of MDRRMO Vehicle',
  date: new Date().toISOString().split('T')[0],
  department: 'MDRRMO',
  purpose: 'For the repair and maintenance of MDRRMO Monitoring Vehicle',
  supplier1: { name: 'ONGSKIE AUTO SUPPLY', address: 'Pioduran, Albay' },
  supplier2: { name: 'YONGSKY TRADING', address: 'Pioduran, Albay' },
  supplier3: { name: 'ASD COMMERCIAL', address: 'Pioduran, Albay' },
  items: [
    { number: 1, name: 'Engine Oil 15W-40', description: '', unit: 'pc', quantity: 4, unitPrice: 450, total: 1800 },
    { number: 2, name: 'Oil Filter', description: '', unit: 'pc', quantity: 2, unitPrice: 250, total: 500 },
    { number: 3, name: 'Air Filter', description: '', unit: 'pc', quantity: 1, unitPrice: 350, total: 350 }
  ],
  totalAmount: 2650,
  status: 'Pending',
  createdAt: new Date().toISOString()
});

// CSV Export function
export const exportToCSV = (purchases) => {
  if (purchases.length === 0) {
    return null;
  }

  let csvContent = 'ID,PR_No,PO_No,OBR_No,DV_No,Title,Date,Department,Purpose,Status,Supplier1_Name,Supplier1_Address,Supplier2_Name,Supplier2_Address,Supplier3_Name,Supplier3_Address,Total_Amount,Items_JSON,Created_At\n';

  purchases.forEach(p => {
    const itemsJson = JSON.stringify(p.items).replace(/"/g, '""');
    csvContent += `"${p.id}","${p.prNo}","${p.poNo}","${p.obrNo}","${p.dvNo}","${p.title}","${p.date}","${p.department}","${p.purpose || ''}","${p.status}","${p.supplier1?.name || ''}","${p.supplier1?.address || ''}","${p.supplier2?.name || ''}","${p.supplier2?.address || ''}","${p.supplier3?.name || ''}","${p.supplier3?.address || ''}","${p.totalAmount}","${itemsJson}","${p.createdAt}"\n`;
  });

  return csvContent;
};

// CSV Import function
export const parseCSV = (text, purchases) => {
  const lines = text.split('\n');
  const newPurchases = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCSVLine(lines[i]);

    if (values.length >= 17) {
      let items = [];
      try {
        items = JSON.parse(values[17].replace(/""/g, '"'));
      } catch (e) {
        items = [];
      }

      const purchase = {
        id: values[0] || generateId('PF', [...purchases, ...newPurchases]),
        prNo: values[1] || generateId('PR', [...purchases, ...newPurchases]),
        poNo: values[2] || generateId('PO', [...purchases, ...newPurchases]),
        obrNo: values[3] || generateId('OBR', [...purchases, ...newPurchases]),
        dvNo: values[4] || generateId('DV', [...purchases, ...newPurchases]),
        title: values[5],
        date: values[6],
        department: values[7],
        purpose: values[8],
        status: values[9] || 'Pending',
        supplier1: { name: values[10], address: values[11] },
        supplier2: { name: values[12], address: values[13] },
        supplier3: { name: values[14], address: values[15] },
        totalAmount: parseFloat(values[16]) || 0,
        items: items,
        createdAt: values[18] || new Date().toISOString()
      };

      newPurchases.push(purchase);
    }
  }

  return newPurchases;
};

const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
};
