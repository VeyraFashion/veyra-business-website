import { Reveal } from "@/components/Reveal";

export default function WhyNow() {
  return (
    <section className="wrap section" id="why">
      <Reveal className="whynow">
        <div className="feature-kicker">Why Now</div>
        <h2 className="section-title">Why licensing this now, instead of building it.</h2>
        <blockquote>
          &ldquo;A retailer that starts building this in 2026 ships a demo eighteen months from
          now. A retailer that licenses it ships this quarter.&rdquo;
        </blockquote>
        <p>
          Vision AI can finally understand clothing the way a stylist does — cut, color,
          formality, occasion. Virtual try-on crossed a real quality threshold, delivering
          photorealistic results from a single photo at a cost that&rsquo;s fallen roughly
          sixty-fold in two years. None of that changes whether it&rsquo;s worth your
          engineering team&rsquo;s next two quarters to build this in-house, versus licensing a
          layer that&rsquo;s already built, already priced per use, and already proven out on our
          own consumer app before it ever touched a retailer&rsquo;s traffic.
        </p>
      </Reveal>

      <Reveal delay={0.1} style={{ marginTop: 40, maxWidth: 720 }}>
        <div className="compare-table">
          <div className="compare-row head">
            <div>&nbsp;</div>
            <div>Building it yourself</div>
            <div className="col-veyra">Licensing Veyra</div>
          </div>
          <div className="compare-row">
            <div className="compare-label">Time to first live try-on</div>
            <div className="compare-no">Months of specialized ML hiring and integration</div>
            <div className="compare-yes">A pilot running on real traffic within weeks</div>
          </div>
          <div className="compare-row">
            <div className="compare-label">Multi-garment &amp; role logic</div>
            <div className="compare-no">You design, build, and test conflict rules yourselves</div>
            <div className="compare-yes">Already built, already reviewed for fidelity</div>
          </div>
          <div className="compare-row">
            <div className="compare-label">Keeping the experience current</div>
            <div className="compare-no">Your team repeatedly rebuilds and re-integrates the workflow</div>
            <div className="compare-yes">Handled on our side, transparently</div>
          </div>
          <div className="compare-row">
            <div className="compare-label">Upfront cost</div>
            <div className="compare-no">A full ML team&rsquo;s salary, before any results</div>
            <div className="compare-yes">Usage-based from day one — see <a href="#pricing" style={{ color: "var(--coral2)" }}>pricing</a></div>
          </div>
          <div className="compare-row">
            <div className="compare-label">If it doesn&rsquo;t move the metric</div>
            <div className="compare-no">The engineering cost is sunk either way</div>
            <div className="compare-yes">You piloted it on a slice of traffic first</div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
