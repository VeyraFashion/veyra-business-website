import BrandMark from "@/components/BrandMark";
import { ArrowRight, Check } from "lucide-react";
import BookWalkthrough from "@/components/home/BookWalkthrough";
import ComparisonTable from "@/components/home/ComparisonTable";
import CostOfUncertainty from "@/components/home/CostOfUncertainty";
import DemoShowcase from "@/components/home/DemoShowcase";
import EvidenceBlock from "@/components/home/EvidenceBlock";
import Faq from "@/components/home/Faq";
import HeroReveal from "@/components/home/HeroReveal";
import MobileNav from "@/components/home/MobileNav";
import RoiCalculator from "@/components/home/RoiCalculator";
import { StoreInputsProvider } from "@/components/home/StoreInputs";

const TRY_ON_CODE = `// Queue the work and keep the PDP responsive
POST /ai/jobs/try-on

{
  "quality_profile": "interactive",
  "garments": [
    { "role": "base_top" },
    { "role": "outerwear" }
  ]
}

// 202 Accepted
{ "status": "queued", "job_id": "..." }`;

const PILOT_STEPS = [
  {
    n: "01",
    title: "Choose the surface",
    body: "Product-page try-on, complete-look styling, cart styling, or one category.",
  },
  {
    n: "02",
    title: "Choose the eligible catalogue",
    body: "5–25 representative SKUs to validate integration; a larger sample where commercial measurement needs it.",
  },
  {
    n: "03",
    title: "Define the control",
    body: "Randomly assign eligible sessions to STYLD or a control where your traffic allows.",
  },
  {
    n: "04",
    title: "Report the business metrics",
    body: "Activation, add-to-cart, conversion, AOV, units per order, revenue per eligible session, cancellations, return rate and reason.",
  },
] as const;

