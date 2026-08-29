import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

export default function HowItWorks() {
  return (
    <section className="wrap section" id="how">
      <Reveal className="section-head center">
        <h2 className="section-title">Three steps. No rebuild of your storefront.</h2>
        <p className="section-sub">You keep your stack — your PDP, your cart, your checkout. STYLD sits behind it.</p>
      </Reveal>
      <RevealGroup className="steps" stagger={0.12}>
        <RevealItem className="step">
          <span className="num">01 — Connect your catalog</span>
          <h3>Point us at your product photos</h3>
          <p>
            Send product images through the API, or let us pull from your existing feed —
            category, background removal, and a clean studio-style image come back automatically.
          </p>
          <div className="step-art">
            <div className="corner tl" /><div className="corner tr" />
            <div className="corner bl" /><div className="corner br" />
            <div className="mode-chip">+ Ingesting</div>
            <div className="ghost-center">
              <svg viewBox="0 0 24 24" style={{ color: "var(--ink)" }}><use href="#g-jacket" /></svg>
            </div>
          </div>
        </RevealItem>

        <RevealItem className="step">
          <span className="num">02 — Drop in the widget</span>
          <h3>One API call, or your own UI</h3>
          <p>
            Call our API endpoints directly, or embed STYLD&rsquo;s
            ready-made try-on widget on the product page and cart. Either way, it&rsquo;s your
            storefront — our engine underneath.
          </p>
          <div className="step-art">
            <div className="mini-grid">
              <div className="mini-card" style={{ background: "linear-gradient(155deg, rgba(46,77,86,0.35), rgba(46,77,86,0.05))" }}>
                <svg viewBox="0 0 24 24" style={{ color: "var(--ink)" }}><use href="#g-tee" /></svg>
              </div>
              <div className="mini-card" style={{ background: "linear-gradient(155deg, rgba(91,121,255,0.16), rgba(91,121,255,0.03))" }}>
                <svg viewBox="0 0 24 24" style={{ color: "var(--ink)" }}><use href="#g-pants" /></svg>
              </div>
              <div className="mini-card" style={{ background: "linear-gradient(155deg, rgba(231,203,160,0.16), rgba(231,203,160,0.02))" }}>
                <svg viewBox="0 0 24 24" style={{ color: "var(--ink)" }}><use href="#g-shoe" /></svg>
              </div>
            </div>
            <div className="count-pill">3 of 4 garment slots filled</div>
          </div>
        </RevealItem>

        <RevealItem className="step">
          <span className="num">03 — Watch it on real traffic</span>
          <h3>A pilot, not a rollout</h3>
          <p>
            Run it on a slice of live traffic first. See the effect on conversion and returns
            before deciding how far to take it — not the other way around.
          </p>
          <div className="step-art">
            <div className="slider-mock">
              <div className="half before">
                <svg viewBox="0 0 24 24" style={{ color: "var(--ink)" }}><use href="#g-jacket" /></svg>
              </div>
              <div className="half after">
                <svg viewBox="0 0 24 24" style={{ color: "var(--coral2)" }}><use href="#g-jacket" /></svg>
              </div>
              <div className="handle" />
            </div>
            <div className="slider-label l">Control</div>
            <div className="slider-label r">Pilot</div>
          </div>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
