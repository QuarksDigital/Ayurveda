import type { Metadata } from "next";
import { Suspense } from "react";
import ShopGrid from "@/components/shop/ShopGrid";
import { getCategories, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Browse lab-tested Ayurvedic medicines for immunity, stress, digestion, skin, hair, joints and more.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="pt-14">
      <header className="container-x pb-10 pt-16 md:pt-24">
        <h1 className="headline text-5xl md:text-7xl">Shop.</h1>
        <p className="mt-4 max-w-xl text-lg text-muted md:text-xl">{products.length} classical formulations, each one lab tested.</p>
      </header>
      <Suspense fallback={<p className="container-x text-muted">Loading…</p>}>
        <ShopGrid products={products} categories={categories} />
      </Suspense>
    </div>
  );
}