export default function BusinessHome() {
  return (
    <StoreInputsProvider>
      <main className="business-home" id="top">
        <a className="home-skip-link" href="#main-content">
          Skip to content
        </a>

        <header className="home-nav" aria-label="Primary navigation">
          <div className="home-shell home-nav-inner">
            <a className="home-mark" href="#top" aria-label="STYLD for Business home">
              <span className="home-mark-symbol" aria-hidden="true"><BrandMark /></span>
              <span>STYLD</span>
            </a>
            <nav className="home-nav-links" aria-label="Homepage sections">
              <a href="#demo">See it work</a>
              <a href="#difference">Why it&rsquo;s different</a>
              <a href="#evidence">Results</a>
              <a href="#live">Go live</a>
            </nav>
            <MobileNav />
            <a className="home-nav-cta" href="#book">
              Book a walkthrough <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </header>

        <div id="main-content">
          <section className="home-hero home-shell" aria-labelledby="hero-title">
            <div className="home-hero-copy">
              <p className="home-overline">Virtual try-on + outfit intelligence for fashion commerce</p>
              <h1 id="hero-title">Make &ldquo;Will this suit me?&rdquo; answerable &mdash; and measurable.</h1>
              <p className="home-hero-lede">
                Your shopper uses one photo and sees the garment on themselves, inside your
                storefront. No re-platforming.
              </p>
              <div className="home-actions">
                <a className="home-cta-primary" href="#book">
                  Book a 20-minute walkthrough <ArrowRight size={17} aria-hidden="true" />
                </a>
                <a className="home-cta-quiet" href="#demo">
                  See it in action <ArrowRight size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
            <HeroReveal />
          </section>

          <div className="home-rail">
            <div className="home-shell home-rail-inner">
              <span>Your brand and interface stay in front</span>
              <span aria-hidden="true">/</span>
              <span>Start on one measurable surface</span>
              <span aria-hidden="true">/</span>
              <span>Performance measured on <strong>your</strong> traffic</span>
            </div>
          </div>

          <section className="home-cost" aria-labelledby="cost-title">
            <div className="home-shell home-cost-grid">
              <div>
                <p className="home-overline is-lime">The cost of uncertainty</p>
                <h2 id="cost-title">
                  Every garment a shopper can&rsquo;t picture on themselves is a return waiting
                  to happen.
                </h2>
                <p className="home-cost-copy">
                  Fashion returns are driven by fit and appearance &mdash; decisions a flat
                  product photo can&rsquo;t settle. The revenue leaves your P&amp;L twice: once
                  as the order you never won, and again as the parcel you pay to bring back.
                </p>
                <p className="home-cost-note">
                  Figures beside this are arithmetic on the inputs shown, not a STYLD result.
                  Edit them in the calculator further down.
                </p>
              </div>
              <CostOfUncertainty />
            </div>
          </section>

          <section className="home-section home-shell" id="demo" aria-labelledby="demo-title">
            <div className="home-section-intro">
              <p className="home-overline">See STYLD work</p>
              <h2 id="demo-title">Four moments. Four different outputs.</h2>
              <p>
                Each tab shows what the shopper actually ends up looking at &mdash; not a
                diagram of where a button would go.
              </p>
            </div>

            <DemoShowcase />

            <div className="home-demo-foot">
              <p>Want to see this on one of your own products?</p>
              <a href="#book">
                Send us a product URL <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
          </section>

          <section className="home-section home-difference" id="difference" aria-labelledby="difference-title">
            <div className="home-shell">
              <div className="home-section-intro">
                <p className="home-overline">Why not just&hellip;</p>
                <h2 id="difference-title">Recommendation engines don&rsquo;t know what an outfit is.</h2>
                <p>
                  Most of these are already in your stack. Here&rsquo;s what each category
                  structurally can&rsquo;t do.
                </p>
              </div>
              <ComparisonTable />
            </div>
          </section>

          <section className="home-section home-shell" id="evidence" aria-labelledby="evidence-title">
            <div className="home-section-intro">
              <p className="home-overline">Published retailer evidence</p>
              <h2 id="evidence-title">Three levers. What retailers have actually measured.</h2>
              <p>
                Ordered by rigour, not by size &mdash; a randomised test is worth more to a
                buying committee than a bigger number from a self-selected group.
              </p>
            </div>
            <EvidenceBlock />
          </section>

          <section className="home-section home-roi" id="roi" aria-labelledby="roi-title">
            <div className="home-shell">
              <div className="home-section-intro">
                <p className="home-overline">Revenue opportunity</p>
                <h2 id="roi-title">What could this be worth on your catalogue?</h2>
                <p>
                  Three numbers to start. Benchmark-informed assumptions applied to your own
                  figures &mdash; a scenario model, which the pilot then replaces with
                  measurement.
                </p>
              </div>
              <RoiCalculator />
            </div>
          </section>

          <section className="home-section home-live" id="live" aria-labelledby="live-title">
            <div className="home-shell">
              <div className="home-section-intro">
                <p className="home-overline">Measurement, not a trial</p>
                <h2 id="live-title">How it goes live.</h2>
                <p>
                  Pilot design, integration, the API and data handling &mdash; in one place,
                  because they&rsquo;re one decision.
                </p>
              </div>

              <div className="home-live-grid">
                <div>
                  <ol className="home-steps">
                    {PILOT_STEPS.map((step) => (
                      <li key={step.n}>
                        <span className="home-step-n">{step.n}</span>
                        <div>
                          <strong>{step.title}</strong>
                          <p>{step.body}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="home-kpi">
                    <span>Recommended executive KPI</span>
                    <strong>Incremental contribution per eligible session, after returns</strong>
                  </div>

                  <div className="home-pending">
                    <span>[Content required]</span>
                    <p>
                      Pilot duration, commercial shape (pilot fee, per-render or per-session),
                      and exit terms. Publish these once agreed &mdash; total silence on
                      commercials stalls more deals than a number does.
                    </p>
                  </div>
                </div>

                <div className="home-live-side">
                  <div className="home-api">
                    <p className="home-overline is-lime">For product and engineering</p>
                    <h3>Your customer sees the experience. Your team keeps control.</h3>
                    <p className="home-api-copy">
                      No re-platforming. One API call per try-on request. Image jobs return
                      immediately with a job ID, so the page never waits.
                    </p>
                    <div className="home-code">
                      <div className="home-code-bar">
                        <span>try-on.ts</span>
                        <span>Interactive job</span>
                      </div>
                      <pre><code>{TRY_ON_CODE}</code></pre>
                      <div className="home-code-foot">
                        <span><span className="home-status-dot" aria-hidden="true" /> Storefront stays responsive</span>
                      </div>
                    </div>
                    <p className="home-api-pending">
                      <strong>[Content required]</strong> typical job completion time, added PDP
                      payload, uptime target, and a documentation link.
                    </p>
                  </div>

                  <div className="home-data">
                    <h3>Shopper photos and data</h3>
                    <ul>
                      <li><Check size={15} aria-hidden="true" /> One JPEG, PNG or WebP full-body photo, capped at 8&nbsp;MB</li>
                      <li><Check size={15} aria-hidden="true" /> Photo bytes are excluded from STYLD API logs</li>
                      <li><Check size={15} aria-hidden="true" /> Technical suitability is validated before any generation job starts</li>
                      <li><Check size={15} aria-hidden="true" /> Only your known catalogue is ranked &mdash; no external inventory</li>
                      <li className="is-pending">
                        [Content required] retention window, processing region, sub-processors,
                        consent copy
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="home-section home-shell" aria-labelledby="trust-title">
            <div className="home-section-intro">
              <p className="home-overline">Who you&rsquo;d be working with</p>
              <h2 id="trust-title">
                A small team, a narrow product, and a short list of design partners.
              </h2>
            </div>

            <div className="home-trust-grid">
              <div className="home-person">
                <div className="home-person-photo" aria-hidden="true">Photo</div>
                <strong>[Content required]</strong>
                <p>
                  Founder name, role, and one line of relevant background. This is the
                  highest-trust-per-pixel element currently missing from the site.
                </p>
              </div>
              <div className="home-person">
                <div className="home-person-photo" aria-hidden="true">Photo</div>
                <strong>[Content required]</strong>
                <p>Second founder or technical lead. Do not fabricate names, titles or history.</p>
              </div>
              <div className="home-partner">
                <p className="home-overline">Design-partner programme</p>
                <h3>We&rsquo;re taking on a small number of brands for the coming season.</h3>
                <p>
                  A defined surface, a defined KPI, a randomised control, and preferential
                  terms in exchange for measurement we can both learn from.
                </p>
                <p className="home-partner-pending">
                  [Content required] &mdash; slot count, season dates and terms.
                </p>
                <a href="#book">
                  Ask about a slot <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>

          <section className="home-section home-faq-section" aria-labelledby="faq-title">
            <div className="home-shell home-faq-grid">
              <div className="home-section-intro">
                <p className="home-overline">Useful questions</p>
                <h2 id="faq-title">What a retail team should ask before a pilot.</h2>
              </div>
              <Faq />
            </div>
          </section>

          <section className="home-section home-book" id="book" aria-labelledby="book-title">
            <div className="home-shell">
              <BookWalkthrough />
            </div>
          </section>
        </div>

        <footer className="home-footer">
          <div className="home-shell home-footer-main">
            <div>
              <a className="home-mark home-mark-footer" href="#top">
                <span className="home-mark-symbol" aria-hidden="true"><BrandMark /></span>
                <span>STYLD</span>
              </a>
              <p>Measurable purchase confidence for fashion commerce.</p>
              <p className="home-footer-pending">
                [Content required] legal entity, registered city, privacy contact, LinkedIn,
                documentation link.
              </p>
            </div>
            <div className="home-footer-links">
              <a href="#demo">See it work</a>
              <a href="#difference">Why it&rsquo;s different</a>
              <a href="#evidence">Results</a>
              <a href="#roi">ROI</a>
              <a href="#live">Go live</a>
              <a href="#book">Book a walkthrough</a>
            </div>
          </div>
          <div className="home-shell home-footer-bottom">
            <span>&copy; 2026 STYLD</span>
            <span>Built for confidence, measured on real traffic.</span>
          </div>
        </footer>
      </main>
    </StoreInputsProvider>
  );
}
