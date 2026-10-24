"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { discount, formatPrice } from "@/lib/format";
import { useCart } from "@/components/providers/CartProvider";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const v = product.variants[0];
  const off = discount(v.price, v.mrp);

  return (
    <article className="group flex h-full flex-col">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-[28px] bg-bone">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {product.isBestseller && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium backdrop-blur">Bestseller</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-5">
        <p className="text-xs font-medium text-green">{product.form}</p>
        <Link href={`/products/${product.slug}`} className="mt-1 text-lg font-semibold leading-snug tracking-tight hover:underline">
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{product.tagline}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-[15px]">
            <span className="font-semibold">{formatPrice(v.price)}</span>
            {off > 0 && <span className="ml-2 text-muted line-through">{formatPrice(v.mrp)}</span>}
          </p>
          <button
            type="button"
            onClick={() =>
              add({ slug: product.slug, sku: v.sku, name: product.name, label: v.label, price: v.price, mrp: v.mrp, image: product.images[0] })
            }
            className="rounded-full bg-bone px-4 py-2 text-sm font-medium text-blue transition-colors hover:bg-blue hover:text-white"
            aria-label={`Add ${product.name} (${v.label}) to bag`}
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
