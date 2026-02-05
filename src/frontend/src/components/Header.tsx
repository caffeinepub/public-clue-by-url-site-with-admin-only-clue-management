import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const isAdminPage = routerState.location.pathname.includes('/admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          onClick={() => navigate({ to: '/echofields' })}
          className="text-xl font-bold tracking-tight transition-colors hover:text-accent"
        >
          Echofields
        </button>

        {!isAdminPage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/echofields/admin' })}
          >
            <Lock className="mr-2 h-4 w-4" />
            Admin
          </Button>
        )}
      </div>
    </header>
  );
}
