import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";

const STEPS = [
  {
    title: "Sourced at origin.",
    body: "Ashwagandha from Nagaur, Shilajit from 16,000 ft, Amla from Varanasi - every herb traced to where it grows most potent.",
  },
  {
    title: "Purified the classical way.",
    body: "Shodhana and preparation methods from the Charaka and Sharangadhara Samhitas. No shortcuts.",
  },
  {
    title: "Verified in the lab.",
    body: "Each batch is tested by an independent NABL-accredited lab for actives, heavy metals, pesticides and microbes.",
  },
  {
    title: "Sealed and delivered.",
    body: "Packed in light-proof, food-grade packaging and shipped to 19,000+ pincodes in 2–5 days.",
  },
];

export default function Process() {
  return (
    <Reveal as="section" id="process" className="scroll-mt-14 py-24 md:py-36">
      <div className="container-x">
        <SectionHead center eyebrow="Our process" title="From soil to shelf." subtitle="Four steps, the same for every single batch." />
        <ol className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {STEPS.map((s, i) => (
            <li key={s.title} data-reveal>
              <span className="text-sm font-semibold text-blue">0{i + 1}</span>
              <div className="mt-4 h-px bg-line" />
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}
