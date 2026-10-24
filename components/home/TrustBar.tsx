const ITEMS = [
  { title: "Premium ingredients", body: "Carefully sourced, high quality" },
  { title: "Science-backed", body: "Modern nutrition science" },
  { title: "Lab tested", body: "Quality checked every batch" },
  { title: "Free delivery", body: "On orders over ₹499" },
];

export default function TrustBar() {
  return (
    <section className="border-b border-line/60">
      <div className="container-x grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.title} className="text-center">
            <p className="text-[15px] font-semibold">{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
