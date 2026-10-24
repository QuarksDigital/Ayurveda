import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";

// Placeholder reviews - replace with verified customer reviews before launch.
const REVIEWS = [
  { quote: "The Shilajit resin is the real thing. I've noticed a steady difference in my energy through the day.", name: "Customer name", city: "Delhi", product: "Shilajit Resin" },
  { quote: "Finally an apple cider vinegar I actually enjoy taking. One tablet in water every morning.", name: "Customer name", city: "Gurugram", product: "Apple Cider Dissolving Tablet" },
  { quote: "The magnesium gummies have become part of my bedtime routine. Lovely taste, too.", name: "Customer name", city: "Noida", product: "Magnesium Gummies" },
];

export default function Testimonials() {
  return (
    <Reveal as="section" className="py-24 md:py-36">
      <div className="container-x">
        <SectionHead center eyebrow="Reviews" title="Loved by our customers." />
        <div className="grid gap-5 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <figure key={i} data-reveal className="flex flex-col rounded-[28px] bg-bone p-8 md:p-10">
              <p className="text-sm tracking-widest text-gold">★★★★★</p>
              <blockquote className="mt-5 text-xl leading-snug tracking-tight">“{r.quote}”</blockquote>
              <figcaption className="mt-auto pt-8 text-sm">
                <p className="font-semibold">
                  {r.name}, {r.city}
                </p>
                <p className="mt-0.5 text-muted">{r.product}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
