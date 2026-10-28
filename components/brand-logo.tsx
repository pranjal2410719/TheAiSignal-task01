import Link from "next/link";
import { AudioLines } from "lucide-react";

export function BrandLogo() {
  return <Link className="brand" href="/" aria-label="The AI Signal home"><span className="brand-icon"><AudioLines size={17} aria-hidden="true" /></span><span>The AI Signal <span className="muted">/ OneAtlas</span></span></Link>;
}
