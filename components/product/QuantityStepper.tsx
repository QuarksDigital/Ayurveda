"use client";

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  small = false,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  small?: boolean;
}) {
  const size = small ? "h-8 w-8" : "h-11 w-11";
  return (
    <div className="inline-flex items-center rounded-full border border-line">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(value - 1)}
        disabled={value - 1 < min && min > 0}
        className={`${size} rounded-full text-lg text-muted transition hover:text-ink disabled:opacity-30`}
      >
        −
      </button>
      <span className={`text-center text-sm font-medium tabular-nums ${small ? "w-6" : "w-8"}`}>{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${size} rounded-full text-lg text-muted transition hover:text-ink disabled:opacity-30`}
      >
        +
      </button>
    </div>
  );
}
