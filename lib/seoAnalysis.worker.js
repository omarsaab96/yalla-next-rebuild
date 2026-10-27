function unwrap(value) {
  return value?.default?.default || value?.default || value;
}

self.onmessage = async ({ data }) => {
  try {
    const yoast = await import('yoastseo');
    const researcherModule = data.lang === 'ar'
      ? await import('yoastseo/build/languageProcessing/languages/ar/Researcher.js')
      : await import('yoastseo/build/languageProcessing/languages/en/Researcher.js');
    const Researcher = unwrap(researcherModule);
    const api = unwrap(yoast);
    const Paper = unwrap(yoast.Paper || api.Paper);
    const SeoAssessor = unwrap(yoast.SeoAssessor || api.SeoAssessor);
    const ContentAssessor = unwrap(yoast.ContentAssessor || api.ContentAssessor);
    const { body, lang, ...options } = data;
    const paper = new Paper(body || '', options);
    const researcher = new Researcher(paper);
    const seo = new SeoAssessor(researcher);
    const readability = new ContentAssessor(researcher);
    seo.assess(paper);
    readability.assess(paper);
    const results = (assessor) => assessor.results
      .map((result) => ({ score: result.getScore?.() ?? 0, text: result.getText?.() || '' }))
      .filter((result) => result.text)
      .sort((a, b) => a.score - b.score);
    self.postMessage({
      score: seo.calculateOverallScore(), results: results(seo),
      readabilityScore: readability.calculateOverallScore(), readabilityResults: results(readability)
    });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
