import path from 'path';

export function getMediaUploadRoot() {
  return path.resolve(/*turbopackIgnore: true*/ process.env.MEDIA_UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads'));
}

export function getMediaUploadPath(...segments) {
  const root = getMediaUploadRoot();
  const resolvedPath = path.resolve(root, ...segments);
  const insideRoot = resolvedPath === root || resolvedPath.startsWith(`${root}${path.sep}`);
  if (!insideRoot) {
    throw new Error('Invalid upload path.');
  }
  return resolvedPath;
}

export function getUploadPublicPath(...segments) {
  return `/uploads/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`;
}

export function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}
