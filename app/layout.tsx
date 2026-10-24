import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Inter_Tight } from "next/font/google";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { CartProvider } from "@/components/providers/CartProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import Loader from "@/components/layout/Loader";
import Cursor from "@/components/layout/Cursor";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const interTight = Inter_Tight({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const cormorant = Cormorant_Garamond({ variable: "--font-serif", subsets: ["latin"], weight: ["500"], style: ["italic"] });

export const metadata: Metadata = {
  title: { default: "Mirasha - The Art of Inner Harmony", template: "%s - Mirasha" },
  description:
    "Mirasha is a premium Ayurvedic and modern wellness range: Shilajit resin and gummies, multivitamin and magnesium gummies, collagen, vitamin B12, apple cider vinegar tablets, rosemary oil and more. Delivered across India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} ${cormorant.variable} antialiased`}>
      <body className="min-h-screen">
        <CartProvider>
          <SmoothScroll>
            <Header />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
            <Loader />
            <Cursor />
          </SmoothScroll>
        </CartProvider>
      </body>
    </html>
  );
}
