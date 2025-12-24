import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <nav
        style={{
          padding: '1rem',
          borderBottom: '1px solid #ccc',
          display: 'flex',
          gap: '1rem',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Link
          to="/map"
          style={{ textDecoration: 'none', color: '#0066cc' }}
          activeProps={{ style: { fontWeight: 'bold' } }}
        >
          Map View
        </Link>
        <Link
          to="/table"
          style={{ textDecoration: 'none', color: '#0066cc' }}
          activeProps={{ style: { fontWeight: 'bold' } }}
        >
          Table View
        </Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
