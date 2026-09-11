import test from 'node:test';
import assert from 'node:assert/strict';
import { compareCategories, reorderCategory } from './categoryOrder.js';

const items = [
  { id: 1, slug: 'parent', parentId: 0, name: 'Parent' },
  { id: 2, slug: 'a', parentId: 1, name: 'A' },
  { id: 3, slug: 'b', parentId: '1', name: 'B' },
  { id: 4, slug: 'c', parentId: 1, name: 'C', enabled: false },
  { id: 5, slug: 'other', parentId: 0, name: 'Other' }
];
const children = (list) => list.filter((item) => String(item.parentId) === '1').sort(compareCategories).map((item) => item.slug);

test('moves siblings before or after a target and survives serialization', () => {
  const moved = reorderCategory(items, 'c', 'a');
  assert.deepEqual(children(JSON.parse(JSON.stringify(moved))), ['c', 'a', 'b']);
  assert.deepEqual(children(reorderCategory(moved, 'c', 'b', true)), ['a', 'b', 'c']);
  assert.deepEqual(moved.map((item) => item.parentId), items.map((item) => item.parentId));
  assert.equal(moved[0], items[0]);
  assert.equal(moved[4], items[4]);
  assert.equal(items[3].menuOrder, undefined);
});

test('blocks cross-parent, self, and unknown drops', () => {
  assert.equal(reorderCategory(items, 'a', 'other'), items);
  assert.equal(reorderCategory(items, 'a', 'a'), items);
  assert.equal(reorderCategory(items, 'missing', 'a'), items);
});

test('reorders top-level categories without changing children', () => {
  const moved = reorderCategory(items, 'parent', 'other');
  assert.deepEqual(moved.filter((item) => !item.parentId).sort(compareCategories).map((item) => item.slug), ['parent', 'other']);
  assert.equal(moved[1], items[1]);
});

test('explicit root parent overrides legacy parent, and unsorted new items follow saved order', () => {
  const list = [{ slug: 'z', parentId: 0, parent: 99, menuOrder: 0 }, { slug: 'a', parentId: 0 }];
  assert.deepEqual([...list].sort(compareCategories).map((item) => item.slug), ['z', 'a']);
  assert.deepEqual(reorderCategory(list, 'a', 'z').sort(compareCategories).map((item) => item.slug), ['a', 'z']);
});
