import { SiCaffeine } from 'react-icons/si';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t aero-glass">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            © 2026. Built with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-accent"
            >
              <SiCaffeine className="h-4 w-4" />
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
