import { useMemo } from 'react';

interface RichClueContentProps {
  content: string;
  className?: string;
}

interface ContentPart {
  type: 'text' | 'image';
  content: string;
  alt?: string;
  url?: string;
}

// Safely parse Markdown image syntax: ![alt](url)
function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    // Add text before the image
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index);
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }

    // Validate URL scheme (only allow http/https)
    const url = match[2].trim();
    const alt = match[1] || 'Image';
    
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      parts.push({ type: 'image', content: '', alt, url });
    } else {
      // Invalid URL scheme - render as text
      parts.push({ type: 'text', content: match[0] });
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
        }
        return null;
      })}
    </div>
  );
}
