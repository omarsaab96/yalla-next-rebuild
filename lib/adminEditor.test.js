import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

// Exercise the actual component handler without requiring JSX or a browser.
const source = await readFile(new URL('../components/AdminEditor.jsx', import.meta.url), 'utf8');
const handler = source.slice(source.indexOf('  function updateSelected(nextItem) {'), source.indexOf('  function renderListItem('));

test('typing keeps the selected post and preserves concurrent autosave metadata', () => {
  let items = [{ _id: 'post-1', previewToken: 'saved-token', fields: { body: { en: '' } } }];
  let selectedId = 'post-1';
  const context = {
    selectedId,
    setItems: (update) => { items = update(items); },
    setSelectedId: (id) => { selectedId = id; }
  };
  runInNewContext(`${handler}\nthis.updateSelected = updateSelected;`, context);
  for (const text of ['h', 'he', 'hello']) {
    context.updateSelected((current) => ({
      ...current, fields: { ...current.fields, body: { en: text } }
    }));
    assert.equal(selectedId, 'post-1');
    assert.equal(items[0].fields.body.en, text);
    assert.equal(items[0].previewToken, 'saved-token');
  }
});

test('object updates still follow a changed slug for posts without a database ID', () => {
  let items = [{ slug: 'old-slug' }];
  let selectedId = 'old-slug';
  const context = {
    selectedId,
    setItems: (update) => { items = update(items); },
    setSelectedId: (id) => { selectedId = id; }
  };
  runInNewContext(`${handler}\nupdateSelected({ slug: 'new-slug' });`, context);
  assert.equal(selectedId, 'new-slug');
  assert.equal(items[0].slug, 'new-slug');
});
