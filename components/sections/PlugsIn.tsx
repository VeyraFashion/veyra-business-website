import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

export default function PlugsIn() {
  return (
    <section className="vey-section" id="integration">
      <div className="wrap section">
        <RevealGroup className="vey-grid" stagger={0.15}>
          <RevealItem>
            <div className="feature-kicker">Where It Fits</div>
            <h2 className="section-title">Drops into where you already sell.</h2>
            <p className="section-sub">
              Product page, cart, or a post-purchase email — call the same API from wherever the
              moment already is. No new surface for your customer to learn.
            </p>
          </RevealItem>
          <RevealItem className="chat-mock">
            <RevealGroup className="touchpoints" stagger={0.08}>
              <RevealItem className="touchpoint">
                <svg viewBox="0 0 24 24"><use href="#g-jacket" /></svg>
                <div className="t-label">Product Page</div>
                <div className="t-sub">Try-on button next to &ldquo;Add to cart&rdquo;</div>
              </RevealItem>
              <RevealItem className="touchpoint">
                <svg viewBox="0 0 24 24"><use href="#g-bag" /></svg>
                <div className="t-label">Cart</div>
                <div className="t-sub">Outfit ranking on what&rsquo;s already in it</div>
              </RevealItem>
              <RevealItem className="touchpoint">
                <svg viewBox="0 0 24 24"><use href="#g-sparkle" /></svg>
                <div className="t-label">Post-Purchase</div>
                <div className="t-sub">Styling follow-up to lift repeat purchase</div>
              </RevealItem>
            </RevealGroup>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
