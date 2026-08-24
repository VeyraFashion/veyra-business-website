import Image from "next/image";
import { Reveal } from "@/components/Reveal";

export default function Hero() {
  return (
    <section className="wrap hero">
      <Reveal>
        <div className="eyebrow">Now onboarding design partners</div>
        <h1 className="display">
          The AI stylist layer,
          <br />
          <em>behind</em> your storefront.
        </h1>
        <p className="lede">
          Garment analysis, virtual try-on, reusable avatars, and outfit ranking — the same engine
          we built for our own consumer app — licensed as an API your team drops into a product
          page, cart, or your own app. You already have the customers and the catalog. We built
          the part that&rsquo;s hard to build well.
        </p>
        <div className="hero-ctas">
          <a href="#demo" className="btn btn-primary">Book a demo</a>
          <a href="#integration" className="btn btn-ghost">See the API</a>
        </div>
        <div className="hero-note">Built for a pilot, not a year of procurement.</div>
      </Reveal>

      <Reveal delay={0.15} y={20} className="browser">
        <div className="browser-bar">
          <span className="browser-dot" />
          <span className="browser-dot" />
          <span className="browser-dot" />
          <div className="browser-url">yourbrand.com/products/field-jacket</div>
        </div>
        <div className="browser-body">
          <div className="browser-badge">AI Try-On</div>
          <div className="browser-product">
            <Image src="/field-jacket.png" alt="Field Jacket" fill sizes="118px" style={{ objectFit: "cover" }} />
          </div>
          <div className="browser-copy">
            <p className="bname">Field Jacket</p>
            <p className="bprice">Your product, your price, your page</p>
            <div className="browser-tryon-btn">Try it on</div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
