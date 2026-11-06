// Payload serves uploads from /api/media/file/* on the same origin as /admin.
// A file opened directly must not run script or load anything (stored XSS ->
// admin session); <img> rendering is unaffected. Defense in depth: Media
// already rejects SVG and non-image MIME types.
export const MEDIA_FILE_PREFIX = "/api/media/file/";
export const MEDIA_CSP =
  "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox";

export function isMediaFilePath(pathname: string): boolean {
  return pathname.startsWith(MEDIA_FILE_PREFIX);
}
