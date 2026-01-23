import { openDB } from 'idb';

const DB_NAME = 'mdrrmo_procurement_db';
const DB_VERSION = 2; // Upgraded for new features

const STORE_PURCHASES = 'purchases';
const STORE_META = 'meta';
const STORE_NOTIFICATIONS = 'notifications';
const STORE_ATTACHMENTS = 'attachments';

const META_KEY_COUNTERS = 'counters';

const emptyCounters = () => ({
  PF: {},
  PR: {},
  PO: {},
  OBR: {},
  DV: {},
});

const parseSequentialId = (id) => {
  // Expected pattern: YYYY-PREFIX-###
  // Example: 2026-PR-001
  if (!id || typeof id !== 'string') return null;
  const m = id.match(/^(\d{4})-([A-Z]+)-(\d{3,})$/);
  if (!m) return null;
  return { year: m[1], prefix: m[2], seq: Number(m[3]) };
};

const nextId = (prefix, counters, yearStr) => {
  const yearCounters = counters?.[prefix] ?? {};
  const nextSeq = (yearCounters[yearStr] ?? 0) + 1;
  const padded = String(nextSeq).padStart(3, '0');
  return {
    id: `${yearStr}-${prefix}-${padded}`,
    nextCounters: {
      ...counters,
      [prefix]: {
        ...yearCounters,
        [yearStr]: nextSeq,
      },
    },
  };
};

const computeCountersFromPurchases = (purchases) => {
  const counters = emptyCounters();

  for (const p of purchases) {
    for (const key of ['id', 'prNo', 'poNo', 'obrNo', 'dvNo']) {
      const parsed = parseSequentialId(p?.[key]);
      if (!parsed) continue;

      const { year, prefix, seq } = parsed;
      if (!counters[prefix]) counters[prefix] = {};
      counters[prefix][year] = Math.max(counters[prefix][year] ?? 0, seq);
    }
  }

  return counters;
};

export const getDb = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Create purchases store
      if (!db.objectStoreNames.contains(STORE_PURCHASES)) {
        const store = db.createObjectStore(STORE_PURCHASES, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('status', 'status');
        store.createIndex('date', 'date');
        store.createIndex('priority', 'priority');
      }

      // Create meta store
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META);
      }

      // Create notifications store (new in v2)
      if (!db.objectStoreNames.contains(STORE_NOTIFICATIONS)) {
        const notifStore = db.createObjectStore(STORE_NOTIFICATIONS, { keyPath: 'id' });
        notifStore.createIndex('createdAt', 'createdAt');
        notifStore.createIndex('read', 'read');
      }

      // Create attachments store (new in v2)
      if (!db.objectStoreNames.contains(STORE_ATTACHMENTS)) {
        const attachStore = db.createObjectStore(STORE_ATTACHMENTS, { keyPath: 'id' });
        attachStore.createIndex('purchaseId', 'purchaseId');
      }
    },
  });
};

export const listPurchases = async () => {
  const db = await getDb();
  const all = await db.getAll(STORE_PURCHASES);

  // Sort by createdAt desc (fallback to date)
  all.sort((a, b) => {
    const da = new Date(a.createdAt || a.date || 0).getTime();
    const dbt = new Date(b.createdAt || b.date || 0).getTime();
    return dbt - da;
  });

  return all;
};

export const getPurchase = async (id) => {
  const db = await getDb();
  return db.get(STORE_PURCHASES, id);
};

export const deletePurchase = async (id) => {
  const db = await getDb();
  await db.delete(STORE_PURCHASES, id);
  return true;
};

const getCounters = async (db) => {
  const counters = await db.get(STORE_META, META_KEY_COUNTERS);
  return counters ?? emptyCounters();
};

const setCounters = async (db, counters) => {
  await db.put(STORE_META, counters, META_KEY_COUNTERS);
};

