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
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_PURCHASES)) {
        const store = db.createObjectStore(STORE_PURCHASES, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('status', 'status');
        store.createIndex('date', 'date');
      }

      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META);
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
    items: [],
    totalAmount: 0,
    createdAt: nowIso,
    ...purchaseData,
  };

  await db.put(STORE_PURCHASES, purchase);
  await setCounters(db, counters);

  return purchase;
};

export const updatePurchase = async (id, purchaseData) => {
  const db = await getDb();
  const existing = await db.get(STORE_PURCHASES, id);
  if (!existing) {
    throw new Error('Purchase not found');
  }

  const updated = {
    ...existing,
    ...purchaseData,
    updatedAt: new Date().toISOString(),
  };

  await db.put(STORE_PURCHASES, updated);

  // If imported/updated record changes IDs, recompute counters defensively.
  // This keeps sequences valid for future creates.
  const all = await db.getAll(STORE_PURCHASES);
  await setCounters(db, computeCountersFromPurchases(all));

  return updated;
};

export const updatePurchaseStatus = async (id, status) => {
  return updatePurchase(id, { status });
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
