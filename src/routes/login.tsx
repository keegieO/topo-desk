import { createFileRoute, Navigate } from "@tanstack/react-router";

// Auth is disabled — anyone who lands on /login goes straight to the app.
export const Route = createFileRoute("/login")({
  component: () => <Navigate to="/" replace />,
});
