import { useState } from "react";
import type { SubmitEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";

type LocationState = { from?: string };

export function AdminLoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      const state = location.state as LocationState | null;
      nav(state?.from ?? "/admin/products/new", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold tracking-tight">Admin login</h1>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <div className="text-sm font-medium">Email</div>
          <input
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Password</div>
          <input
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
