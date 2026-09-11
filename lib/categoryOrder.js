export function categoryKey(item) {
  return String(item._id || item.slug || item.wordpressId || item.id);
}

export function categoryParent(item) {
  return String(item.parentId ?? item.parent ?? 0);
}

export function compareCategories(a, b) {
  const order = (item) => Number.isFinite(item.menuOrder) ? item.menuOrder : Number.MAX_SAFE_INTEGER;
  const name = (item) => typeof item.name === 'string' ? item.name : item.name?.en || item.slug || '';
  return order(a) - order(b) || name(a).localeCompare(name(b)) || categoryKey(a).localeCompare(categoryKey(b));
}

// Only siblings can move; parent identifiers are never modified by reordering.
export function reorderCategory(items, sourceKey, targetKey, after = false) {
  const source = items.find((item) => categoryKey(item) === sourceKey);
  const target = items.find((item) => categoryKey(item) === targetKey);
  if (!source || !target || source === target || categoryParent(source) !== categoryParent(target)) return items;
  const siblings = items.filter((item) => categoryParent(item) === categoryParent(source)).sort(compareCategories);
  const remaining = siblings.filter((item) => categoryKey(item) !== sourceKey);
  remaining.splice(remaining.findIndex((item) => categoryKey(item) === targetKey) + (after ? 1 : 0), 0, source);
  const positions = new Map(remaining.map((item, index) => [categoryKey(item), index]));
  return items.map((item) => positions.has(categoryKey(item)) ? { ...item, menuOrder: positions.get(categoryKey(item)) } : item);
}
