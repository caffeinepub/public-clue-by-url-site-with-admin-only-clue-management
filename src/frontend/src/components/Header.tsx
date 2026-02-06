import { useNavigate } from '@tanstack/react-router';

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-liminal-accent/20 liminal-glass-strong">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          onClick={() => navigate({ to: '/echofields' })}
          className="text-xl font-bold tracking-tight transition-all hover:text-liminal-accent hover:scale-105 text-liminal-text"
        >
          Echofields
        </button>
      </div>
    </header>
  );
}
