"use client";

import { useEffect, useState } from "react";
import { postJSON } from "@/lib/client-api";
import type { CartItem, Quote } from "@/lib/types";

/** Server-side price check for the cart - totals shown to the user come from the API. */
export function useQuote(items: CartItem[]) {
  const key = items.map((i) => `${i.sku}:${i.quantity}`).join(",");
  const [result, setResult] = useState<{ key: string; quote: Quote | null; error: string | null }>({
    key: "",
    quote: null,
    error: null,
  });

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    postJSON<Quote>("/cart/quote", { items: items.map(({ slug, sku, quantity }) => ({ slug, sku, quantity })) })
      .then((quote) => !cancelled && setResult({ key, quote, error: null }))
      .catch((e: Error) => !cancelled && setResult({ key, quote: null, error: e.message }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures every field that affects the quote
  }, [key]);

  // Ignore a stale response while the next one is in flight
  const fresh = result.key === key;
  return { quote: fresh ? result.quote : null, error: fresh ? result.error : null };
}
