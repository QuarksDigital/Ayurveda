import Link from "next/link";
import Logo from "./Logo";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop?category=energy-vitality", label: "Energy & Vitality" },
      { href: "/shop?category=daily-nutrition", label: "Daily Nutrition" },
      { href: "/shop?category=skin-hair", label: "Skin & Hair" },
      { href: "/shop?category=digestion-metabolism", label: "Digestion & Metabolism" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "#", label: "Shipping & delivery" },
      { href: "#", label: "Returns & refunds" },
      { href: "#", label: "Privacy policy" },
      { href: "#", label: "Terms of use" },
    ],
  },
];

// From the client's business card.
const CONTACT = [
  { label: "@mirasha.wellness", href: "https://instagram.com/mirasha.wellness" },
  { label: "+91 98994 91916", href: "tel:+919899491916" },
  { label: "diyamonga25@gmail.com", href: "mailto:diyamonga25@gmail.com" },
  { label: "Delhi NCR, India" },
];

export default function Footer() {
  return (
    <footer className="bg-brand text-[13px] text-white/65">
      <div className="container-x py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <span className="text-[#c9a45c]">
              <Logo height={30} />
            </span>
            <p className="tagline mt-3 text-base text-[#e8dcc0]">The Art of Inner Harmony</p>
            <p className="mt-4 max-w-xs leading-relaxed">Premium Ayurvedic and modern wellness formulations. Made in India.</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-3 font-semibold text-[#c9a45c]">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="mb-3 font-semibold text-[#c9a45c]">Contact</p>
            <ul className="space-y-2.5">
              {CONTACT.map((c) => (
                <li key={c.label}>
                  {c.href ? (
                    <a href={c.href} className="transition-colors hover:text-white" {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                      {c.label}
                    </a>
                  ) : (
                    c.label
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs md:flex-row md:justify-between">
          <p>Copyright © 2026 Mirasha. All rights reserved.</p>
          <p>These products are not intended to diagnose, treat, cure or prevent any disease.</p>
        </div>
      </div>
    </footer>
  );
}