export const ensureInitialized = async (samplePurchaseFactory) => {
  // If DB is empty, insert one sample purchase (same idea as localStorage fallback)
  const db = await getDb();
  const count = await db.count(STORE_PURCHASES);
  if (count > 0) return;

  if (typeof samplePurchaseFactory !== 'function') return;

  const sample = samplePurchaseFactory([]);
  await db.put(STORE_PURCHASES, sample);
  const counters = computeCountersFromPurchases([sample]);
  await setCounters(db, counters);
};

export const createPurchase = async (purchaseData) => {
  const db = await getDb();
  const yearStr = String(new Date().getFullYear());

  let counters = await getCounters(db);

  const pf = nextId('PF', counters, yearStr);
  counters = pf.nextCounters;
  const pr = nextId('PR', counters, yearStr);
  counters = pr.nextCounters;
  const po = nextId('PO', counters, yearStr);
  counters = po.nextCounters;
  const obr = nextId('OBR', counters, yearStr);
  counters = obr.nextCounters;
  const dv = nextId('DV', counters, yearStr);
  counters = dv.nextCounters;

  const nowIso = new Date().toISOString();
  const purchase = {
    id: pf.id,
    prNo: pr.id,
    poNo: po.id,
    obrNo: obr.id,
    dvNo: dv.id,
    status: 'Pending',
    priority: 'Normal',
    items: [],
    totalAmount: 0,
    createdAt: nowIso,
    createdBy: 'System',
    // New fields for enhanced features
    approvalInfo: {
      approvedBy: '',
      approvedAt: null,
      comments: '',
      signature: ''
    },
    attachments: [],
    auditTrail: [{
      timestamp: nowIso,
      action: 'created',
      user: purchaseData.createdBy || 'System',
      details: `Purchase request '${purchaseData.title}' created`,
      previousValue: null,
      newValue: null
    }],
    ...purchaseData,
  };

  await db.put(STORE_PURCHASES, purchase);
  await setCounters(db, counters);

  // Create notification for new purchase
  await createNotification({
    type: 'purchase_created',
    title: 'New Purchase Request',
    message: `Purchase request '${purchase.title}' has been created.`,
    purchaseId: purchase.id
  });

  return purchase;
};

export const updatePurchase = async (id, purchaseData) => {
  const db = await getDb();
  const existing = await db.get(STORE_PURCHASES, id);
  if (!existing) {
    throw new Error('Purchase not found');
  }

  // Build audit entry for changes
  const changes = [];
  if (existing.title !== purchaseData.title && purchaseData.title) {
    changes.push(`Title changed from '${existing.title}' to '${purchaseData.title}'`);
  }
  if (existing.totalAmount !== purchaseData.totalAmount && purchaseData.totalAmount !== undefined) {
    changes.push(`Amount changed from ${existing.totalAmount} to ${purchaseData.totalAmount}`);
  }
  if (existing.status !== purchaseData.status && purchaseData.status) {
    changes.push(`Status changed from '${existing.status}' to '${purchaseData.status}'`);
  }

  const auditEntry = {
    timestamp: new Date().toISOString(),
    action: 'updated',
    user: purchaseData.updatedBy || 'System',
    details: changes.length > 0 ? changes.join('; ') : 'Purchase details updated',
    previousValue: null,
    newValue: null
  };

  const updated = {
    ...existing,
    ...purchaseData,
    updatedAt: new Date().toISOString(),
    auditTrail: [...(existing.auditTrail || []), auditEntry]
  };

  await db.put(STORE_PURCHASES, updated);

  // If imported/updated record changes IDs, recompute counters defensively.
  // This keeps sequences valid for future creates.
  const all = await db.getAll(STORE_PURCHASES);
  await setCounters(db, computeCountersFromPurchases(all));

  return updated;
};

