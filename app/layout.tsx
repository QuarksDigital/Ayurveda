import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
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

export const metadata: Metadata = {
  title: { default: "Ayurveda - Classical formulations, modern precision", template: "%s - Ayurveda" },
  description:
    "Lab-tested, GMP-certified Ayurvedic medicines and wellness formulations. Ashwagandha, Triphala, Chyawanprash, Shilajit and more, delivered across India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} antialiased`}>
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
