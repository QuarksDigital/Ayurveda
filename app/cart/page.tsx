import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Your bag" };

export default function CartPage() {
  return (
    <div className="pt-14">
      <div className="container-x pb-32 pt-16 md:pt-24">
        <h1 className="headline text-5xl md:text-6xl">Your bag.</h1>
        <CartView />
      </div>
    </div>
  );
}
