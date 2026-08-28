import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleCheck,
  Code2,
  ImageIcon,
  Layers3,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";
import CommerceMoment from "@/components/home/CommerceMoment";
import Faq from "@/components/home/Faq";
import PilotChecklist from "@/components/home/PilotChecklist";
import { Button } from "@/components/ui/button";

const GOOGLE_CASE_STUDY =
  "https://cloud.google.com/blog/topics/retail/how-breuninger-boosted-sales-with-its-be-your-own-model-ai";
const ZALANDO_STUDY = "https://arxiv.org/abs/2106.03532";
const TRY_ON_CODE = [
  "// Accept the work without freezing the PDP",
  "POST /ai/jobs/try-on",
  "",
  "{",
  "  \"quality_profile\": \"interactive\",",
  "  \"garments\": [",
  "    { \"role\": \"base_top\" },",
  "    { \"role\": \"outerwear\" }",
  "  ]",
  "}",
  "",
  "// 202 Accepted",
  "{ \"status\": \"queued\", \"job_id\": \"...\" }",
].join("\n");

const capabilities = [
  {
    number: "01",
    icon: UserRound,
    title: "See it on me",
    body: "A shopper uploads a photo once, then tries single pieces or compatible layers without leaving the product journey.",
    detail: "Reusable avatar · multi-garment rules · fidelity review",
  },
  {
    number: "02",
    icon: Layers3,
    title: "Style the whole decision",
    body: "Recommend complete looks from the catalog using the weather, occasion, preference, and what the shopper already selected.",
    detail: "Ranked combinations · missing-piece detection · clear rationale",
  },
  {
    number: "03",
    icon: ImageIcon,
    title: "Prepare every product",
    body: "Turn inconsistent uploads into clean cutouts and a consistent studio presentation before they reach the customer experience.",
    detail: "Garment analysis · background removal · visual QA",
  },
  {
    number: "04",
    icon: Code2,
    title: "Keep your storefront",
    body: "Use the API behind your own interface or start with a focused surface. Image work runs asynchronously, so the page stays responsive.",
    detail: "Documented schemas · queued image jobs · usage visibility",
  },
] as const;

