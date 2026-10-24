// Placeholder mark - swap for the client's logo (keep the same props).
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] shrink-0" aria-hidden>
        <g transform="rotate(-40 12 12)">
          <rect x="7.5" y="2" width="9" height="20" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7.5 12h9v5.5a4.5 4.5 0 0 1-9 0z" fill="var(--blue)" />
        </g>
      </svg>
      <span className="text-[17px] font-semibold tracking-[-0.02em]">Ayurveda</span>
    </span>
  );
}
