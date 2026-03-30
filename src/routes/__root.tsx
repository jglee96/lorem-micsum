import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";

import Header from "../components/Header";

export const Route = createRootRoute({
  component: () => (
    <div className="page-shell grain-overlay min-h-screen">
      <Header />
      <main className="relative z-10">
        <Outlet />
      </main>
      {import.meta.env.DEV && (
        <TanstackDevtools
          config={{
            position: "bottom-left",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </div>
  ),
});
