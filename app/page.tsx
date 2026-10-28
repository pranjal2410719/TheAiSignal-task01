import Link from "next/link";
import { ArrowRight, AudioLines, BrainCircuit, Radio } from "lucide-react";

export default function HomePage() {
  return <main id="top" className="page-shell">
    <header className="topbar"><Link className="brand" href="/" aria-label="The AI Signal home"><span className="brand-icon"><AudioLines size={17} /></span><span>The AI Signal</span></Link><nav className="nav" aria-label="Main navigation"><a href="#about">About</a><Link href="/compare">Model comparison</Link></nav></header>
    <div className="wrap">
      <section className="hero">
        <div><p className="kicker">YOUR AI ADVANTAGE STARTS HERE</p><h1>Less noise.<br />More <span className="text-emerald-300">signal.</span></h1><p className="lead">A clearer picture of what matters in AI, what is useful, and what to explore next.</p><div className="mt-6 flex flex-wrap gap-3"><Link className="btn" href="/compare">Explore model comparison <ArrowRight size={16} /></Link><a className="btn btn-secondary" href="#about">Our approach</a></div></div>
        <aside className="panel hero-panel"><div className="feature-row"><BrainCircuit className="text-emerald-300" /><div><strong>Research with context</strong><p>Understand model capabilities without treating sample benchmarks as universal truth.</p></div></div><div className="feature-row"><AudioLines className="text-emerald-300" /><div><strong>Tools for builders</strong><p>Compare technical details and estimate costs against a transparent demo dataset.</p></div></div><div className="feature-row"><Radio className="text-emerald-300" /><div><strong>Signal over noise</strong><p>Use clear assumptions and evidence to make better-informed decisions.</p></div></div></aside>
      </section>
      <section id="about" className="section"><p className="kicker">OUR APPROACH</p><h2 className="text-2xl font-semibold">Make the assumptions visible.</h2><p className="lead">The comparison experience uses an illustrative local catalog. Prices, provider listings, dates, and benchmark scores are not a live feed and should be independently checked before real-world use.</p></section>
    </div>
  </main>;
}
