"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import ContentSlot from "@/components/home/ContentSlot";

/** Four moments, four different outputs — what the shopper actually ends up looking at,
 *  rather than a diagram of where a button would go.
 *
 *  Roving tabindex with arrow-key navigation, matching the ARIA tabs pattern: only the
 *  active tab is in the tab order, and Left/Right move between them. */
const TABS = [
  { id: "tryon", n: "01", label: "Virtual try-on" },
  { id: "pdp", n: "02", label: "Product page" },
  { id: "outfit", n: "03", label: "Complete the outfit" },
  { id: "ways", n: "04", label: "Style it three ways" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const P = "/products/snitch";

export default function DemoShowcase() {
  const [active, setActive] = useState<TabId>("tryon");

  function onTabKey(event: React.KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = TABS.findIndex((t) => t.id === active);
    const next = TABS[(index + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length];
    setActive(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  }

  return (
    <>
      <div className="demo-tabs" role="tablist" aria-label="Product capability">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={tab.id === active}
            aria-controls="demo-panel"
            tabIndex={tab.id === active ? 0 : -1}
            className={tab.id === active ? "is-active" : undefined}
            onClick={() => setActive(tab.id)}
            onKeyDown={onTabKey}
          >
            <span>{tab.n}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="demo-panel" id="demo-panel" role="tabpanel" aria-labelledby={`tab-${active}`}>
        {active === "tryon" && (
          <div className="demo-split">
            <div className="demo-copy">
              <p className="home-overline">One photo, reused forever</p>
              <h3>The shopper uploads once. Every future garment lands on the same body.</h3>
              <p>
                The photo is validated before any render starts — cropped, angled, obstructed
                or multi-person images get retake guidance instead of a bad result.
              </p>
              <ul className="demo-ticks">
                <li><Check size={15} aria-hidden="true" /> Garment roles validated before generation</li>
                <li><Check size={15} aria-hidden="true" /> Photo bytes excluded from our API logs</li>
                <li><Check size={15} aria-hidden="true" /> Second visual review for colour, pattern, logo, texture</li>
              </ul>
            </div>
            <div className="demo-stage">
              <div className="demo-tryon-row">
                <figure className="demo-fig">
                  <figcaption>Shopper photo</figcaption>
                  <div className="demo-fig-frame"><ContentSlot label="Shopper's full-body photo" compact /></div>
                </figure>
                <div className="demo-arrow" aria-hidden="true">→</div>
                {[1, 2, 3].map((n) => (
                  <figure className="demo-fig" key={n}>
                    <figcaption className="is-accent">Look 0{n}</figcaption>
                    <div className="demo-fig-frame demo-fig-frame-result">
                      <ContentSlot label={`Try-on result ${n}`} compact />
                    </div>
                  </figure>
                ))}
              </div>
              <p className="demo-note">
                Three renders run asynchronously from one upload — the shopper never uploads
                again. <strong>[Content required]</strong> drop four real stills here.
              </p>
            </div>
          </div>
        )}

        {active === "pdp" && (
          <div className="demo-split">
            <div className="demo-copy">
              <p className="home-overline">Inside your storefront</p>
              <h3>It looks like your product page, because it is your product page.</h3>
              <p>
                The try-on action sits beside the buy button. Image work is queued, so the page
                never waits on a render — your PDP stays as fast as it is today.
              </p>
              <div className="demo-chip">Powered by STYLD, presented as your brand</div>
            </div>
            <div className="demo-stage">
              <div className="demo-browser">
                <div className="demo-browser-bar">
                  <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
                  <span className="demo-url">yourstore.com / outerwear / field-jacket</span>
                </div>
                <div className="demo-pdp">
                  <div className="demo-pdp-image">
                    <Image src="/field-jacket.png" alt="Field jacket" fill sizes="(max-width: 760px) 90vw, 380px" style={{ objectFit: "contain", padding: 24 }} />
                    <div className="demo-pdp-thumbs">
                      <div className="demo-thumb is-active"><ContentSlot label="On you" compact /></div>
                      <div className="demo-thumb"><ContentSlot label="Alt" compact /></div>
                      <div className="demo-thumb"><ContentSlot label="Alt" compact /></div>
                    </div>
                  </div>
                  <div className="demo-pdp-copy">
                    <p className="demo-pdp-code">OUTERWEAR / 024</p>
                    <h4>Field Jacket</h4>
                    <p>Washed cotton · relaxed structure</p>
                    <div className="demo-sizes" aria-label="Available sizes">
                      <span>S</span><span className="is-selected">M</span><span>L</span><span>XL</span>
                    </div>
                    <span className="demo-add" aria-hidden="true">Add to bag</span>
                    <span className="demo-tryon-cta" aria-hidden="true">
                      See this on you <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </div>
              <p className="demo-note">
                The generated looks join your existing gallery strip.{" "}
                <strong>[Content required]</strong> drop try-on thumbnails into the three slots.
              </p>
            </div>
          </div>
        )}

        {active === "outfit" && (
          <div className="demo-pad">
            <div className="demo-outfit">
              <div className="demo-copy demo-copy-flush">
                <p className="home-overline">Outfit intelligence</p>
                <h3>Don&rsquo;t recommend another product. Complete the decision.</h3>
                <p>
                  Recommendation engines rank products. STYLD reasons at the outfit level —
                  what works together, what&rsquo;s missing, and what&rsquo;s actually in stock.
                </p>
                <div className="demo-input-card">
                  <p className="demo-input-head">Input</p>
                  <div className="demo-input-item">
                    <div className="demo-input-thumb">
                      <Image src={`${P}/shirt-quads-line-grey.png`} alt="Quads line grey shirt" width={56} height={75} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                    </div>
                    <div>
                      <strong>Quads Line Shirt</strong>
                      <span>Selected on the PDP</span>
                    </div>
                  </div>
                  <div className="demo-input-tags">
                    <span>Office</span><span>31°C</span><span>Smart casual</span><span>Live inventory</span>
                  </div>
                </div>
              </div>

              <div className="demo-outfit-results">
                <p className="demo-results-head">Output — three ranked complete looks</p>

                <article className="demo-look demo-look-top">
                  <header>
                    <span className="demo-rank">Rank 01</span>
                    <strong>The desk-to-dinner shirt</strong>
                    <span className="demo-price">₹7,297</span>
                  </header>
                  <div className="demo-look-body">
                    <div className="demo-look-items">
                      {["shirt-quads-line-grey", "jeans-washed-straight-fit", "shoes-classic-chelsea-boots"].map((f) => (
                        <div className="demo-look-thumb" key={f}>
                          <Image src={`${P}/${f}.png`} alt="" width={62} height={83} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p>Straight-fit denim keeps the shirt&rsquo;s structure; the Chelsea boot lifts it past smart-casual without a jacket.</p>
                      <div className="demo-look-tags">
                        <span className="is-lime">All sizes in stock</span>
                        <span>+2 units per order</span>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="demo-look">
                  <header>
                    <span className="demo-rank is-quiet">Rank 02</span>
                    <strong>Weekend layer</strong>
                    <span className="demo-price">₹9,196</span>
                  </header>
                  <div className="demo-look-body">
                    <div className="demo-look-items">
                      <div className="demo-look-thumb">
                        <Image src={`${P}/shirt-quads-line-grey.png`} alt="" width={62} height={83} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                      </div>
                      <div className="demo-look-thumb">
                        <Image src="/field-jacket.png" alt="" width={62} height={83} style={{ objectFit: "contain", width: "100%", height: "100%", padding: 4 }} />
                      </div>
                      <div className="demo-look-thumb">
                        <Image src={`${P}/shoes-terra-casual-sneakers-tan.png`} alt="" width={62} height={83} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                      </div>
                    </div>
                    <div>
                      <p>Outerwear role added over the same base top — the layering rules allow it, so the shirt still reads underneath.</p>
                      <div className="demo-look-tags"><span>Jacket low in L</span></div>
                    </div>
                  </div>
                </article>

                <article className="demo-look demo-look-missing">
                  <header>
                    <span className="demo-rank is-missing">Missing piece</span>
                    <strong>Your catalogue has no light chino</strong>
                  </header>
                  <div className="demo-look-body demo-look-body-plain">
                    <p>
                      The highest-scoring look for &ldquo;office, 31°C&rdquo; needs a lightweight
                      trouser you don&rsquo;t currently stock. Missing-piece detection is a
                      merchandising signal, not just a recommendation.
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        )}

        {active === "ways" && (
          <div className="demo-pad">
            <div className="demo-copy demo-copy-flush demo-copy-wide">
              <p className="home-overline">After purchase</p>
              <h3>Give the purchase more than one first wear.</h3>
              <p>
                One delivered item, three contexts. The follow-up is useful rather than
                promotional — and every companion piece is live in your catalogue.
              </p>
            </div>
            <div className="demo-ways">
              {[
                { head: "Monday · Office", tone: "ink", body: "Tucked, with straight-fit denim and Chelsea boots.", items: ["jeans-washed-straight-fit", "shoes-classic-chelsea-boots"], slot: "Denim shirt styled for office" },
                { head: "Friday · Evening", tone: "cobalt", body: "Open over a base tee, sleeves pushed, field jacket carried.", items: ["shirt-denim-regular-fit"], jacket: true, slot: "Denim shirt styled for evening" },
                { head: "Sunday · Weekend", tone: "peri", body: "Loose over baggy denim with tan sneakers.", items: ["jeans-washed-straight-fit", "shoes-terra-casual-sneakers-tan"], slot: "Denim shirt styled for weekend" },
              ].map((way) => (
                <article className="demo-way" key={way.head}>
                  <header className={`demo-way-head is-${way.tone}`}>{way.head}</header>
                  <div className="demo-way-image"><ContentSlot label={way.slot} compact /></div>
                  <div className="demo-way-copy">
                    <p>{way.body}</p>
                    <div className="demo-way-items">
                      {way.jacket && (
                        <div className="demo-way-thumb">
                          <Image src="/field-jacket.png" alt="" width={42} height={56} style={{ objectFit: "contain", width: "100%", height: "100%", padding: 3 }} />
                        </div>
                      )}
                      {way.items.map((f) => (
                        <div className="demo-way-thumb" key={f}>
                          <Image src={`${P}/${f}.png`} alt="" width={42} height={56} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="demo-note">
              <strong>[Content required]</strong> three styled try-on stills of the same
              purchased garment.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
