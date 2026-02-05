/**
 * Utility to detect and transform pasted media URLs into markup
 */

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];
const PPT_EXTENSIONS = ['.ppt', '.pptx'];

function getFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    const lastDot = pathname.lastIndexOf('.');
    return lastDot >= 0 ? pathname.substring(lastDot) : '';
  } catch {
    // Not a valid URL, check as plain string
    const lower = url.toLowerCase();
    const lastDot = lower.lastIndexOf('.');
    return lastDot >= 0 ? lower.substring(lastDot) : '';
  }
}

function isImageUrl(url: string): boolean {
  const ext = getFileExtension(url);
  return IMAGE_EXTENSIONS.some(imgExt => ext === imgExt);
}

function isVideoUrl(url: string): boolean {
  const ext = getFileExtension(url);
  return VIDEO_EXTENSIONS.some(vidExt => ext === vidExt);
}

function isPptUrl(url: string): boolean {
  const ext = getFileExtension(url);
  return PPT_EXTENSIONS.some(pptExt => ext === pptExt);
}

function isUrl(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Transform pasted text into rich media markup if it's a supported URL
 * Returns the transformed text or null if no transformation is needed
 */
export function transformPastedMedia(pastedText: string): string | null {
  const trimmed = pastedText.trim();
  
  // Only transform if it looks like a URL
  if (!isUrl(trimmed)) {
    return null;
  }

  if (isImageUrl(trimmed)) {
    return `![Image](${trimmed})`;
  }

  if (isVideoUrl(trimmed)) {
    return `{{video:${trimmed}}}`;
  }

  if (isPptUrl(trimmed)) {
    return `{{ppt:${trimmed}}}`;
  }

  // Not a recognized media URL, paste normally
  return null;
}

/**
 * Insert text at cursor position in a textarea
 */
export function insertAtCursor(
  textarea: HTMLTextAreaElement,
  textToInsert: string,
  currentValue: string
): { newValue: string; newCursorPos: number } {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);
  const newCursorPos = start + textToInsert.length;

  return { newValue, newCursorPos };
}
