export default function SectionHead({
  eyebrow,
  title,
  subtitle,
  action,
  center = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`mb-12 flex flex-col gap-6 md:mb-16 ${center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={center ? "max-w-3xl" : "max-w-2xl"}>
        {eyebrow && (
          <p data-reveal className="eyebrow mb-3">
            {eyebrow}
          </p>
        )}
        <h2 data-reveal className="headline text-4xl md:text-6xl">
          {title}
        </h2>
        {subtitle && (
          <p data-reveal className="mt-5 text-lg leading-relaxed text-muted md:text-xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div data-reveal>{action}</div>}
    </div>
  );
}
