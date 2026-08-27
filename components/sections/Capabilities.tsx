import { Reveal } from "@/components/Reveal";
import CatalogVideo from "@/components/CatalogVideo";

const CODE_SAMPLE = [
  "POST /ai/jobs/try-on",
  '{ "quality_profile": "interactive" }',
  "",
  "→ 202 Accepted, ~9ms",
  '{ "status": "queued" }',
  "",
  "→ GET /ai/jobs/:id, ~15s later",
  '{ "status": "completed" }',
].join("\n");

export default function Capabilities() {
  return (
    <section className="wrap section" id="platform">
      <Reveal className="section-head center">
        <h2 className="section-title">One catalog. Six things it can now do.</h2>
        <p className="section-sub">The same engine underneath every surface — not six separate integrations.</p>
      </Reveal>

      <Reveal className="feature-row" y={24}>
        <div className="feature-copy">
          <div className="feature-kicker">Catalog Automation</div>
          <h3>Turn raw product photos into a real catalog, automatically.</h3>
          <p>
            Every image gets a real category, a clean background removal, and a generated
            studio-style shot — the same pipeline that makes a customer&rsquo;s phone photo
            catalog-ready makes your product photography catalog-ready too.
          </p>
          <ul>
            <li>Category, color, and construction detected automatically, not tagged by hand</li>
            <li>A second AI pass reviews every generated image for fidelity before it&rsquo;s returned</li>
            <li>Works from a single photo — no reshoot required to get started</li>
          </ul>
        </div>
        <div className="feature-visual">
          <CatalogVideo />
        </div>
      </Reveal>

      <Reveal className="feature-row reverse" y={24}>
        <div className="feature-copy">
          <div className="feature-kicker">Virtual Try-On</div>
          <h3>Multi-garment try-on, checked for realism before it ships.</h3>
          <p>
            Up to four garments composited onto a real customer photo or a reusable avatar — role
            conflicts (two tops, duplicate footwear) are rejected before a single generation call
            runs, and every result is reviewed for fidelity automatically.
          </p>
          <ul>
            <li>Interactive mode returns a usable result in roughly 15 seconds — production-benchmarked, not a demo number</li>
            <li>A quality-checked async job queue, not a blocking request your frontend has to wait on</li>
            <li>Single-garment mode still works if that&rsquo;s all you need to start</li>
          </ul>
        </div>
        <div className="feature-visual">
          <div className="slider-mock">
            <div className="half before"><svg viewBox="0 0 24 24" width={70} style={{ color: "var(--ink)" }}><use href="#g-dress" /></svg></div>
            <div className="half after"><svg viewBox="0 0 24 24" width={70} style={{ color: "var(--coral2)" }}><use href="#g-dress" /></svg></div>
            <div className="handle" />
          </div>
          <div className="slider-label l">Before</div>
          <div className="slider-label r">After</div>
        </div>
      </Reveal>

      <Reveal className="feature-row" y={24}>
        <div className="feature-copy">
          <div className="feature-kicker">Reusable Avatars</div>
          <h3>Set up once. Try on anything after that.</h3>
          <p>
            A customer uploads a headshot once; EditMe generates a realistic, neutral-pose
            full-body avatar they reuse for every try-on after that — no new upload required per
            session.
          </p>
          <ul>
            <li>Works from a headshot alone; a full-body reference photo sharpens proportions but isn&rsquo;t required</li>
            <li>Every avatar is reviewed for identity resemblance and try-on suitability before it&rsquo;s handed back</li>
          </ul>
        </div>
        <div className="feature-visual">
          <div className="mini-grid">
            <div className="mini-card" style={{ background: "linear-gradient(155deg, rgba(46,77,86,0.35), rgba(46,77,86,0.05))" }}>
              <svg viewBox="0 0 24 24" style={{ color: "var(--ink)" }}><use href="#g-tee" /></svg>
            </div>
            <div className="mini-card" style={{ background: "linear-gradient(155deg, rgba(255,107,71,0.16), rgba(255,107,71,0.02))" }}>
              <svg viewBox="0 0 24 24" style={{ color: "var(--ink)" }}><use href="#g-jacket" /></svg>
            </div>
            <div className="mini-card" style={{ background: "linear-gradient(155deg, rgba(231,203,160,0.16), rgba(231,203,160,0.02))" }}>
              <svg viewBox="0 0 24 24" style={{ color: "var(--ink)" }}><use href="#g-dress" /></svg>
            </div>
          </div>
          <div className="count-pill">One avatar, reused for every try-on</div>
        </div>
      </Reveal>

      <Reveal className="feature-row reverse" y={24}>
        <div className="feature-copy">
          <div className="feature-kicker">Outfit Intelligence</div>
          <h3>Rank real combinations from your real catalog — not a hardcoded rule set.</h3>
          <p>
            Send catalog metadata plus context — weather, occasion, a customer&rsquo;s stated
            preferences — and get back ranked outfit combinations with a stated rationale and
            confidence score, plus flagged gaps if a slot is genuinely missing.
          </p>
          <ul>
            <li>Scored on compatibility, weather fit, occasion fit, and preference fit — not one opaque number</li>
            <li>Detects missing pieces and can auto-shop for real, groundable replacements</li>
            <li>Works from your metadata alone — no images required for ranking itself</li>
          </ul>
        </div>
        <div className="feature-visual">
          <div className="analytics-art">
            <div className="donut" />
            <div className="bars">
              <div className="bar-row"><span className="dot" style={{ background: "var(--coral)" }} /><div className="bar-track"><div className="bar-fill" style={{ width: "92%", background: "var(--coral)" }} /></div></div>
              <div className="bar-row"><span className="dot" style={{ background: "#3d6672" }} /><div className="bar-track"><div className="bar-fill" style={{ width: "85%", background: "#3d6672" }} /></div></div>
              <div className="bar-row"><span className="dot" style={{ background: "var(--gold)" }} /><div className="bar-track"><div className="bar-fill" style={{ width: "78%", background: "var(--gold)" }} /></div></div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="feature-row" y={24}>
        <div className="feature-copy">
          <div className="feature-kicker">Built for Engineering Teams</div>
          <h3>A real API, not a black-box widget.</h3>
          <p>
            Every endpoint is documented with exact request and response schemas, returns usage
            and cost breakdowns per call, and separates interactive-speed generation from
            premium-quality batch generation — so your team builds against it like infrastructure,
            not a demo.
          </p>
          <ul>
            <li>Async job endpoints for every image-generation route — accept in milliseconds, poll for the result</li>
            <li>Two quality profiles: interactive (~15s, for a live storefront) and premium (4K, for catalog/export work)</li>
            <li>Per-call usage, pricing, and cost breakdown returned with every response — nothing to guess at</li>
          </ul>
        </div>
        <div className="feature-visual" style={{ padding: 0 }}>
          <div className="code-mock">
            <div className="code-mock-dots"><span /><span /><span /></div>
            <pre>{CODE_SAMPLE}</pre>
          </div>
        </div>
      </Reveal>

      <Reveal className="feature-row reverse" y={24}>
        <div className="feature-copy">
          <div className="feature-kicker">How We Work With You</div>
          <h3>A measurable pilot before a platform commitment.</h3>
          <p>
            We&rsquo;d rather prove a conversion or return-rate change on a slice of your real
            traffic than sell a year-long contract on a promise. Pricing scales with usage, not
            headcount — pay for what actually runs against your catalog.
          </p>
          <ul>
            <li>Start on a subset of SKUs and a slice of traffic, not a full catalog migration</li>
            <li>No fabricated benchmark numbers — every number your team sees is measured on your own store</li>
            <li>A small team by design right now — design partners get direct access to the people building this</li>
          </ul>
        </div>
        <div className="feature-visual">
          <div className="cal-art">
            <div className="cal-row">
              <div className="cal-cell">1</div>
              <div className="cal-cell">2</div>
              <div className="cal-cell">3</div>
              <div className="cal-cell">4</div>
              <div className="cal-cell">5</div>
              <div className="cal-cell active"><svg viewBox="0 0 24 24" style={{ color: "var(--coral2)" }}><use href="#g-sparkle" /></svg></div>
            </div>
            <div className="cal-pill">Week 6 · Pilot review</div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
