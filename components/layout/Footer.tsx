import Link from "next/link";
import Logo from "./Logo";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop?category=immunity", label: "Immunity" },
      { href: "/shop?category=stress-sleep", label: "Stress & Sleep" },
      { href: "/shop?category=digestion", label: "Digestion" },
      { href: "/shop?category=skin-hair", label: "Skin & Hair" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/#process", label: "Our process" },
      { href: "/#doshas", label: "Know your dosha" },
      { href: "#", label: "Lab reports" },
      { href: "#", label: "Contact us" },
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

export default function Footer() {
  return (
    <footer className="bg-bone text-[13px] text-muted">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <span className="text-ink">
              <Logo />
            </span>
            <p className="mt-4 max-w-xs leading-relaxed">
              Classical Ayurvedic formulations, GMP-manufactured and third-party lab tested. Made in India.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-3 font-semibold text-ink">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs md:flex-row md:justify-between">
          <p>Copyright © 2026 Ayurveda Wellness Pvt. Ltd. All rights reserved.</p>
          <p>Not intended to diagnose, treat, cure or prevent any disease. Consult a qualified practitioner.</p>
        </div>
      </div>
    </footer>
  );
}
