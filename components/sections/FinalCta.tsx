import { Reveal } from "@/components/Reveal";

export default function FinalCta() {
  return (
    <section className="wrap final-cta" id="demo">
      <Reveal>
        <div className="feature-kicker" style={{ justifyContent: "center", display: "flex" }}>Book a Demo</div>
        <h2 className="section-title">Let&rsquo;s run it on your catalog.</h2>
        <p className="section-sub">
          No procurement deck required first. Send five SKUs and we&rsquo;ll show you what your own
          catalog looks like running through it.
        </p>
        <div className="waitlist-form">
          <input type="email" placeholder="you@yourbrand.com" disabled />
          <button className="btn btn-primary" type="button" style={{ border: "none" }}>Book a demo</button>
        </div>
        <div className="hero-note">
          We&rsquo;re taking on a small number of design partners at a time — same reason your
          results stay real instead of rushed.
        </div>
      </Reveal>
    </section>
  );
}
