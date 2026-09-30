// Run: node --experimental-vm-modules --test lib/postPreview.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { ObjectId } from 'mongodb';

test('preview links stay private, refresh drafts, and are permanently revoked on publication', async () => {
  const records = [];
  function matches(record, query) {
    return Object.entries(query).every(([key, value]) => {
      if (key === '$or') return value.some((condition) => matches(record, condition));
      if (value && '$ne' in Object(value)) return record[key] !== value.$ne;
      return String(record[key]) === String(value);
    });
  }
  const collection = {
    async findOne(query) { return records.find((record) => matches(record, query)) || null; },
    async insertOne(value) {
      const _id = new ObjectId();
      records.push({ ...value, _id });
      return { insertedId: _id };
    },
    async updateOne(query, operation, options = {}) {
      let record = await this.findOne(query);
      if (!record && options.upsert) {
        record = { ...query, _id: new ObjectId() };
        records.push(record);
      }
      if (!record) return { matchedCount: 0 };
      Object.assign(record, operation.$set);
      for (const key of Object.keys(operation.$unset || {})) delete record[key];
      return { matchedCount: 1 };
    },
    find(query) { return { sort: () => ({ toArray: async () => records.filter((record) => matches(record, query)) }) }; },
    async deleteOne(query) {
      const index = records.findIndex((record) => matches(record, query));
      if (index >= 0) records.splice(index, 1);
    }
  };
  const cache = new Map();
  async function load(specifier, parent = resolve('lib/cms.js')) {
    const local = specifier.startsWith('@/') || specifier.startsWith('.');
    let key = local ? resolve(specifier.startsWith('@/') ? specifier.slice(2) : resolve(dirname(parent), specifier)) : specifier;
    if (local && !key.endsWith('.js')) key += '.js';
    if (cache.has(key)) return cache.get(key);
    let module;
    if (key === resolve('lib/mongo.js')) {
      module = new SyntheticModule(['getDb', 'hasMongoConfig'], function () {
        this.setExport('getDb', async () => ({ collection: () => collection }));
        this.setExport('hasMongoConfig', () => true);
      });
    } else if (local) {
      module = new SourceTextModule(await readFile(key, 'utf8'), { identifier: key });
    } else {
      const exports = await import(specifier);
      module = new SyntheticModule(Object.keys(exports), function () {
        for (const name of Object.keys(exports)) this.setExport(name, exports[name]);
      });
    }
    cache.set(key, module);
    await module.link((dependency) => load(dependency, key));
    return module;
  }
  const module = await load('@/lib/cms');
  await module.evaluate();
  const cms = module.namespace;
  const draft = { kind: 'post', slug: 'preview-test', enabled: false, status: 'draft', title: { en: 'First' } };
  const first = await cms.createPostPreview(draft);
  assert.match(first.previewToken, /^[a-f0-9]{64}$/);
  assert.equal((await cms.getPostPreview(first.previewToken)).title.en, 'First');
  assert.equal((await cms.getContentList('post')).length, 0);
  assert.equal(await cms.getPostPreview('invalid'), null);
  assert.equal(await cms.getPostPreview('0'.repeat(64)), null);
  const edited = await cms.createPostPreview({ ...first, title: { en: 'Updated' } });
  assert.equal(edited.previewToken, first.previewToken);
  assert.equal((await cms.getPostPreview(first.previewToken)).title.en, 'Updated');
  await cms.saveContentCollection([{ ...edited, enabled: true, status: 'publish' }]);
  assert.equal(await cms.getPostPreview(first.previewToken), null);
  assert.equal(records[0].previewToken, undefined);
  await assert.rejects(cms.createPostPreview(edited), /published/);
  await cms.saveContentCollection([edited]); // A stale client cannot restore the revoked token.
  assert.equal(await cms.getPostPreview(first.previewToken), null);
  const second = await cms.createPostPreview(edited);
  assert.notEqual(second.previewToken, first.previewToken);
  await cms.deleteContentItem({ id: second._id });
  assert.equal(await cms.getPostPreview(second.previewToken), null);
  const [savedDraft] = await cms.saveContentCollection([draft]);
  assert.ok(savedDraft._id, 'Saving a new draft returns its persistent identity');
  await cms.saveContentCollection([{ ...savedDraft, _id: savedDraft._id.toString(), slug: 'renamed-draft' }]);
  assert.equal(records.length, 1, 'Later autosaves update the same post after a slug change');
  assert.equal(records[0].slug, 'renamed-draft');
});
