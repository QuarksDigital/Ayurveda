import Reveal from "@/components/ui/Reveal";

// Placeholder figures - replace with the client's real numbers.
const STATS = [
  { value: "2.4 lakh+", label: "orders delivered" },
  { value: "4.6", label: "average rating" },
  { value: "120+", label: "tests per batch" },
  { value: "19,000", label: "pincodes served" },
];

export default function Stats() {
  return (
    <Reveal as="section" className="bg-bone py-24 md:py-32">
      <div className="container-x grid grid-cols-2 gap-y-14 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} data-reveal className="text-center">
            <p className="headline text-4xl md:text-6xl">{s.value}</p>
            <p className="mt-2 text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
