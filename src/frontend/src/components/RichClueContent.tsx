import { useMemo } from 'react';
import { isSupportedUrl } from '../utils/safeUrl';

interface RichClueContentProps {
  content: string;
  className?: string;
}

interface ContentPart {
  type: 'text' | 'image' | 'video' | 'ppt';
  content: string;
  alt?: string;
  url?: string;
}

// Safely parse Markdown image syntax: ![alt](url)
// And custom video/ppt syntax: {{video:url}} and {{ppt:url}}
function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  
  // Combined regex to match images, videos, and ppt in order
  const combinedRegex = /!\[([^\]]*)\]\(([^)]+)\)|\{\{video:([^}]+)\}\}|\{\{ppt:([^}]+)\}\}/g;
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index);
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }

    // Check which pattern matched
    if (match[1] !== undefined && match[2] !== undefined) {
      // Image pattern: ![alt](url)
      const url = match[2].trim();
      const alt = match[1] || 'Image';
      
      if (isSupportedUrl(url)) {
        parts.push({ type: 'image', content: '', alt, url });
      } else {
        // Invalid URL scheme - render as text
        parts.push({ type: 'text', content: match[0] });
      }
    } else if (match[3] !== undefined) {
      // Video pattern: {{video:url}}
      const url = match[3].trim();
      
      if (isSupportedUrl(url)) {
        parts.push({ type: 'video', content: '', url });
      } else {
        // Invalid URL scheme - render as text
        parts.push({ type: 'text', content: match[0] });
      }
    } else if (match[4] !== undefined) {
      // PPT pattern: {{ppt:url}}
      const url = match[4].trim();
      
      if (isSupportedUrl(url)) {
        parts.push({ type: 'ppt', content: '', url });
      } else {
        // Invalid URL scheme - render as text
        parts.push({ type: 'text', content: match[0] });
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return parts;
}

export function RichClueContent({ content, className = '' }: RichClueContentProps) {
  const parts = useMemo(() => parseContent(content), [content]);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <p key={index} className="whitespace-pre-wrap text-lg leading-relaxed">
              {part.content}
            </p>
          );
        } else if (part.type === 'image' && part.url) {
          return (
            <img
              key={index}
              src={part.url}
              alt={part.alt}
              className="my-4 max-w-full rounded-lg border shadow-sm"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          );
        } else if (part.type === 'video' && part.url) {
          return (
            <video
              key={index}
              src={part.url}
              controls
              className="my-4 max-w-full rounded-lg border shadow-sm"
              onError={(e) => {
                // Fallback if video fails to load
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
              }}
            >
              Your browser does not support the video tag.
            </video>
          );
        } else if (part.type === 'ppt' && part.url) {
          return (
            <div key={index} className="my-4 rounded-lg border bg-muted/30 p-4">
              <p className="mb-2 text-sm font-medium">📊 Presentation:</p>
              <a
                href={part.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                {part.url}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
