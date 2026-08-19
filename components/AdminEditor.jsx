'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BrandLogo } from '@/components/BrandLogo';
import { getSchema, PAGE_TEMPLATE_OPTIONS, POST_TEMPLATE_OPTIONS } from '@/lib/templateSchemas';
import { resolveSeoTemplate } from '@/lib/seoVariables';

const tabs = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'settings', label: 'Settings' },
  { key: 'pages', label: 'Pages' },
  { key: 'posts', label: 'Posts' },
  { key: 'categories', label: 'Categories' },
  { key: 'media', label: 'Media' },
  { key: 'formSubmissions', label: 'Contact form submissions' }
];

const pageTemplates = PAGE_TEMPLATE_OPTIONS;
const postTemplates = POST_TEMPLATE_OPTIONS;

function updateLocalized(target, field, lang, value) {
  return { ...target, [field]: { ...(target[field] || {}), [lang]: value } };
}

function Field({ label, children }) {
  return <label className="cms-field"><span>{label}</span>{children}</label>;
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="cms-toggle">
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function PublishToggle({ item, onChange }) {
  const published = item.enabled !== false && item.status !== 'draft';
  return (
    <Toggle
      checked={published}
      label={published ? 'Published' : 'Draft'}
      onChange={(checked) => onChange({
        ...item,
        enabled: checked,
        status: checked ? 'publish' : 'draft',
        modifiedAt: new Date().toISOString()
      })}
    />
  );
}

function RichHtmlEditor({ label, value, onChange, dir = 'ltr', template = 'standard', title = '' }) {
  const [mode, setMode] = useState('visual');
  const editorRef = useRef(null);

  function command(name, argument = null) {
    editorRef.current?.focus();
    document.execCommand(name, false, argument);
    onChange(editorRef.current?.innerHTML || '');
  }

  function setBlock(tag) {
    command('formatBlock', tag);
  }

  function setLink() {
    const url = window.prompt('Link URL');
    if (url) command('createLink', url);
  }

  return (
    <div className="rich-editor">
      <div className="rich-editor-head">
        <span>{label}</span>
        <div className="editor-tabs">
          {['visual', 'code'].map((tab) => (
            <button key={tab} className={mode === tab ? 'active' : ''} onClick={() => setMode(tab)} type="button">
              {tab}
            </button>
          ))}
        </div>
      </div>

      {mode === 'visual' && (
        <>
          <div className="editor-toolbar" aria-label={`${label} toolbar`}>
            <button type="button" onClick={() => setBlock('P')}>P</button>
            <button type="button" onClick={() => setBlock('H2')}>H2</button>
            <button type="button" onClick={() => setBlock('H3')}>H3</button>
            <button type="button" onClick={() => command('bold')}><strong>B</strong></button>
            <button type="button" onClick={() => command('italic')}><em>I</em></button>
            <button type="button" onClick={() => command('insertUnorderedList')}>UL</button>
            <button type="button" onClick={() => command('insertOrderedList')}>OL</button>
            <button type="button" onClick={setLink}>Link</button>
            <button type="button" onClick={() => command('removeFormat')}>Clear</button>
          </div>
          <div
            ref={editorRef}
            className="visual-editor content"
            contentEditable
            dir={dir}
            dangerouslySetInnerHTML={{ __html: value || '' }}
            onBlur={(event) => onChange(event.currentTarget.innerHTML)}
            onInput={(event) => onChange(event.currentTarget.innerHTML)}
            suppressContentEditableWarning
          />
        </>
      )}

      {mode === 'preview' && (
        <article className={`single single-page page-template-${template} editor-page-preview`} dir={dir}>
          <header className="single-header">
            <p className="section-kicker">{template}</p>
            <h1>{title || 'Page title'}</h1>
          </header>
          <div className="content editor-preview" dangerouslySetInnerHTML={{ __html: value || '' }} />
        </article>
      )}

      {mode === 'code' && (
        <textarea
          className="large-textarea code-editor"
          dir="ltr"
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          spellCheck="false"
        />
      )}
    </div>
  );
}

function TermPicker({ label, terms, selectedIds = [], onChange }) {
  const visibleTerms = terms.filter((term) => term.enabled !== false || selectedIds.includes(term.wordpressId || term.id));

  function toggle(id, checked) {
    const next = checked
      ? Array.from(new Set([...selectedIds, id]))
      : selectedIds.filter((selectedId) => selectedId !== id);
    onChange(next);
  }

  return (
    <div className="term-picker">
      <span>{label}</span>
      <div>
        {visibleTerms.map((term) => {
          const id = term.wordpressId || term.id;
          return (
            <label key={term._id || term.slug} className={term.enabled === false ? 'disabled-term' : ''}>
              <input type="checkbox" checked={selectedIds.includes(id)} onChange={(event) => toggle(id, event.target.checked)} />
              {term.name?.en || term.slug}{term.enabled === false ? ' (disabled)' : ''}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function getLocalizedValue(value, lang) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value[lang] || value.en || '';
  return value || '';
}

function stripAssessmentText(html) {
  if (typeof window === 'undefined') return html.replace(/<[^>]+>/g, '');
  const node = document.createElement('div');
  node.innerHTML = html || '';
  return node.textContent || '';
}

function scoreLabel(score) {
  if (score >= 70) return 'Good';
  if (score >= 40) return 'OK';
  if (score > 0) return 'Poor';
  return 'No score';
}

function scoreTone(score) {
  if (score >= 70) return 'good';
  if (score >= 40) return 'ok';
  if (score > 0) return 'bad';
  return 'empty';
}

function StatusIcon({ tone }) {
  const symbol = tone === 'good' ? '☺' : tone === 'ok' ? '•' : tone === 'bad' ? '!' : '•';
  return <span className={`yoast-status-icon yoast-status-${tone}`}>{symbol}</span>;
}

const seoTitleVariables = [
  { label: 'Title', token: '%%title%%' },
  { label: 'Page', token: '%%page%%' },
  { label: 'Separator', token: '%%sep%%' },
  { label: 'Site title', token: '%%sitename%%' },
  { label: 'Excerpt', token: '%%excerpt%%' },
  { label: 'Date', token: '%%date%%' },
  { label: 'Slug', token: '%%slug%%' }
];

function parseSeoTemplateParts(template = '') {
  const variableByToken = new Map(seoTitleVariables.map((variable) => [variable.token, variable.label]));
  return template.split(/(%%[a-z_]+%%)/g)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => ({
      value: part,
      label: variableByToken.get(part) || part,
      isVariable: variableByToken.has(part)
    }));
}

function unwrapYoastExport(value) {
  return value?.default?.default || value?.default || value;
}

function extractImagesFromHtml(html) {
  if (typeof window === 'undefined') return [];
  const node = document.createElement('div');
  node.innerHTML = html || '';
  return Array.from(node.querySelectorAll('img')).map((image) => ({
    src: image.getAttribute('src') || '',
    alt: image.getAttribute('alt') || ''
  }));
}

function measureSeoTitleWidth(title) {
  if (typeof document === 'undefined' || !title) return 0;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return title.length * 9;
  context.font = '20px Arial, sans-serif';
  return Math.round(context.measureText(title).width);
}

function SeoPanel({ post, updateSelected, media }) {
  const [lang, setLang] = useState('en');
  const [activeSeoTab, setActiveSeoTab] = useState('SEO');
  const [analysis, setAnalysis] = useState({ loading: true, score: 0, results: [], readabilityScore: 0, readabilityResults: [], error: '' });

  const title = getLocalizedValue(post.title, lang);
  const excerpt = getLocalizedValue(post.excerpt, lang);
  const body = getLocalizedValue(post.fields?.body, lang) || getLocalizedValue(post.content, lang);
  const keyphrase = getLocalizedValue(post.seo?.focusKeyphrase, lang);
  const synonyms = getLocalizedValue(post.seo?.synonyms, lang);
  const seoTitleTemplate = getLocalizedValue(post.seo?.title, lang) || '%%title%% %%sep%% %%sitename%%';
  const seoTitle = resolveSeoTemplate(seoTitleTemplate, post, lang);
  const seoDescription = getLocalizedValue(post.seo?.description, lang) || excerpt;
  const socialTitle = getLocalizedValue(post.seo?.socialTitle, lang) || seoTitle;
  const socialDescription = getLocalizedValue(post.seo?.socialDescription, lang) || seoDescription;
  const analyzedImages = useMemo(() => extractImagesFromHtml(body), [body]);
  const previewDescription = seoDescription.length > 145 ? `${seoDescription.slice(0, 145).trim()}...` : seoDescription;
  const socialPreviewDescription = (socialDescription || excerpt || '').length > 140 ? `${(socialDescription || excerpt).slice(0, 140).trim()}...` : (socialDescription || excerpt || '');
  const seoTone = scoreTone(analysis.score);
  const readabilityTone = scoreTone(analysis.readabilityScore);
  const groupedResults = useMemo(() => ({
    problems: analysis.results.filter((result) => result.score < 5),
    improvements: analysis.results.filter((result) => result.score >= 5 && result.score < 8),
    good: analysis.results.filter((result) => result.score >= 8)
  }), [analysis.results]);
  const groupedReadabilityResults = useMemo(() => ({
    problems: analysis.readabilityResults.filter((result) => result.score < 5),
    improvements: analysis.readabilityResults.filter((result) => result.score >= 5 && result.score < 8),
    good: analysis.readabilityResults.filter((result) => result.score >= 8)
  }), [analysis.readabilityResults]);

  function updateSeoField(field, value) {
    updateSelected({
      ...post,
      seo: {
        ...(post.seo || {}),
        [field]: {
          ...(post.seo?.[field] || {}),
          [lang]: value
        }
      }
    });
  }

  function insertSeoTitleVariable(token) {
    const current = seoTitleTemplate || '';
    const next = current ? `${current.trim()} ${token}` : token;
    updateSeoField('title', next);
  }

  function removeSeoTitlePart(indexToRemove) {
    const next = parseSeoTemplateParts(seoTitleTemplate)
      .filter((_, index) => index !== indexToRemove)
      .map((part) => part.value)
      .join(' ');
    updateSeoField('title', next);
  }

  useEffect(() => {
    let active = true;
    async function analyze() {
      setAnalysis((current) => ({ ...current, loading: true, error: '' }));
      try {
        const yoast = await import('yoastseo');
        const researcherModule = lang === 'ar'
          ? await import('yoastseo/build/languageProcessing/languages/ar/Researcher.js')
          : await import('yoastseo/build/languageProcessing/languages/en/Researcher.js');
        const Researcher = unwrapYoastExport(researcherModule);
        const yoastApi = unwrapYoastExport(yoast);
        const Paper = unwrapYoastExport(yoast.Paper || yoastApi.Paper);
        const SeoAssessor = unwrapYoastExport(yoast.SeoAssessor || yoastApi.SeoAssessor);
        const ContentAssessor = unwrapYoastExport(yoast.ContentAssessor || yoastApi.ContentAssessor);
        const paper = new Paper(body || '', {
          keyword: keyphrase,
          synonyms,
          title: seoTitle,
          titleWidth: measureSeoTitleWidth(seoTitle),
          textTitle: title,
          description: seoDescription,
          slug: post.slug || ''
        });
        const researcher = new Researcher(paper);
        const assessor = new SeoAssessor(researcher);
        assessor.assess(paper);
        const readabilityAssessor = new ContentAssessor(researcher);
        readabilityAssessor.assess(paper);
        const score = assessor.calculateOverallScore();
        const readabilityScore = readabilityAssessor.calculateOverallScore();
        const results = assessor.results
          .map((result) => ({
            score: result.getScore?.() ?? 0,
            text: stripAssessmentText(result.getText?.() || '')
          }))
          .filter((result) => result.text)
          .sort((a, b) => a.score - b.score);
        const readabilityResults = readabilityAssessor.results
          .map((result) => ({
            score: result.getScore?.() ?? 0,
            text: stripAssessmentText(result.getText?.() || '')
          }))
          .filter((result) => result.text)
          .sort((a, b) => a.score - b.score);
        if (active) setAnalysis({ loading: false, score, results, readabilityScore, readabilityResults, error: '' });
      } catch (error) {
        if (active) setAnalysis({ loading: false, score: 0, results: [], readabilityScore: 0, readabilityResults: [], error: error.message });
      }
    }

    analyze();
    return () => {
      active = false;
    };
  }, [body, keyphrase, lang, post.slug, seoDescription, seoTitle]);

  return (
    <section className="seo-panel">
      <div className="seo-panel-head">
        <div>
          <strong className="yoast-logo">yoast</strong>
          <p>Optimize your content for discovery.</p>
        </div>
        <div className={`seo-score seo-score-${scoreTone(analysis.score)}`}>
          <strong>{analysis.loading ? '...' : analysis.score}</strong>
          <span>{analysis.loading ? 'Analyzing' : scoreLabel(analysis.score)}</span>
        </div>
      </div>

      <div className="seo-tabs">
        <button className={activeSeoTab === 'SEO' ? 'active' : ''} onClick={() => setActiveSeoTab('SEO')} type="button">
          <StatusIcon tone={seoTone} /> SEO
        </button>
        <button className={activeSeoTab === 'Readability' ? 'active' : ''} onClick={() => setActiveSeoTab('Readability')} type="button">
          <StatusIcon tone={readabilityTone} /> Readability
        </button>
        <button className={activeSeoTab === 'Schema' ? 'active' : ''} onClick={() => setActiveSeoTab('Schema')} type="button">
          <span className="yoast-grid-icon">▦</span> Schema
        </button>
        <button className={activeSeoTab === 'Social' ? 'active' : ''} onClick={() => setActiveSeoTab('Social')} type="button">
          <span className="yoast-share-icon">●</span> Social
        </button>
      </div>

      <div className="seo-language-switch">
        {['en', 'ar'].map((code) => (
          <button key={code} className={lang === code ? 'active' : ''} onClick={() => setLang(code)} type="button">{code.toUpperCase()}</button>
        ))}
      </div>

      {activeSeoTab === 'SEO' && (
        <>
          <details className="yoast-box" open>
            <summary>Focus keyphrase</summary>
            <Field label={`Focus keyphrase ${lang.toUpperCase()}`}>
              <input dir={lang === 'ar' ? 'rtl' : 'ltr'} value={keyphrase} onChange={(event) => updateSeoField('focusKeyphrase', event.target.value)} />
            </Field>
            <Field label="Keyphrase synonyms">
              <input dir={lang === 'ar' ? 'rtl' : 'ltr'} value={synonyms} onChange={(event) => updateSeoField('synonyms', event.target.value)} placeholder="Type here" />
            </Field>
          </details>

          <details className="yoast-box" open>
            <summary>Search appearance</summary>
            <p className="yoast-muted">Determine how your post should look in search results.</p>
            <div className="google-preview">
              <div className="google-preview-site">
                <span>Yalla Together</span>
                <small>yallatogether.com › {post.slug}</small>
              </div>
              <h4>{seoTitle || title}</h4>
              <p>{previewDescription || excerpt}</p>
            </div>
            <Field label={`SEO title ${lang.toUpperCase()}`}>
              <div className="seo-token-editor" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {parseSeoTemplateParts(seoTitleTemplate).map((part, index) => (
                  <button
                    key={`${part.value}-${index}`}
                    className={part.isVariable ? 'seo-token' : 'seo-token seo-token-text'}
                    onClick={() => removeSeoTitlePart(index)}
                    title="Remove"
                    type="button"
                  >
                    {part.label}
                  </button>
                ))}
              </div>
              <input className="seo-template-raw" dir="ltr" value={seoTitleTemplate} onChange={(event) => updateSeoField('title', event.target.value)} />
            </Field>
            <div className="seo-variable-row">
              {seoTitleVariables.map((variable) => (
                <button key={variable.token} type="button" onClick={() => insertSeoTitleVariable(variable.token)}>{variable.label}</button>
              ))}
            </div>
            <p className="yoast-resolved-title">Resolved: {seoTitle}</p>
            <div className="seo-width-meter">
              <span style={{ width: `${Math.min(100, (measureSeoTitleWidth(seoTitle) / 600) * 100)}%` }} />
            </div>
            <Field label="Slug">
              <input disabled value={post.slug || ''} />
            </Field>
            <Field label={`Meta description ${lang.toUpperCase()}`}>
              <textarea dir={lang === 'ar' ? 'rtl' : 'ltr'} value={seoDescription} onChange={(event) => updateSeoField('description', event.target.value)} />
            </Field>
            <div className="seo-width-meter seo-description-meter">
              <span style={{ width: `${Math.min(100, (seoDescription.length / 156) * 100)}%` }} />
            </div>
          </details>

          {analysis.error && <p className="admin-status">{analysis.error}</p>}
          {!analysis.error && (
            <details className="yoast-box" open>
              <summary>SEO analysis</summary>
              <div className="seo-results">
                <SeoResultGroup title="Problems" tone="bad" results={groupedResults.problems} />
                <SeoResultGroup title="Improvements" tone="ok" results={groupedResults.improvements} />
                <SeoResultGroup title="Good results" tone="good" results={groupedResults.good} />
              </div>
            </details>
          )}

          {analyzedImages.length > 0 && (
            <details className="seo-images">
              <summary>Analyzed images ({analyzedImages.length})</summary>
              <div>
                {analyzedImages.map((image, index) => (
                  <p key={`${image.src}-${index}`}>
                    <strong>{index + 1}.</strong> {image.src}
                    <span>{image.alt || 'No alt text'}</span>
                  </p>
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {activeSeoTab === 'Readability' && (
        <>
          <details className="yoast-box" open>
            <summary>Readability analysis</summary>
            <div className="yoast-tab-summary">
              <div className={`seo-score seo-score-${scoreTone(analysis.readabilityScore)}`}>
                <strong>{analysis.loading ? '...' : analysis.readabilityScore}</strong>
                <span>{analysis.loading ? 'Analyzing' : scoreLabel(analysis.readabilityScore)}</span>
              </div>
            </div>
            {analysis.error && <p className="admin-status">{analysis.error}</p>}
            {!analysis.error && (
              <div className="seo-results">
                <SeoResultGroup title="Problems" tone="bad" results={groupedReadabilityResults.problems} />
                <SeoResultGroup title="Improvements" tone="ok" results={groupedReadabilityResults.improvements} />
                <SeoResultGroup title="Good results" tone="good" results={groupedReadabilityResults.good} />
              </div>
            )}
          </details>
        </>
      )}

      {activeSeoTab === 'Schema' && (
        <details className="yoast-box" open>
          <summary>Schema</summary>
          <Field label="Page type">
            <select value={post.seo?.schemaPageType || 'Article'} onChange={(event) => updateSelected({ ...post, seo: { ...(post.seo || {}), schemaPageType: event.target.value } })}>
              {['Article', 'BlogPosting', 'NewsArticle', 'WebPage'].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Article type">
            <select value={post.seo?.schemaArticleType || 'BlogPosting'} onChange={(event) => updateSelected({ ...post, seo: { ...(post.seo || {}), schemaArticleType: event.target.value } })}>
              {['BlogPosting', 'Article', 'NewsArticle'].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
        </details>
      )}

      {activeSeoTab === 'Social' && (
        <details className="yoast-box" open>
          <summary>Social media appearance</summary>
          <p className="yoast-muted">Determine how your post should look on social media like Facebook, X, Instagram, WhatsApp, Threads, LinkedIn, Slack, and more.</p>
          <h4 className="yoast-subtitle">Social share preview</h4>
          <div className="social-share-preview">
            <div className="social-share-image">
              {(post.seo?.socialImage || post.featuredImage) && <img src={post.seo?.socialImage || post.featuredImage} alt="" />}
            </div>
            <div>
              <small>YALLATOGETHER.COM</small>
              <strong>{socialTitle || title}</strong>
              <p>{socialPreviewDescription}</p>
            </div>
          </div>
          <h4 className="yoast-subtitle">Social image</h4>
          <MediaPicker label="Social image" value={post.seo?.socialImage || ''} media={media} onSelect={(path) => updateSelected({ ...post, seo: { ...(post.seo || {}), socialImage: path } })} />
          <Field label={`Social title ${lang.toUpperCase()}`}>
            <input dir={lang === 'ar' ? 'rtl' : 'ltr'} value={socialTitle} onChange={(event) => updateSeoField('socialTitle', event.target.value)} />
          </Field>
          <Field label={`Social description ${lang.toUpperCase()}`}>
            <textarea dir={lang === 'ar' ? 'rtl' : 'ltr'} value={socialDescription} onChange={(event) => updateSeoField('socialDescription', event.target.value)} />
          </Field>
        </details>
      )}
    </section>
  );
}

function SeoResultGroup({ title, tone, results }) {
  return (
    <details className="seo-result-group" open>
      <summary>{title} ({results.length})</summary>
      {results.map((result, index) => (
        <div className="seo-result" key={`${title}-${result.score}-${index}`}>
          <span className={`seo-dot seo-dot-${tone}`} />
          <p>{result.text}</p>
        </div>
      ))}
    </details>
  );
}

function MediaPicker({ value, media, onSelect, label = 'Featured image' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filteredMedia = media
    .filter((item) => item.enabled !== false)
    .filter((item) => {
      const haystack = `${item.title?.en || ''} ${item.slug || ''} ${item.localPath || ''}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });

  return (
    <div className="media-picker-field">
      <span>{label}</span>
      <div className="media-picker-current">
        {value ? <img src={value} alt="" /> : <div className="media-placeholder">No image</div>}
        <div>
          <p>{value || 'No featured image selected'}</p>
          <button type="button" className="secondary-button" onClick={() => setOpen(true)}>Choose media</button>
          {value && <button type="button" className="secondary-button" onClick={() => onSelect('')}>Remove</button>}
        </div>
      </div>

      {open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Select media">
          <div className="media-modal">
            <div className="media-modal-head">
              <h2>Select media</h2>
              <button type="button" className="secondary-button" onClick={() => setOpen(false)}>Close</button>
            </div>
            <input className="media-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search media" />
            <div className="media-picker-grid">
              {filteredMedia.map((item) => (
                <button
                  key={item._id || item.wordpressId || item.localPath}
                  type="button"
                  className={item.localPath === value ? 'active' : ''}
                  onClick={() => {
                    onSelect(item.localPath || '');
                    setOpen(false);
                  }}
                >
                  {item.localPath ? <img src={item.localPath} alt={item.alt?.en || item.title?.en || ''} /> : <div className="media-placeholder">No preview</div>}
                  <span>{item.title?.en || item.slug || item.localPath}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateFieldsEditor({ item, entity, lang, media, updateSelected }) {
  const schema = getSchema(entity === 'post' ? 'post' : 'page', item.template || 'standard');
  const visibleSchema = schema.filter((field) => field.localized || lang === 'en');

  function getValue(field) {
    const value = item.fields?.[field.name];
    if (field.localized) {
      if (value && Object.prototype.hasOwnProperty.call(value, lang)) return value[lang];
      if (field.name === 'body') return item.content?.[lang] || item.content?.en || '';
      return '';
    }
    if (field.type === 'boolean') return value ?? field.defaultValue ?? true;
    return value || '';
  }

  function setValue(field, value) {
    const fields = { ...(item.fields || {}) };
    fields[field.name] = field.localized
      ? { ...(fields[field.name] || {}), [lang]: value }
      : value;
    updateSelected({ ...item, fields });
  }

  return (
    <div className="template-fields">
      <h3>{lang === 'en' ? 'Template fields' : 'Arabic fields'}</h3>
      {visibleSchema.map((field) => {
        if (field.type === 'section') {
          return <h4 className="template-field-section" key={field.name}>{field.label}</h4>;
        }
        const fieldLabel = field.localized ? `${field.label} ${lang.toUpperCase()}` : `${field.label} shared`;
        if (field.type === 'image') {
          return <MediaPicker key={`${field.name}-${lang}`} label={fieldLabel} value={getValue(field)} media={media} onSelect={(path) => setValue(field, path)} />;
        }
        if (field.type === 'boolean') {
          return <Toggle key={`${field.name}-${lang}`} checked={getValue(field)} label={fieldLabel} onChange={(checked) => setValue(field, checked)} />;
        }
        if (field.type === 'richtext') {
          return (
            <RichHtmlEditor
              key={`${field.name}-${lang}`}
              label={fieldLabel}
              value={getValue(field)}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              template={item.template || 'standard'}
              title={item.title?.[lang] || item.title?.en || ''}
              onChange={(value) => setValue(field, value)}
            />
          );
        }
        if (field.type === 'textarea') {
          return (
            <Field key={`${field.name}-${lang}`} label={fieldLabel}>
              <textarea dir={lang === 'ar' ? 'rtl' : 'ltr'} value={getValue(field)} onChange={(event) => setValue(field, event.target.value)} />
            </Field>
          );
        }
        return (
          <Field key={`${field.name}-${lang}`} label={fieldLabel}>
            <input dir={lang === 'ar' ? 'rtl' : 'ltr'} value={getValue(field)} onChange={(event) => setValue(field, event.target.value)} />
          </Field>
        );
      })}
    </div>
  );
}

function EntityEditor({ label, items, setItems, selectedId, setSelectedId, saveStatus = {}, onSave, onCreate, onDelete, onUploadMedia, typeOptions, richContent = false, entity = '', categories = [], media = [] }) {
  const selected = useMemo(() => items.find((item) => (item._id || item.slug || item.wordpressId) === selectedId), [items, selectedId]);
  const isHomepage = entity === 'page' && selected?.template === 'homepage';
  const selectedTermId = selected?.wordpressId || selected?.id;
  const saveButtonLabel = saveStatus.state === 'saving' ? 'Saving...' : saveStatus.state === 'saved' ? '✓ Saved' : 'Save';

  function getListMeta(item) {
    if (entity === 'page') return item.template === 'homepage' ? '/' : `/${item.slug || ''}`;
    if (entity === 'post') return `/${item.slug || ''}`;
    return item.kind || item.type || item.mimeType || item.localPath || '';
  }

  function updateSelected(nextItem) {
    setItems((current) => current.map((item) => ((item._id || item.slug || item.wordpressId) === selectedId ? nextItem : item)));
  }

  return (
    <div className="admin-split">
      <aside className="admin-list">
        {items.map((item) => {
          const id = item._id || item.slug || item.wordpressId;
          return (
            <button key={id} className={id === selectedId ? 'active' : ''} onClick={() => setSelectedId(id)} type="button">
              <span>{item.title?.en || item.name?.en || item.slug || item.localPath}</span>
              <small>{getListMeta(item)}</small>
            </button>
          );
        })}
      </aside>

      {selected && (
        <div className="admin-panel">
          <div className="editor-title-row">
            <h2>{label}: {selected.title?.en || selected.name?.en || selected.slug}</h2>
            <div className="editor-title-actions">
              {(entity === 'page' || entity === 'post')
                ? <PublishToggle item={selected} onChange={updateSelected} />
                : selected.enabled !== undefined && <Toggle checked={selected.enabled} label="Enabled" onChange={(checked) => updateSelected({ ...selected, enabled: checked })} />}
              {saveStatus.state === 'error' && <span className="inline-save-status">{saveStatus.message}</span>}
              <button className="primary-button" type="button" onClick={onSave} disabled={saveStatus.state === 'saving'}>{saveButtonLabel}</button>
              {onDelete && <button className="danger-button" onClick={() => onDelete(selected)} type="button">Delete</button>}
            </div>
          </div>
          {selected.localPath && <img className="media-preview" src={selected.localPath} alt={selected.alt?.en || ''} />}
          <div className="form-grid">
            {selected.slug !== undefined && <Field label="Slug"><input value={selected.slug || ''} onChange={(e) => updateSelected({ ...selected, slug: e.target.value })} /></Field>}
            {typeOptions && entity !== 'page' && entity !== 'post' && (
              <Field label="Type">
                <select value={selected.kind || selected.type} onChange={(e) => updateSelected({ ...selected, [selected.kind ? 'kind' : 'type']: e.target.value })}>
                  {typeOptions.map((option) => <option value={option} key={option}>{option}</option>)}
                </select>
              </Field>
            )}
            {entity === 'page' && (
              <Field label="Template">
                <select value={selected.template || 'standard'} onChange={(e) => updateSelected({ ...selected, template: e.target.value })}>
                  {pageTemplates.map((template) => <option key={template.value} value={template.value}>{template.label}</option>)}
                </select>
              </Field>
            )}
            {entity === 'post' && (
              <Field label="Template">
                <select value={selected.template || 'standard'} onChange={(e) => updateSelected({ ...selected, template: e.target.value })}>
                  {postTemplates.map((template) => <option key={template.value} value={template.value}>{template.label}</option>)}
                </select>
              </Field>
            )}
            {entity === 'category' && (
              <Field label="Parent category">
                <select
                  value={selected.parentId || 0}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    const parentId = rawValue === '0' ? 0 : Number.isNaN(Number(rawValue)) ? rawValue : Number(rawValue);
                    updateSelected({ ...selected, parentId });
                  }}
                >
                  <option value="0">None</option>
                  {categories
                    .filter((category) => {
                      const id = category.wordpressId || category.id;
                      return id && id !== selectedTermId;
                    })
                    .map((category) => {
                      const id = category.wordpressId || category.id;
                      return <option key={category._id || category.slug} value={id}>{category.name?.en || category.slug}</option>;
                    })}
                </select>
              </Field>
            )}
            {entity === 'category' && <MediaPicker label="Category image" value={selected.featuredImage || ''} media={media} onSelect={(path) => updateSelected({ ...selected, featuredImage: path })} />}
            {selected.featuredImage !== undefined && !isHomepage && entity !== 'category' && <MediaPicker value={selected.featuredImage || ''} media={media} onSelect={(path) => updateSelected({ ...selected, featuredImage: path })} />}
            {selected.localPath !== undefined && <Field label="Local path"><input value={selected.localPath || ''} onChange={(e) => updateSelected({ ...selected, localPath: e.target.value })} /></Field>}
            {selected.sourceUrl !== undefined && <Field label="Source URL"><input value={selected.sourceUrl || ''} onChange={(e) => updateSelected({ ...selected, sourceUrl: e.target.value })} /></Field>}
            {selected.title && <Field label="Title EN"><input value={selected.title?.en || ''} onChange={(e) => updateSelected(updateLocalized(selected, 'title', 'en', e.target.value))} /></Field>}
            {selected.title && <Field label="Title AR"><input dir="rtl" value={selected.title?.ar || ''} onChange={(e) => updateSelected(updateLocalized(selected, 'title', 'ar', e.target.value))} /></Field>}
            {selected.name && <Field label="Name EN"><input value={selected.name?.en || ''} onChange={(e) => updateSelected(updateLocalized(selected, 'name', 'en', e.target.value))} /></Field>}
            {selected.name && <Field label="Name AR"><input dir="rtl" value={selected.name?.ar || ''} onChange={(e) => updateSelected(updateLocalized(selected, 'name', 'ar', e.target.value))} /></Field>}
            {selected.alt && <Field label="Alt EN"><input value={selected.alt?.en || ''} onChange={(e) => updateSelected(updateLocalized(selected, 'alt', 'en', e.target.value))} /></Field>}
            {selected.alt && <Field label="Alt AR"><input dir="rtl" value={selected.alt?.ar || ''} onChange={(e) => updateSelected(updateLocalized(selected, 'alt', 'ar', e.target.value))} /></Field>}
            {selected.excerpt && selected.template !== 'homepage' && <Field label="Excerpt EN"><textarea value={selected.excerpt?.en || ''} onChange={(e) => updateSelected(updateLocalized(selected, 'excerpt', 'en', e.target.value))} /></Field>}
            {selected.excerpt && selected.template !== 'homepage' && <Field label="Excerpt AR"><textarea dir="rtl" value={selected.excerpt?.ar || ''} onChange={(e) => updateSelected(updateLocalized(selected, 'excerpt', 'ar', e.target.value))} /></Field>}
          </div>
          {richContent && selected.content && (
            <>
              <TemplateFieldsEditor item={selected} entity={entity} lang="en" media={media} updateSelected={updateSelected} />
              <TemplateFieldsEditor item={selected} entity={entity} lang="ar" media={media} updateSelected={updateSelected} />
            </>
          )}
          {entity === 'post' && (
            <>
              <SeoPanel post={selected} updateSelected={updateSelected} media={media} />
              <div className="assignment-grid">
                <TermPicker label="Categories" terms={categories} selectedIds={selected.categories || []} onChange={(ids) => updateSelected({ ...selected, categories: ids })} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function formatSubmissionFieldName(name) {
  return name
    .replace(/^your-/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function FormSubmissionsPanel({ submissions }) {
  return (
    <div className="admin-panel submissions-panel">
      {submissions.length === 0 ? (
        <p>No form submissions yet.</p>
      ) : (
        submissions.map((submission) => (
          <article className="submission-card" key={submission._id || submission.createdAt}>
            <header>
              <div>
                <h2>{submission.fields?.['your-subject'] || submission.fields?.subject || 'Contact form submission'}</h2>
                <small>{submission.createdAt ? new Date(submission.createdAt).toLocaleString() : ''}</small>
              </div>
              <span>{submission.formName || 'contact'}</span>
            </header>
            <dl>
              {Object.entries(submission.fields || {}).map(([name, value]) => (
                <div key={name}>
                  <dt>{formatSubmissionFieldName(name)}</dt>
                  <dd>{Array.isArray(value) ? value.join(', ') : value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))
      )}
    </div>
  );
}

export function AdminEditor({ initialData, mongoEnabled, session }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState(initialData.settings);
  const [pages, setPages] = useState(initialData.pages);
  const [posts, setPosts] = useState(initialData.posts);
  const [categories, setCategories] = useState(initialData.categories);
  const [media, setMedia] = useState(initialData.media);
  const [analytics] = useState(initialData.analytics);
  const [formSubmissions] = useState(initialData.formSubmissions || []);
  const [selectedPageId, setSelectedPageId] = useState(initialData.pages[0]?._id || initialData.pages[0]?.slug || '');
  const [selectedPostId, setSelectedPostId] = useState(initialData.posts[0]?._id || initialData.posts[0]?.slug || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData.categories[0]?._id || initialData.categories[0]?.slug || '');
  const [selectedMediaId, setSelectedMediaId] = useState(initialData.media[0]?._id || initialData.media[0]?.wordpressId || '');
  const [saveStatus, setSaveStatus] = useState({ state: 'idle', message: '' });
  const saveStatusTimer = useRef(null);

  async function save(type, payload) {
    if (saveStatusTimer.current) window.clearTimeout(saveStatusTimer.current);
    setSaveStatus({ state: 'saving', message: '' });
    try {
      const response = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Save failed');
      setSaveStatus({ state: 'saved', message: '' });
      saveStatusTimer.current = window.setTimeout(() => {
        setSaveStatus({ state: 'idle', message: '' });
      }, 2000);
    } catch (error) {
      setSaveStatus({ state: 'error', message: error.message });
    }
  }

  async function deleteContent(item) {
    if (!window.confirm(`Delete "${item.title?.en || item.slug}"? This cannot be undone.`)) return;
    setSaveStatus({ state: 'saving', message: 'Deleting...' });
    try {
      const response = await fetch('/api/cms', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'content', id: item._id, kind: item.kind, slug: item.slug })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Delete failed');
      if (item.kind === 'page') {
        setPages((current) => {
          const next = current.filter((page) => (page._id || page.slug) !== (item._id || item.slug));
          setSelectedPageId(next[0]?._id || next[0]?.slug || '');
          return next;
        });
      }
      if (item.kind === 'post') {
        setPosts((current) => {
          const next = current.filter((post) => (post._id || post.slug) !== (item._id || item.slug));
          setSelectedPostId(next[0]?._id || next[0]?.slug || '');
          return next;
        });
      }
      setSaveStatus({ state: 'saved', message: 'Deleted.' });
      saveStatusTimer.current = window.setTimeout(() => {
        setSaveStatus({ state: 'idle', message: '' });
      }, 2000);
    } catch (error) {
      setSaveStatus({ state: 'error', message: error.message });
    }
  }

  async function deleteTaxonomy(item) {
    if (!window.confirm(`Delete "${item.name?.en || item.slug}"? This cannot be undone.`)) return;
    setSaveStatus({ state: 'saving', message: 'Deleting...' });
    try {
      const response = await fetch('/api/cms', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'taxonomy', id: item._id, termType: item.type, slug: item.slug })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Delete failed');
      if (item.type === 'category') {
        setCategories((current) => {
          const next = current.filter((category) => (category._id || category.slug) !== (item._id || item.slug));
          setSelectedCategoryId(next[0]?._id || next[0]?.slug || '');
          return next;
        });
      }
      setSaveStatus({ state: 'saved', message: 'Deleted.' });
      saveStatusTimer.current = window.setTimeout(() => {
        setSaveStatus({ state: 'idle', message: '' });
      }, 2000);
    } catch (error) {
      setSaveStatus({ state: 'error', message: error.message });
    }
  }

  function createPage() {
    const suffix = Date.now();
    const page = {
      kind: 'page',
      slug: `new-page-${suffix}`,
      status: 'draft',
      enabled: false,
      template: 'standard',
      title: { en: 'New page', ar: 'New page' },
      excerpt: { en: '', ar: '' },
      content: { en: '<p>Start writing...</p>', ar: '<p>Start writing...</p>' },
      fields: {
        heading: { en: 'New page', ar: 'New page' },
        body: { en: '<p>Start writing...</p>', ar: '<p>Start writing...</p>' }
      },
      seo: { title: { en: '%%title%% %%sep%% %%sitename%%', ar: '%%title%% %%sep%% %%sitename%%' }, description: { en: '', ar: '' } },
      featuredImage: '',
      featuredImageAlt: { en: '', ar: '' },
      categories: [],
      publishedAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      menuOrder: pages.length
    };
    setPages((current) => [page, ...current]);
    setSelectedPageId(page.slug);
  }

  function createPost() {
    const suffix = Date.now();
    const post = {
      kind: 'post',
      slug: `new-post-${suffix}`,
      status: 'draft',
      enabled: false,
      template: 'standard',
      title: { en: 'New post', ar: 'New post' },
      excerpt: { en: '', ar: '' },
      content: { en: '<p>Start writing...</p>', ar: '<p>Start writing...</p>' },
      fields: {
        headline: { en: 'New post', ar: 'New post' },
        body: { en: '<p>Start writing...</p>', ar: '<p>Start writing...</p>' }
      },
      seo: { title: { en: '%%title%% %%sep%% %%sitename%%', ar: '%%title%% %%sep%% %%sitename%%' }, description: { en: '', ar: '' } },
      featuredImage: '',
      featuredImageAlt: { en: '', ar: '' },
      categories: [],
      publishedAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      menuOrder: posts.length
    };
    setPosts((current) => [post, ...current]);
    setSelectedPostId(post.slug);
  }

  function createCategory() {
    const suffix = Date.now();
    const category = {
      type: 'category',
      slug: `new-category-${suffix}`,
      enabled: true,
      name: { en: 'New category', ar: 'New category' },
      description: { en: '', ar: '' },
      featuredImage: '',
      featuredImageAlt: { en: '', ar: '' },
      parentId: 0,
      count: 0
    };
    setCategories((current) => [category, ...current]);
    setSelectedCategoryId(category.slug);
  }

  async function uploadMedia() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setSaveStatus({ state: 'saving', message: 'Uploading...' });
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/cms/media-upload', { method: 'POST', body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Upload failed');
        setMedia((current) => [result.media, ...current]);
        setSelectedMediaId(result.media._id || result.media.localPath);
        setSaveStatus({ state: 'saved', message: 'Uploaded.' });
        saveStatusTimer.current = window.setTimeout(() => {
          setSaveStatus({ state: 'idle', message: '' });
        }, 2000);
      } catch (error) {
        setSaveStatus({ state: 'error', message: error.message });
      }
    };
    input.click();
  }

  function updateSettings(path, value) {
    setSettings((current) => {
      const next = structuredClone(current);
      let cursor = next;
      for (const part of path.slice(0, -1)) cursor = cursor[part];
      cursor[path[path.length - 1]] = value;
      return next;
    });
  }

  const allContent = [...pages.map((item) => ({ ...item, kind: 'page' })), ...posts.map((item) => ({ ...item, kind: 'post' }))];
  const allTaxonomies = categories.map((item) => ({ ...item, type: 'category' }));
  const sectionMeta = {
    pages: { count: pages.length, addLabel: 'Add Page', onAdd: createPage },
    posts: { count: posts.length, addLabel: 'Add Post', onAdd: createPost },
    categories: { count: categories.length, addLabel: 'Add Category', onAdd: createCategory },
    media: { count: media.length, addLabel: 'Add Media', onAdd: uploadMedia },
    formSubmissions: { count: formSubmissions.length }
  };

  function saveActiveSection() {
    if (activeTab === 'settings') return save('settings', settings);
    if (activeTab === 'pages' || activeTab === 'posts') return save('content', allContent);
    if (activeTab === 'categories') return save('taxonomies', allTaxonomies);
    if (activeTab === 'media') return save('media', media);
    return null;
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveActiveSection();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, settings, allContent, allTaxonomies, media]);

  return (
    <section className="admin-app-shell">
      <aside className="admin-sidebar">
        <div>
          <div className="admin-logo">
            <BrandLogo inverted compact />
            <small>CMS</small>
          </div>
          <nav className="admin-tabs" aria-label="CMS sections">
            {tabs.map((tab) => (
              <button key={tab.key} className={activeTab === tab.key ? 'active' : ''} onClick={() => setActiveTab(tab.key)} type="button">
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="admin-account">
          <span>{session.email}</span>
          <form action="/admin/logout" method="post">
            <button className="logout-button" type="submit">Log out</button>
          </form>
        </div>
      </aside>

      <main className="admin-shell">
        <div className="admin-head">
          <div>
            {/* <p className="section-kicker">cms</p> */}
            <h1>
              {tabs.find((tab) => tab.key === activeTab)?.label || 'Dashboard'}
              {sectionMeta[activeTab] && <span className="admin-title-count">({sectionMeta[activeTab].count})</span>}
            </h1>
          </div>
          {sectionMeta[activeTab]?.onAdd && (
            <button className="primary-button" type="button" onClick={sectionMeta[activeTab].onAdd}>
              {sectionMeta[activeTab].addLabel}
            </button>
          )}
        </div>

        {!mongoEnabled && <p className="admin-warning">Mongo is not configured. CMS saves are unavailable.</p>}

      {activeTab === 'dashboard' && (
        <div className="dashboard-grid">
          <div className="metric-card"><span>Total views</span><strong>{analytics.totalViews}</strong></div>
          <div className="metric-card"><span>Today</span><strong>{analytics.todayViews}</strong></div>
          <div className="metric-card"><span>Pages</span><strong>{pages.length}</strong></div>
          <div className="metric-card"><span>Posts</span><strong>{posts.length}</strong></div>
          <div className="metric-card"><span>Categories</span><strong>{categories.length}</strong></div>
          <div className="metric-card"><span>Media</span><strong>{media.length}</strong></div>
          <div className="admin-panel wide">
            <h2>Top pages</h2>
            {analytics.topPages.length ? analytics.topPages.map((page) => (
              <div className="analytics-row" key={page.path}><span>{page.path}</span><strong>{page.views}</strong></div>
            )) : <p>No page views yet.</p>}
          </div>
          <div className="admin-panel">
            <h2>Languages</h2>
            {analytics.languages.length ? analytics.languages.map((item) => (
              <div className="analytics-row" key={item.lang}><span>{item.lang}</span><strong>{item.views}</strong></div>
            )) : <p>No language data yet.</p>}
          </div>
          <div className="admin-panel wide">
            <h2>Recent views</h2>
            {analytics.recentViews.map((view) => (
              <div className="analytics-row" key={`${view.path}-${view.createdAt}`}>
                <span>{view.path}</span>
                <small>{view.lang} · {view.createdAt}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="admin-panel">
          <h2>Website settings</h2>
          <div className="form-grid">
            <Field label="Site name"><input value={settings.siteName || ''} onChange={(e) => updateSettings(['siteName'], e.target.value)} /></Field>
            <Field label="Description"><input value={settings.description || ''} onChange={(e) => updateSettings(['description'], e.target.value)} /></Field>
            <Field label="Email"><input value={settings.email || ''} onChange={(e) => updateSettings(['email'], e.target.value)} /></Field>
          </div>
          <h3>Languages</h3>
          <div className="toggle-grid">
            {Object.entries(settings.languages || {}).map(([code, config]) => (
              <Toggle key={code} checked={config.enabled} label={`${config.label} enabled`} onChange={(checked) => updateSettings(['languages', code, 'enabled'], checked)} />
            ))}
          </div>
          <h3>Feature toggles</h3>
          <div className="toggle-grid">
            {Object.entries(settings.features || {}).map(([key, value]) => (
              <Toggle key={key} checked={value} label={key} onChange={(checked) => updateSettings(['features', key], checked)} />
            ))}
          </div>
          {saveStatus.state === 'error' && <p className="admin-status">{saveStatus.message}</p>}
          <button className="primary-button" disabled={!mongoEnabled || saveStatus.state === 'saving'} onClick={saveActiveSection} type="button">
            {saveStatus.state === 'saving' ? 'Saving...' : saveStatus.state === 'saved' ? '✓ Saved' : 'Save'}
          </button>
        </div>
      )}

      {activeTab === 'pages' && (
        <EntityEditor label="Page" items={pages} setItems={setPages} selectedId={selectedPageId} setSelectedId={setSelectedPageId} onSave={saveActiveSection} onCreate={createPage} onDelete={deleteContent} saveStatus={saveStatus} typeOptions={['page']} richContent entity="page" media={media} />
      )}
      {activeTab === 'posts' && (
        <EntityEditor label="Post" items={posts} setItems={setPosts} selectedId={selectedPostId} setSelectedId={setSelectedPostId} onSave={saveActiveSection} onCreate={createPost} onDelete={deleteContent} saveStatus={saveStatus} typeOptions={['post']} richContent entity="post" categories={categories} media={media} />
      )}
      {activeTab === 'categories' && (
        <EntityEditor label="Category" items={categories} setItems={setCategories} selectedId={selectedCategoryId} setSelectedId={setSelectedCategoryId} onSave={saveActiveSection} onCreate={createCategory} onDelete={deleteTaxonomy} saveStatus={saveStatus} typeOptions={['category']} entity="category" categories={categories} media={media} />
      )}
      {activeTab === 'media' && (
        <EntityEditor label="Media" items={media} setItems={setMedia} selectedId={selectedMediaId} setSelectedId={setSelectedMediaId} onSave={saveActiveSection} onUploadMedia={uploadMedia} saveStatus={saveStatus} />
      )}
      {activeTab === 'formSubmissions' && (
        <FormSubmissionsPanel submissions={formSubmissions} />
      )}

      </main>
    </section>
  );
}
