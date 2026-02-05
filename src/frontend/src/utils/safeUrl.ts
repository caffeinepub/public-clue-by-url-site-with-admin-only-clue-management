/**
 * Validates if a URL uses a supported scheme (http, https, or app-relative path starting with /)
 */
export function isSupportedUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  );
}

/**
 * Determines if a URL is an internal app route (starts with /)
 */
export function isInternalRoute(url: string): boolean {
  return url.trim().startsWith('/');
}

/**
 * Determines if a URL is an external URL (http/https)
 */
export function isExternalUrl(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Validates and returns an error message if the URL is invalid
 */
export function validateUrl(url: string): string | null {
  const trimmed = url.trim();
  
  if (!trimmed) {
    return 'Please enter a URL or path';
  }
  
  if (!isSupportedUrl(trimmed)) {
    return 'URL must start with http://, https://, or / for app routes';
  }
  
  return null;
}
