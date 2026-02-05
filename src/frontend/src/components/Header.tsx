import { useNavigate } from '@tanstack/react-router';

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b aero-glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          onClick={() => navigate({ to: '/echofields' })}
          className="text-xl font-bold tracking-tight transition-all hover:text-accent hover:scale-105"
        >
          Echofields
        </button>
      </div>
    </header>
  );
}
