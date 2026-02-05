import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, Navigate } from '@tanstack/react-router';
import { Home } from './pages/Home';
import { CluePage } from './pages/CluePage';
import { AdminPage } from './pages/AdminPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ThemeProvider } from 'next-themes';

// Layout component that wraps all routes
function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Redirect component for root route
function RedirectToEchofields() {
  return <Navigate to="/echofields" />;
}

// Redirect component for legacy admin route
function RedirectToSpectate() {
  return <Navigate to="/echofields/spectate" />;
}

// Root route with layout
const rootRoute = createRootRoute({
  component: Layout,
});

// Redirect from / to /echofields
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RedirectToEchofields,
});

// Echofields home route
const echofieldsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/echofields',
  component: Home,
});

// Dynamic clue route under echofields
const clueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/echofields/$clueId',
  component: CluePage,
});

// Spectate route under echofields (new admin portal path)
const spectateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/echofields/spectate',
  component: AdminPage,
});

// Legacy admin route - redirects to spectate
const legacyAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/echofields/admin',
  component: RedirectToSpectate,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  echofieldsRoute,
  clueRoute,
  spectateRoute,
  legacyAdminRoute,
]);

// Create the router
const router = createRouter({ routeTree });

// Register router type for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
