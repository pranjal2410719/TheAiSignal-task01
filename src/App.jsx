import { useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleDot,
  Menu,
  MoveUpRight,
  Radio,
  Sparkles,
  X,
} from "lucide-react";

const stories = [
  {
    number: "01",
    category: "THE BIG PICTURE",
    title: "AI is moving fast. Your understanding should move faster.",
    description:
      "A grounded look at the breakthroughs, people, and ideas shaping what comes next.",
    icon: BrainCircuit,
    tone: "violet",
  },
  {
    number: "02",
    category: "TOOLS & BUILDING",
    title: "From new model to useful workflow.",
    description:
      "Practical tools and techniques you can put to work, without the noise.",
    icon: AudioLines,
    tone: "lime",
  },
  {
    number: "03",
    category: "WHAT'S NEXT",
    title: "Read the signal before it becomes the headline.",
    description:
      "Emerging patterns in AI, explained with context instead of hype.",
    icon: Radio,
    tone: "orange",
  },
];

const topics = ["AI research", "Useful tools", "Builders & ideas"];

function App() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailError, setEmailError] = useState("");

  function handleSubscribe(event) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address to continue.");
      return;
    }
    setEmailError("");
    setSubscribed(true);
  }

  return (
    <div className="site-shell">
      <div className="announcement">
        <span className="announcement-dot" />
        THE FUTURE ISN'T WAITING. NEITHER SHOULD YOU.
        <ArrowUpRight size={13} aria-hidden="true" />
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="The AI Signal home">
          <span className="brand-mark"><AudioLines size={22} strokeWidth={2.4} /></span>
          <span>the ai<span className="brand-light">signal</span><span className="brand-period">.</span></span>
        </a>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={menuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
          <a href="#why" onClick={() => setMenuOpen(false)}>The signal</a>
          <a href="#topics" onClick={() => setMenuOpen(false)}>What you'll get</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>Our approach</a>
          <a className="nav-cta" href="#subscribe" onClick={() => setMenuOpen(false)}>
            Get the signal <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero section-wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> YOUR AI ADVANTAGE STARTS HERE</div>
            <h1>Less noise.<br />More <span className="highlight-word">signal.</span></h1>
            <p className="hero-description">
              AI is changing everything. Get a clearer picture of what matters,
              what’s real, and what to do next.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#subscribe">
                Stay in the loop <ArrowRight size={17} />
              </a>
              <a className="text-link" href="#why">Explore the signal <ArrowDownRight size={16} /></a>
            </div>
            <div className="hero-footnote">
              <span className="avatar-stack" aria-hidden="true">
                <span>AI</span><span>ML</span><span>↗</span>
              </span>
              <span>For the curious, the builders, and the future-ready.</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Abstract AI signal visualization">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-orbit orbit-three" />
            <div className="art-grid" />
            <div className="signal-core">
              <div className="core-inner"><AudioLines size={48} strokeWidth={1.5} /></div>
            </div>
            <div className="signal-label label-top"><span className="live-dot" /> SIGNAL DETECTED</div>
            <div className="signal-label label-bottom">FIG. 001 — THE AI SHIFT</div>
            <div className="floating-card card-left">
              <span className="mini-icon mini-violet"><Sparkles size={15} /></span>
              <span><strong>Ideas, decoded.</strong><small>Clarity over complexity</small></span>
            </div>
            <div className="floating-card card-right">
              <span className="mini-icon mini-lime"><CircleDot size={15} /></span>
              <span><strong>Future, focused.</strong><small>Signal over noise</small></span>
            </div>
            <span className="art-coordinate coord-one">AI / 01</span>
            <span className="art-coordinate coord-two">∞ POSSIBILITIES</span>
          </div>
          <div className="hero-index"><span>01</span><span className="index-rule" /><span>SCROLL TO EXPLORE</span></div>
        </section>

        <section className="ticker" aria-label="Topics">
          <div className="ticker-track">
            {[...topics, ...topics, ...topics].map((topic, index) => (
              <span className="ticker-item" key={`${topic}-${index}`}>
                <Sparkles size={14} /> {topic}
              </span>
            ))}
          </div>
        </section>

        <section className="intro-section section-wrap" id="why">
          <div className="section-kicker"><span>01 / THE SIGNAL</span><span className="kicker-rule" /></div>
          <div className="intro-grid">
            <h2>The world doesn't need<br />more AI <span className="muted-word">noise.</span></h2>
            <div className="intro-copy">
              <p>
                It needs people who can make sense of it. The AI Signal is a starting
                point for understanding the technology reshaping how we live, work,
                and create.
              </p>
              <p>
                No breathless predictions. No jargon for the sake of it. Just useful
                context to help you think clearly and build confidently.
              </p>
            </div>
          </div>
        </section>

        <section className="topics-section section-wrap" id="topics">
          <div className="section-kicker"><span>02 / WHAT'S INSIDE</span><span className="kicker-rule" /></div>
          <div className="topics-heading">
            <h2>Follow what <span className="highlight-word">matters.</span></h2>
            <p>A little less scrolling. A lot more understanding.</p>
          </div>
          <div className="story-grid">
            {stories.map(({ number, category, title, description, icon: Icon, tone }) => (
              <article className="story-card" key={number}>
                <div className="story-card-top">
                  <span className="story-number">{number}</span>
                  <span className={`story-icon ${tone}`}><Icon size={21} strokeWidth={1.7} /></span>
                </div>
                <div className="story-category">{category}</div>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="story-card-bottom"><span>EXPLORE THE IDEA</span><MoveUpRight size={16} /></div>
              </article>
            ))}
          </div>
        </section>

        <section className="approach-section" id="about">
          <div className="approach-inner section-wrap">
            <div className="approach-visual">
              <div className="approach-ring ring-a" />
              <div className="approach-ring ring-b" />
              <div className="approach-cross">+</div>
              <div className="approach-center"><Sparkles size={29} /></div>
              <span className="approach-tag tag-a">CONTEXT</span>
              <span className="approach-tag tag-b">CURIOSITY</span>
              <span className="approach-tag tag-c">CLARITY</span>
            </div>
            <div className="approach-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> 03 / OUR APPROACH</div>
              <h2>Curious by nature.<br /><span className="highlight-word">Clear</span> by design.</h2>
              <p>
                The best way to understand a fast-moving world isn't to chase every
                update. It's to connect the dots, ask better questions, and focus on
                what can actually make a difference.
              </p>
              <ul className="principles-list">
                <li><Check size={16} /> Context before conclusions</li>
                <li><Check size={16} /> Practical over performative</li>
                <li><Check size={16} /> Curiosity without the hype</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="subscribe-section section-wrap" id="subscribe">
          <div className="subscribe-panel">
            <div className="subscribe-glow" />
            <div className="subscribe-content">
              <div className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT CHAPTER STARTS HERE</div>
              <h2>Make sense of<br />what's <span className="highlight-word">next.</span></h2>
              <p>Get closer to the ideas shaping tomorrow. Start with a little more signal.</p>
              {subscribed ? (
                <div className="success-message" role="status">
                  <span className="success-icon"><Check size={18} /></span>
                  <span><strong>You're on the list.</strong><small>This demo confirms your sign-up locally. No email was sent.</small></span>
                </div>
              ) : (
                <form className="subscribe-form" onSubmit={handleSubscribe} noValidate>
                  <label className="sr-only" htmlFor="email">Your email address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); setEmailError(""); }}
                    aria-describedby={emailError ? "email-error" : undefined}
                  />
                  <button className="button button-primary" type="submit">Count me in <ArrowRight size={16} /></button>
                  {emailError && <span className="form-error" id="email-error" role="alert">{emailError}</span>}
                </form>
              )}
              <div className="privacy-note"><Check size={13} /> No spam. No hype. Just a demo signup interaction.</div>
            </div>
            <div className="subscribe-side">
              <div className="side-symbol"><AudioLines size={44} /></div>
              <span>STAY CURIOUS</span>
              <span className="side-line" />
              <span>KEEP LOOKING FORWARD</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer section-wrap">
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark"><AudioLines size={20} strokeWidth={2.4} /></span>
          <span>the ai<span className="brand-light">signal</span><span className="brand-period">.</span></span>
        </a>
        <p>A clearer view of what's next.</p>
        <div className="footer-right"><span>BUILT FOR THE CURIOUS</span><a href="#top" aria-label="Back to top"><ChevronDown size={16} /></a></div>
      </footer>
    </div>
  );
}

export default App;
