import { useMemo } from 'react';
import { isSupportedUrl } from '../utils/safeUrl';
import type { ClueSummary, Media } from '../backend';

interface RichClueContentProps {
  content: ClueSummary | string;
  className?: string;
}

export function RichClueContent({ content, className = '' }: RichClueContentProps) {
  const isStructured = typeof content !== 'string';
  
  if (isStructured) {
    const clue = content as ClueSummary;
    return (
      <div className={className}>
        <p className="whitespace-pre-wrap text-lg leading-relaxed mb-4">
          {clue.statement}
        </p>
        {clue.media && <MediaRenderer media={clue.media} />}
      </div>
    );
  }

  // Legacy text content rendering (for preview in admin)
  return (
    <div className={className}>
      <p className="whitespace-pre-wrap text-lg leading-relaxed">
        {content}
      </p>
    </div>
  );
}

function MediaRenderer({ media }: { media: Media }) {
  if (media.__kind__ === 'imageUrl') {
    const url = media.imageUrl;
    if (!isSupportedUrl(url)) return null;
    
    return (
      <img
        src={url}
        alt="Clue image"
        className="my-4 max-w-full rounded-lg border shadow-sm"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    );
  }
  
  if (media.__kind__ === 'videoUrl') {
    const url = media.videoUrl;
    if (!isSupportedUrl(url)) return null;
    
    return (
      <video
        src={url}
        controls
        className="my-4 max-w-full rounded-lg border shadow-sm"
        onError={(e) => {
          const target = e.target as HTMLVideoElement;
          target.style.display = 'none';
        }}
      >
        Your browser does not support the video tag.
      </video>
    );
  }
  
  if (media.__kind__ === 'pptUrl') {
    const url = media.pptUrl;
    if (!isSupportedUrl(url)) return null;
    
    return (
      <div className="my-4 rounded-lg border bg-muted/30 p-4">
        <p className="mb-2 text-sm font-medium">📊 Presentation:</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
        >
          {url}
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
}
