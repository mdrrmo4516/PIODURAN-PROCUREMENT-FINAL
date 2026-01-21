// Merge CSV-imported purchases into existing list with overwrite-by-id semantics
// If an imported purchase has the same id as an existing purchase, the imported one replaces it.

export const mergePurchasesOverwriteById = (existing, imported) => {
  const map = new Map();

  for (const p of existing) {
    if (p?.id) map.set(p.id, p);
  }

  for (const p of imported) {
    if (!p?.id) continue;
    map.set(p.id, p);
  }

  return Array.from(map.values());
};
