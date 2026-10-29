import Link from "next/link";

export function BrandLogo() {
  return (
    <Link className="inline-flex shrink-0 items-center gap-2" href="/" aria-label="Atlas home">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="11" fill="var(--ink)" />
        <ellipse cx="12" cy="12" rx="4.5" ry="11" fill="none" stroke="var(--on-ink)" strokeWidth="1.3" />
        <path d="M1.5 12h21" stroke="var(--on-ink)" strokeWidth="1.3" />
        <circle cx="17" cy="7" r="2.6" fill="#d97757" stroke="var(--ink)" strokeWidth="1.2" />
      </svg>
      <span className="text-[0.98rem] font-semibold tracking-[-0.03em] text-ink">
        Atlas
      </span>
    </Link>
  );
}