export default function BusinessHome() {
  return (
    <main className="business-home" id="top">
      <a className="home-skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="home-nav" aria-label="Primary navigation">
        <div className="home-shell home-nav-inner">
          <a className="home-mark" href="#top" aria-label="Veyra for Business home">
            <span className="home-mark-symbol" aria-hidden="true">V</span>
            <span>Veyra</span>
            <span className="home-mark-context">for business</span>
          </a>
          <nav className="home-nav-links" aria-label="Homepage sections">
            <a href="#product">Product</a>
            <a href="#how">How it works</a>
            <a href="#evidence">Evidence</a>
            <a href="#integration">API</a>
          </nav>
          <Button asChild className="home-nav-cta" size="sm">
            <a href="#pilot">
              Plan a pilot <ArrowRight size={16} aria-hidden="true" />
            </a>
          </Button>
        </div>
      </header>

      <div id="main-content">
        <section className="home-hero home-shell" aria-labelledby="hero-title">
          <div className="home-hero-copy">
            <p className="home-overline">Fashion commerce infrastructure</p>
            <h1 id="hero-title">Make “Will this suit me?” answerable.</h1>
            <p className="home-hero-lede">
              Veyra gives fashion retailers a customer-ready try-on and styling layer. Shoppers
              see themselves in the product, build a complete look, and buy with more confidence
              — inside the storefront you already run.
            </p>
            <div className="home-actions">
              <Button asChild className="home-hero-cta" size="lg">
                <a href="#pilot">
                  Plan a 5-SKU pilot <ArrowRight size={18} aria-hidden="true" />
                </a>
              </Button>
              <a className="home-text-link" href="#product">
                See the customer journey <ArrowDown size={17} aria-hidden="true" />
              </a>
            </div>
            <ul className="home-hero-facts" aria-label="Veyra product facts">
              <li><Check size={16} aria-hidden="true" /> Your brand and interface stay in front</li>
              <li><Check size={16} aria-hidden="true" /> Start with one measurable surface</li>
              <li><Check size={16} aria-hidden="true" /> No invented performance claims</li>
            </ul>
          </div>

          <div className="home-hero-product" aria-label="Example product-page integration">
            <div className="home-commerce-window">
              <div className="home-commerce-bar">
                <span className="home-demo-wordmark">ARC / 01</span>
                <span className="home-demo-meta">NEW SEASON</span>
                <ShoppingBag size={18} aria-hidden="true" />
              </div>
              <div className="home-product-stage">
                <div className="home-product-image">
                  <Image
                    src="/field-jacket.png"
                    alt="Olive field jacket on a neutral background"
                    fill
                    priority
                    sizes="(max-width: 900px) 80vw, 480px"
                  />
                </div>
                <div className="home-product-copy">
                  <p className="home-product-code">OUTERWEAR / 024</p>
                  <h2>Field Jacket</h2>
                  <p>Washed cotton · relaxed structure</p>
                  <div className="home-size-row" aria-label="Available sizes">
                    <span>S</span><span className="is-selected">M</span><span>L</span><span>XL</span>
                  </div>
                  <span className="home-add-button" aria-hidden="true">Add to bag</span>
                </div>
              </div>
            </div>
            <div className="home-tryon-card">
              <span className="home-tryon-icon"><Sparkles size={18} aria-hidden="true" /></span>
              <div>
                <strong>See this on you</strong>
                <span>Use one photo. Keep shopping.</span>
              </div>
              <ArrowUpRight size={18} aria-hidden="true" />
            </div>
            <div className="home-stage-label home-stage-label-one">PDP</div>
            <div className="home-stage-label home-stage-label-two">YOUR UI</div>
          </div>
        </section>

        <section className="home-proof-rail" aria-label="Product positioning">
          <div className="home-shell home-proof-rail-inner">
            <span>Not another destination app.</span>
            <span aria-hidden="true">/</span>
            <span>Not a generic chatbot.</span>
            <span aria-hidden="true">/</span>
            <strong>A confidence layer inside commerce.</strong>
          </div>
        </section>

        <section className="home-section home-shell" id="product" aria-labelledby="product-title">
          <div className="home-section-intro home-section-intro-wide">
            <p className="home-overline">The customer journey</p>
            <h2 id="product-title">Useful at the exact moment doubt appears.</h2>
            <p>
              Veyra does not ask shoppers to learn a new destination. It adds personal proof to
              the product page, helps complete the cart, and keeps serving the purchase after it
              arrives.
            </p>
          </div>
          <CommerceMoment />
        </section>

        <section className="home-section home-how" id="how" aria-labelledby="how-title">
          <div className="home-shell">
            <div className="home-section-intro">
              <p className="home-overline">What the market learned</p>
              <h2 id="how-title">Personalization gets stronger as the shopper gets closer to the image.</h2>
              <p>
                Breuninger moved through three levels of virtual try-on before customer feedback
                made the priority clear: people did not only want a representative model. They
                wanted to see themselves.
              </p>
              <a className="home-source-link" href={GOOGLE_CASE_STUDY} target="_blank" rel="noreferrer">
                Read the Google Cloud retail case study <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>

            <ol className="home-maturity-list">
              <li>
                <span className="home-maturity-number">01</span>
                <div><strong>Catalog-ready</strong><p>Prepare consistent product imagery at scale, without another full shoot.</p></div>
                <span className="home-maturity-mode">Batch</span>
              </li>
              <li>
                <span className="home-maturity-number">02</span>
                <div><strong>A relevant body</strong><p>Use a body type or reusable avatar that makes drape easier to imagine.</p></div>
                <span className="home-maturity-mode">On request</span>
              </li>
              <li className="is-emphasis">
                <span className="home-maturity-number">03</span>
                <div><strong>Be your own model</strong><p>Let the shopper use their own image for the most personal proof.</p></div>
                <span className="home-maturity-mode">Personal</span>
              </li>
            </ol>
          </div>
        </section>

        <section className="home-section home-shell" id="platform" aria-labelledby="platform-title">
          <div className="home-section-intro home-section-intro-wide">
            <p className="home-overline">One system, four jobs</p>
            <h2 id="platform-title">Everything around the render matters.</h2>
            <p>
              High-quality try-on is not one model call. The product image, garment roles,
              customer input, response time, and review path all shape whether a result earns
              trust.
            </p>
          </div>
          <div className="home-capability-list">
            {capabilities.map(({ number, icon: Icon, title, body, detail }) => (
              <article className="home-capability-row" key={number}>
                <span className="home-capability-number">{number}</span>
                <span className="home-capability-icon"><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className="home-capability-detail">{detail}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="home-evidence" id="evidence" aria-labelledby="evidence-title">
          <div className="home-shell">
            <div className="home-evidence-heading">
              <p className="home-overline">Independent evidence</p>
              <h2 id="evidence-title">The category has proof. Veyra still has to earn yours.</h2>
              <p>
                We separate published retail evidence from Veyra performance. A pilot should
                measure the impact on your catalog and your shoppers—not borrow someone else’s
                uplift as a promise.
              </p>
            </div>

            <div className="home-evidence-grid">
              <article className="home-evidence-card home-evidence-card-featured">
                <div className="home-evidence-meta">
                  <span>Google Cloud × Breuninger</span><span>6-week A/B test</span>
                </div>
                <h3>Higher conversion. Stronger contribution margin.</h3>
                <p>
                  During Black Week and the holiday season, shoppers who used Breuninger’s
                  personalized virtual try-on converted at a higher rate and generated stronger
                  contribution margin. Surveys also highlighted image quality and personalization.
                </p>
                <p className="home-evidence-caveat">The article reports direction, not a numeric uplift.</p>
                <a href={GOOGLE_CASE_STUDY} target="_blank" rel="noreferrer">
                  View source <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </article>

              <article className="home-evidence-card">
                <div className="home-evidence-meta">
                  <span>Zalando SizeFlags</span><span>KDD 2021</span>
                </div>
                <h3>Size advice, tested at retail scale.</h3>
                <dl className="home-evidence-results">
                  <div>
                    <dt>Shoes A/B test</dt>
                    <dd>
                      <span className="home-evidence-measure">
                        <strong>−3.8%</strong><span>size-related returns</span>
                      </span>
                      <small>720,000 customers in each group</small>
                    </dd>
                  </div>
                  <div>
                    <dt>Textiles A/B test</dt>
                    <dd>
                      <span className="home-evidence-measure">
                        <strong>−4.3% to −6.6%</strong><span>size-related returns</span>
                      </span>
                      <small>“Too small” and “too big” flags · 180,000+ customers per group</small>
                    </dd>
                  </div>
                </dl>
                <p>
                  Zalando researchers tested article-level size guidance on shoes and textiles.
                  The figures above are relative reductions reported by that study—not Veyra
                  performance.
                </p>
                <a href={ZALANDO_STUDY} target="_blank" rel="noreferrer">
                  Read the paper <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </article>
            </div>
          </div>
        </section>

        <section className="home-section home-integration" id="integration" aria-labelledby="integration-title">
          <div className="home-shell home-integration-grid">
            <div className="home-section-intro">
              <p className="home-overline">For product and engineering</p>
              <h2 id="integration-title">Your customer sees the experience. Your team keeps control.</h2>
              <p>
                Use Veyra behind your storefront, app, or internal catalog tools. Start with a
                widget-sized surface or build directly against the API.
              </p>
              <ul className="home-check-list">
                <li><CircleCheck size={18} aria-hidden="true" /> Existing product pages stay intact</li>
                <li><CircleCheck size={18} aria-hidden="true" /> Image jobs return immediately with a job ID</li>
                <li><CircleCheck size={18} aria-hidden="true" /> Garment conflicts are rejected before generation</li>
                <li><CircleCheck size={18} aria-hidden="true" /> Usage and quality review travel with the response</li>
              </ul>
            </div>

            <div className="home-code-window" aria-label="Example Veyra try-on API request">
              <div className="home-code-bar">
                <span>try-on.ts</span>
                <span>Interactive job</span>
              </div>
              <pre><code>{TRY_ON_CODE}</code></pre>
              <div className="home-code-status">
                <span><span className="home-status-dot" /> Storefront stays responsive</span>
                <ShieldCheck size={18} aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section className="home-section home-pilot" id="pilot" aria-labelledby="pilot-title">
          <div className="home-shell home-pilot-grid">
            <div>
              <p className="home-overline">Start narrow. Learn fast.</p>
              <h2 id="pilot-title">A useful first pilot fits on one page.</h2>
              <p className="home-pilot-lede">
                Pick one customer moment, a small representative catalog slice, and one business
                question. The goal is not to “launch AI.” It is to learn whether personal proof
                changes purchase behavior for your shoppers.
              </p>
            </div>
            <div className="home-pilot-steps">
              <div><span>01</span><p><strong>Choose the moment</strong>Product page try-on, cart styling, or catalog preparation.</p></div>
              <div><span>02</span><p><strong>Choose the slice</strong>Five to twenty-five SKUs that represent real catalog complexity.</p></div>
              <div><span>03</span><p><strong>Choose the measure</strong>Activation, add-to-cart, conversion, contribution margin, or returns.</p></div>
            </div>
            <PilotChecklist />
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
      </div>

      <footer className="home-footer">
        <div className="home-shell home-footer-main">
          <div>
            <a className="home-mark home-mark-footer" href="#top">
              <span className="home-mark-symbol" aria-hidden="true">V</span>
              <span>Veyra</span>
            </a>
            <p>Personal proof for fashion commerce.</p>
          </div>
          <div className="home-footer-links">
            <a href="#product">Product</a>
            <a href="#evidence">Evidence</a>
            <a href="#integration">API</a>
            <a href="#pilot">Plan a pilot</a>
          </div>
        </div>
        <div className="home-shell home-footer-bottom">
          <span>© 2026 Veyra</span>
          <span>Built for confidence, measured on real traffic.</span>
        </div>
      </footer>
    </main>
  );
}
