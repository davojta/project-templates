import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { initAppInspect } from "../appInspect.js";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    initAppInspect(
      (page) => navigate({ to: `/${page}` }),
      () => pathnameRef.current.replace(/^\//, "") || "map",
    );
    return () => {
      delete window.__appInspect;
    };
  }, [navigate]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <nav
        data-testid="main-nav"
        aria-label="main-nav"
        role="navigation"
        style={{
          padding: "1rem",
          borderBottom: "1px solid #ccc",
          display: "flex",
          gap: "1rem",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Link
          to="/input"
          data-testid="nav-input"
          aria-label="nav-input"
          style={{ textDecoration: "none", color: "#0066cc" }}
          activeProps={{ style: { fontWeight: "bold" } }}
        >
          Input
        </Link>
        <Link
          to="/map"
          data-testid="nav-map"
          aria-label="nav-map"
          style={{ textDecoration: "none", color: "#0066cc" }}
          activeProps={{ style: { fontWeight: "bold" } }}
        >
          Map View
        </Link>
        <Link
          to="/table"
          data-testid="nav-table"
          aria-label="nav-table"
          style={{ textDecoration: "none", color: "#0066cc" }}
          activeProps={{ style: { fontWeight: "bold" } }}
        >
          Table View
        </Link>
        <Link
          to="/results"
          data-testid="nav-results"
          aria-label="nav-results"
          style={{ textDecoration: "none", color: "#0066cc" }}
          activeProps={{ style: { fontWeight: "bold" } }}
        >
          Results
        </Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