export const updatePurchaseStatus = async (id, status, approvalData = {}) => {
  const db = await getDb();
  const existing = await db.get(STORE_PURCHASES, id);
  if (!existing) {
    throw new Error('Purchase not found');
  }

  const oldStatus = existing.status;
  const nowIso = new Date().toISOString();

  // Determine action type
  let action = 'status_changed';
  if (status === 'Approved') action = 'approved';
  else if (status === 'Denied') action = 'denied';

  const auditEntry = {
    timestamp: nowIso,
    action,
    user: approvalData.approvedBy || 'System',
    details: approvalData.comments || `Status changed from ${oldStatus} to ${status}`,
    previousValue: oldStatus,
    newValue: status
  };

  const updateData = {
    status,
    updatedAt: nowIso,
    auditTrail: [...(existing.auditTrail || []), auditEntry]
  };

  // Update approval info for approved/denied
  if (status === 'Approved' || status === 'Denied') {
    updateData.approvalInfo = {
      approvedBy: approvalData.approvedBy || 'System',
      approvedAt: nowIso,
      comments: approvalData.comments || '',
      signature: approvalData.signature || ''
    };
  }

  const updated = { ...existing, ...updateData };
  await db.put(STORE_PURCHASES, updated);

  // Create notification
  await createNotification({
    type: 'status_changed',
    title: `Purchase ${status}`,
    message: `Purchase request '${existing.title}' has been ${status.toLowerCase()}.${approvalData.comments ? ` Comment: ${approvalData.comments}` : ''}`,
    purchaseId: id
  });

  return updated;
};

export const upsertManyPurchases = async (purchases) => {
  // Upsert by keyPath (id). Overwrites existing records.
  const db = await getDb();
  const tx = db.transaction([STORE_PURCHASES, STORE_META], 'readwrite');

  for (const p of purchases) {
    await tx.objectStore(STORE_PURCHASES).put(p);
  }

  const all = await tx.objectStore(STORE_PURCHASES).getAll();
  await tx.objectStore(STORE_META).put(computeCountersFromPurchases(all), META_KEY_COUNTERS);

  await tx.done;
  return true;
};


// ==================== Notifications ====================

export const createNotification = async (notificationData) => {
  const db = await getDb();
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: notificationData.type || 'info',
    title: notificationData.title || 'Notification',
    message: notificationData.message || '',
    purchaseId: notificationData.purchaseId || null,
    read: false,
    createdAt: new Date().toISOString()
  };
  await db.put(STORE_NOTIFICATIONS, notification);
  return notification;
};

export const listNotifications = async (unreadOnly = false) => {
  const db = await getDb();
  let notifications = await db.getAll(STORE_NOTIFICATIONS);
  
  if (unreadOnly) {
    notifications = notifications.filter(n => !n.read);
  }
  
  // Sort by createdAt desc
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return notifications;
};

export const markNotificationRead = async (id) => {
  const db = await getDb();
  const notification = await db.get(STORE_NOTIFICATIONS, id);
  if (notification) {
    notification.read = true;
    await db.put(STORE_NOTIFICATIONS, notification);
  }
  return notification;
};

export const markAllNotificationsRead = async () => {
  const db = await getDb();
  const notifications = await db.getAll(STORE_NOTIFICATIONS);
  const tx = db.transaction(STORE_NOTIFICATIONS, 'readwrite');
  for (const n of notifications) {
    n.read = true;
    await tx.store.put(n);
  }
  await tx.done;
  return true;
};

export const deleteNotification = async (id) => {
  const db = await getDb();
  await db.delete(STORE_NOTIFICATIONS, id);
  return true;
};

export const getUnreadNotificationCount = async () => {
  const db = await getDb();
  const notifications = await db.getAll(STORE_NOTIFICATIONS);
  return notifications.filter(n => !n.read).length;
};


// ==================== Attachments ====================

