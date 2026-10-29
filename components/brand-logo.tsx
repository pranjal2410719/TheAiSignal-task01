import Link from "next/link";

export function BrandLogo() {
  return (
    <Link className="brand" href="/" aria-label="OneAtlas home">
      <span className="brand-icon-wrap shrink-0">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
          <rect width="24" height="24" rx="7" fill="#10b981" />
          <circle cx="12" cy="12" r="6.25" fill="none" stroke="#062015" strokeWidth="1.4" />
          <path
            d="M5.75 12h12.5M12 5.75c2 1.8 2 10.7 0 12.5M12 5.75c-2 1.8-2 10.7 0 12.5"
            fill="none"
            stroke="#062015"
            strokeWidth="1.1"
            opacity="0.65"
          />
          <circle cx="15.6" cy="9.2" r="1.8" stroke="#062015" strokeWidth="0.9" fill="#ffffff" />
        </svg>
      </span>
      <span className="brand-text text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
        <span>OneAtlas</span>
        <span className="text-slate-500 font-normal text-xs hidden sm:inline">/ The AI Signal</span>
      </span>
    </Link>
  );
}
