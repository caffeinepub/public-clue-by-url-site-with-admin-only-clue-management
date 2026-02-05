import { useNavigate } from '@tanstack/react-router';

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          onClick={() => navigate({ to: '/echofields' })}
          className="text-xl font-bold tracking-tight transition-colors hover:text-accent"
        >
          Echofields
        </button>
      </div>
    </header>
  );
}
