export function createSeoWorker() {
  return new Worker(new URL('./seoAnalysis.worker.js', import.meta.url), { type: 'module' });
}
