import { AudioLines } from "lucide-react";

export function BrandLogo() {
  return <a className="brand" href="/" aria-label="The AI Signal home"><span className="brand-icon"><AudioLines size={17} aria-hidden="true" /></span><span>The AI Signal <span className="muted">/ OneAtlas</span></span></a>;
}
