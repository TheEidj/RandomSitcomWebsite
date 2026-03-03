import { useState } from "react";
import type { SubmitEvent } from "react";
import { createProduct } from "../../../api/adminProducts";
import { useAuth } from "../../../auth/useAuth";

export function AdminNewProductPage() {
  const { token, logout } = useAuth();

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceCts, setPriceCts] = useState(2500);
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR");
  const [inStock, setInStock] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setStatus(null);
    try {
      await createProduct(token, {
        slug,
        title,
        description: description.trim() ? description : null,
        images: [],
        priceCts: Number(priceCts),
        currency,
        inStock,
      });
      setStatus("Created!");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">New product</h1>
        <button className="text-sm underline" onClick={logout} type="button">
          Logout
        </button>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <div className="text-sm font-medium">Slug</div>
          <input
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="poster-tour-2026"
          />
          <p className="mt-1 text-xs text-zinc-500">lowercase, chiffres, tirets</p>
        </label>

        <label className="block">
          <div className="text-sm font-medium">Title</div>
          <input
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Description</div>
          <textarea
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm font-medium">Price (cents)</div>
            <input
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
              type="number"
              min={0}
              value={priceCts}
              onChange={(e) => setPriceCts(Number(e.target.value))}
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium">Currency</div>
            <select
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "EUR" | "USD")}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          <span className="text-sm">In stock</span>
        </label>

        {status ? <p className="text-sm">{status}</p> : null}

        <button
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Creating…" : "Create product"}
        </button>
      </form>
    </main>
  );
}
