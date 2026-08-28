import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

export default function About() {
  return (
    <section className="wrap section" id="about">
      <Reveal className="section-head">
        <div className="feature-kicker">About</div>
        <h2 className="section-title">Started as a stylist for one closet. Built to run behind thousands.</h2>
      </Reveal>

      <Reveal delay={0.05} style={{ maxWidth: 720 }}>
        <p className="section-sub" style={{ fontSize: 16, marginBottom: 14 }}>
          Veyra began as a consumer app — an AI stylist that understands the clothes already in
          someone&rsquo;s closet, tries new pieces on their own body, and builds outfits from what
          actually fits. This site is the same engine, offered the other way round: instead of
          asking shoppers to come to us, we license the try-on and styling layer directly into the
          storefronts they&rsquo;re already on.
        </p>
        <p className="section-sub" style={{ fontSize: 16 }}>
          We&rsquo;re a small team, on purpose, for now — close enough to every product output and the
          pilot data to keep the claims on this site honest rather than optimistic.
        </p>
      </Reveal>

      <RevealGroup className="about-values" stagger={0.08} style={{ marginTop: 44 }}>
        <RevealItem className="about-value">
          <h4>No fabricated benchmarks</h4>
          <p>Every stat on this site is either a cited industry figure or explicitly marked as unmeasured yet — never a rounded-up pilot number.</p>
        </RevealItem>
        <RevealItem className="about-value">
          <h4>One platform, not point solutions</h4>
          <p>Garment analysis, try-on, avatars, and outfit ranking ship together, priced by usage — not gated behind separate add-ons.</p>
        </RevealItem>
        <RevealItem className="about-value">
          <h4>Built on our own traffic first</h4>
          <p>The consumer app is the proving ground. Nothing reaches a retailer&rsquo;s storefront that hasn&rsquo;t already run on ours.</p>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