export const addAttachment = async (purchaseId, attachmentData) => {
  const db = await getDb();
  
  const attachment = {
    id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    purchaseId,
    filename: attachmentData.filename,
    originalName: attachmentData.originalName,
    mimeType: attachmentData.mimeType,
    size: attachmentData.size,
    data: attachmentData.data, // Base64 encoded file data
    uploadedAt: new Date().toISOString(),
    uploadedBy: attachmentData.uploadedBy || 'System'
  };
  
  await db.put(STORE_ATTACHMENTS, attachment);
  
  // Update purchase with attachment reference
  const purchase = await db.get(STORE_PURCHASES, purchaseId);
  if (purchase) {
    const attachmentRef = { ...attachment };
    delete attachmentRef.data; // Don't store data in purchase record
    
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action: 'attachment_added',
      user: attachmentData.uploadedBy || 'System',
      details: `Attachment '${attachmentData.originalName}' added`,
      previousValue: null,
      newValue: null
    };
    
    purchase.attachments = [...(purchase.attachments || []), attachmentRef];
    purchase.auditTrail = [...(purchase.auditTrail || []), auditEntry];
    purchase.updatedAt = new Date().toISOString();
    await db.put(STORE_PURCHASES, purchase);
  }
  
  return attachment;
};

export const getAttachment = async (attachmentId) => {
  const db = await getDb();
  return db.get(STORE_ATTACHMENTS, attachmentId);
};

export const listAttachments = async (purchaseId) => {
  const db = await getDb();
  const allAttachments = await db.getAll(STORE_ATTACHMENTS);
  return allAttachments.filter(a => a.purchaseId === purchaseId);
};

export const deleteAttachment = async (attachmentId, deletedBy = 'System') => {
  const db = await getDb();
  const attachment = await db.get(STORE_ATTACHMENTS, attachmentId);
  
  if (attachment) {
    // Update purchase to remove attachment reference
    const purchase = await db.get(STORE_PURCHASES, attachment.purchaseId);
    if (purchase) {
      const auditEntry = {
        timestamp: new Date().toISOString(),
        action: 'attachment_removed',
        user: deletedBy,
        details: `Attachment '${attachment.originalName}' removed`,
        previousValue: null,
        newValue: null
      };
      
      purchase.attachments = (purchase.attachments || []).filter(a => a.id !== attachmentId);
      purchase.auditTrail = [...(purchase.auditTrail || []), auditEntry];
      purchase.updatedAt = new Date().toISOString();
      await db.put(STORE_PURCHASES, purchase);
    }
    
    await db.delete(STORE_ATTACHMENTS, attachmentId);
  }
  
  return true;
};


// ==================== Audit Trail ====================

export const getPurchaseHistory = async (purchaseId) => {
  const db = await getDb();
  const purchase = await db.get(STORE_PURCHASES, purchaseId);
  if (!purchase) {
    throw new Error('Purchase not found');
  }
  
  return {
    purchaseId,
    prNo: purchase.prNo,
    title: purchase.title,
    history: purchase.auditTrail || []
  };
};


// ==================== Advanced Filtering ====================

export const filterPurchases = async (filters = {}) => {
  const db = await getDb();
  let purchases = await db.getAll(STORE_PURCHASES);
  
  // Apply filters
  if (filters.status) {
    purchases = purchases.filter(p => p.status === filters.status);
  }
  if (filters.priority) {
    purchases = purchases.filter(p => p.priority === filters.priority);
  }
  if (filters.department) {
    purchases = purchases.filter(p => p.department === filters.department);
  }
  if (filters.dateFrom) {
    purchases = purchases.filter(p => p.date >= filters.dateFrom);
  }
  if (filters.dateTo) {
    purchases = purchases.filter(p => p.date <= filters.dateTo);
  }
  if (filters.minAmount !== undefined && filters.minAmount !== null) {
    purchases = purchases.filter(p => p.totalAmount >= filters.minAmount);
  }
  if (filters.maxAmount !== undefined && filters.maxAmount !== null) {
    purchases = purchases.filter(p => p.totalAmount <= filters.maxAmount);
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    purchases = purchases.filter(p => 
      p.title?.toLowerCase().includes(searchLower) ||
      p.prNo?.toLowerCase().includes(searchLower) ||
      p.poNo?.toLowerCase().includes(searchLower)
    );
  }
  
  // Sort by createdAt desc
  purchases.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
  
  return purchases;
};
