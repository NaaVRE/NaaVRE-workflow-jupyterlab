const EXT_TO_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  pdf: 'application/pdf'
};

// TIFF is a common scientific output but no major browser renders it, so it is
// reported as unsupported instead of producing a silently broken <img>.
export function isRenderableImageMime(mime: string): boolean {
  return (
    (mime.startsWith('image/') && mime !== 'image/tiff') ||
    mime === 'application/pdf'
  );
}

export function imageMime(fileName: string, encodingFormat?: string): string {
  const declared = (encodingFormat ?? '').trim().toLowerCase();
  if (declared.includes('/')) {
    return declared;
  }
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return EXT_TO_MIME[ext] ?? 'application/octet-stream';
}
