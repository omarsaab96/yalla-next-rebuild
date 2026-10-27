import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { JSDOM } from 'jsdom';
import { loadBindings, transform } from 'next/dist/build/swc/index.js';
import * as categoryOrder from './categoryOrder.js';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { act } = React;
const require = createRequire(import.meta.url);
const source = await readFile(new URL('../components/AdminEditor.jsx', import.meta.url), 'utf8');
await loadBindings();
const compiled = await transform(`${source}\nexport { EntityEditor };`, {
  filename: 'AdminEditor.jsx',
  jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } }, target: 'es2022' },
  module: { type: 'commonjs' }
});
const module = { exports: {} };
runInNewContext(compiled.code, {
  module, exports: module.exports, window, document, console,
  require: (name) => {
    if (name === '@/lib/categoryOrder') return categoryOrder;
    if (name === '@/lib/templateSchemas') return {
      getSchema: () => [{ name: 'body', label: 'Body', type: 'richtext', localized: true }],
      POST_TEMPLATE_OPTIONS: [], PAGE_TEMPLATE_OPTIONS: [], getEffectivePageTemplate: () => 'standard'
    };
    if (name === '@/lib/seoVariables') return { resolveSeoTemplate: () => '' };
    if (name.startsWith('@/')) return {};
    return require(name);
  }
});

test('body input and save rerenders retain editable nodes, caret, and scroll', async () => {
  const root = createRoot(document.getElementById('root'));
  let setSaveStatus;
  let setPostItems;
  function Harness() {
    const [posts, setPosts] = React.useState([{
      _id: 'post-1', slug: 'post', title: { en: 'Test' }, content: { en: '' },
      fields: { body: { en: '<p>First paragraph</p><p>Second paragraph</p>', ar: '' } }
    }]);
    const [selectedId, setSelectedId] = React.useState('post-1');
    const [saveStatus, updateStatus] = React.useState({ state: 'idle' });
    setSaveStatus = updateStatus;
    setPostItems = setPosts;
    return React.createElement(module.exports.EntityEditor, {
      label: 'Post', items: posts, setItems: setPosts, selectedId, setSelectedId,
      entity: 'post', richContent: true, saveStatus, media: [], categories: []
    });
  }
  try {
    await act(async () => root.render(React.createElement(Harness)));
    const editor = document.querySelector('.visual-editor');
    editor.focus();
    editor.scrollTop = 180;
    const text = editor.lastChild.firstChild;
    const selection = window.getSelection();
    selection.collapse(text, 6);
    const descriptor = Object.getOwnPropertyDescriptor(dom.window.Element.prototype, 'innerHTML');
    let replacements = 0;
    Object.defineProperty(editor, 'innerHTML', {
      get() { return descriptor.get.call(this); },
      set(html) { replacements++; descriptor.set.call(this, html); }
    });
    for (const input of ['\n', 'h', 'e', 'l', 'l', 'o']) {
      await act(async () => {
        const range = selection.getRangeAt(0);
        const added = document.createTextNode(input);
        range.insertNode(added);
        selection.collapse(added, input.length);
        editor.dispatchEvent(new window.InputEvent('input', { bubbles: true, inputType: input === '\n' ? 'insertParagraph' : 'insertText', data: input }));
      });
      const caretNode = selection.anchorNode;
      const caretOffset = selection.anchorOffset;
      await act(async () => setSaveStatus({ state: 'saving' }));
      await act(async () => {
        setPostItems((posts) => posts.map((post) => ({ ...post, previewToken: 'saved-token' })));
        setSaveStatus({ state: 'saved' });
      });
      assert.equal(document.querySelector('.visual-editor'), editor);
      assert.equal(document.activeElement, editor);
      assert.equal(selection.anchorNode, caretNode);
      assert.equal(selection.anchorOffset, caretOffset);
      assert.equal(editor.scrollTop, 180);
    }
    assert.match(editor.textContent, /Second\nhello paragraph/);
    assert.equal(replacements, 0, 'typing and saving must never replace innerHTML');
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
  }
});
