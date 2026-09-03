import { ArrowRight, Check } from "lucide-react";

/** Closing conversion section.
 *
 *  The form is intentionally inert and says so: shipping a form that silently discards
 *  submissions is worse than no form. Wire it to a scheduling link or form endpoint (and a
 *  fallback email) before launch. */
export default function BookWalkthrough() {
  return (
    <div className="book-grid">
      <div>
        <h2 id="book-title">The benchmark is interesting. Your number is what matters.</h2>
        <p className="book-lede">
          Twenty minutes: we show the product on one of your own SKUs, agree the surface and
          the KPI, and tell you honestly whether a pilot is worth your quarter.
        </p>
        <ul className="book-ticks">
          <li><Check size={15} aria-hidden="true" /> Send a product URL beforehand and we&rsquo;ll bring the render</li>
          <li><Check size={15} aria-hidden="true" /> No deck — the live product and your numbers</li>
          <li><Check size={15} aria-hidden="true" /> We&rsquo;ll say if your traffic can&rsquo;t support a clean control</li>
        </ul>
      </div>

      <div className="book-card">
        <p className="book-card-head">Book a 20-minute walkthrough</p>
        <div className="book-fields">
          <input type="text" aria-label="Your name" placeholder="Your name" />
          <input type="email" aria-label="Work email" placeholder="Work email" />
          <input type="text" aria-label="Brand" placeholder="Brand" />
          <input type="url" aria-label="A product URL to render" placeholder="A product URL for us to render (optional)" />
        </div>
        <button type="button" className="book-submit" disabled aria-describedby="book-form-note">
          Request the walkthrough <ArrowRight size={17} aria-hidden="true" />
        </button>
        <p className="book-note" id="book-form-note">
          <strong>[Content required]</strong> wire this to a real destination — a scheduling
          link or a form endpoint — plus a fallback email address. Until then the button is
          disabled rather than silently discarding what someone types.
        </p>
      </div>
    </div>
  );
}
