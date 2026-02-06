import { SiCaffeine } from 'react-icons/si';
import { Heart } from 'lucide-react';
import { BUILD_INFO } from '../utils/buildInfo';

export function Footer() {
  return (
    <footer className="border-t-2 border-liminal-accent/20 liminal-glass-strong">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center text-sm text-liminal-muted">
          <p className="flex items-center gap-2">
            © 2026. Built with <Heart className="h-4 w-4 fill-liminal-accent text-liminal-accent" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-liminal-text transition-colors hover:text-liminal-accent"
            >
              <SiCaffeine className="h-4 w-4" />
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-liminal-muted/50">
            {BUILD_INFO.version} • {BUILD_INFO.description}
          </p>
        </div>
      </div>
    </footer>
  );
}
