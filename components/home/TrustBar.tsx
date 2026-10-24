const ITEMS = [
  { title: "GMP certified", body: "Made in a WHO-GMP facility" },
  { title: "Lab tested", body: "Every batch, independently" },
  { title: "AYUSH licensed", body: "Classical formulations" },
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
