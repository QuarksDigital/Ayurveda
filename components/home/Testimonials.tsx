import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";

// Placeholder reviews - replace with verified customer reviews before launch.
const REVIEWS = [
  { quote: "I've tried five Ashwagandha brands. This is the only one where I can actually feel the difference in my sleep.", name: "Customer name", city: "Pune", product: "Ashwagandha Root Extract" },
  { quote: "The batch lab report on the box sold me. Triphala that's gentle and works every single morning.", name: "Customer name", city: "Bengaluru", product: "Triphala Churna" },
  { quote: "Our whole family takes the Chyawanprash through winter. It tastes like my grandmother's.", name: "Customer name", city: "Jaipur", product: "Chyawanprash Classic" },
];

export default function Testimonials() {
  return (
    <Reveal as="section" className="py-24 md:py-36">
      <div className="container-x">
        <SectionHead center eyebrow="Reviews" title="Trusted by families across India." />
        <div className="grid gap-5 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <figure key={i} data-reveal className="flex flex-col rounded-[28px] bg-bone p-8 md:p-10">
              <p className="text-sm tracking-widest text-green">★★★★★</p>
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
