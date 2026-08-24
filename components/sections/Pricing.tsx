"use client";

import { useState } from "react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

const TIERS = [
  {
    name: "Pilot",
    monthly: 299,
    annual: 3289,
    for: "For the first slice of traffic — proving it before committing further.",
    features: [
      "300 try-on renders / mo",
      "1,500 outfit-ranking calls / mo",
      "Up to 1,000 SKUs catalogued",
      "Email support",
      "Month-to-month, cancel anytime",
    ],
    ctaLabel: "Start a pilot",
    ctaVariant: "ghost",
    featured: false,
  },
  {
    name: "Growth",
    monthly: 899,
    annual: 9889,
    badge: "Most brands land here",
    for: "Once the pilot's numbers are worth acting on — full storefront rollout.",
    features: [
      "1,200 try-on renders / mo",
      "6,000 outfit-ranking calls / mo",
      "Up to 5,000 SKUs catalogued",
      "Priority support + a monthly review call",
      "Premium (4K) render tier available",
    ],
    ctaLabel: "Book a demo",
    ctaVariant: "primary",
    featured: true,
  },
  {
    name: "Scale",
    monthly: null,
    annual: null,
    for: "High-volume catalogs, multi-region storefronts, or a rev-share structure instead of a flat fee.",
    features: [
      "Volume-priced renders & ranking calls",
      "Unlimited SKUs",
      "Dedicated Slack channel, custom SLA",
      "Direct API access for your own integration",
    ],
    ctaLabel: "Talk to us",
    ctaVariant: "ghost",
    featured: false,
  },
] as const;

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="wrap section" id="pricing">
      <Reveal className="section-head center">
        <h2 className="section-title">Usage-based, not headcount-based.</h2>
        <p className="section-sub">
          Three tiers, capped by what actually costs us to run — try-on renders, outfit-ranking
          calls, and catalog size. No feature is locked behind a higher tier; volume is the only
          difference.
        </p>
      </Reveal>

      <Reveal className="period-toggle-wrap">
        <div className="period-toggle" role="tablist" aria-label="Billing period">
          <button type="button" role="tab" aria-selected={!annual} className={!annual ? "active" : ""} onClick={() => setAnnual(false)}>
            Monthly
          </button>
          <button type="button" role="tab" aria-selected={annual} className={annual ? "active" : ""} onClick={() => setAnnual(true)}>
            Annual <span className="save-badge">1 month free</span>
          </button>
        </div>
      </Reveal>

      <RevealGroup className="pricing-grid" stagger={0.1}>
        {TIERS.map((tier) => (
          <RevealItem key={tier.name} className={`card price-card${tier.featured ? " featured" : ""}`}>
            <div className="tier-label">
              <span className="tier-name">{tier.name}</span>
              {"badge" in tier && tier.badge ? <span className="badge">{tier.badge}</span> : null}
            </div>

            {tier.monthly !== null ? (
              <>
                <p className="amount">
                  ${(annual ? tier.annual : tier.monthly).toLocaleString("en-US")}
                  <span>{annual ? " / yr" : " / mo"}</span>
                </p>
                <p className="amount-sub">
                  {annual ? `≈ $${Math.round(tier.annual / 12)}/mo, billed annually` : "billed monthly"}
                </p>
              </>
            ) : (
              <>
                <p className="amount">Custom</p>
                <p className="amount-sub">&nbsp;</p>
              </>
            )}

            <p className="for">{tier.for}</p>
            <ul>
              {tier.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a href="#demo" className={`btn btn-${tier.ctaVariant} btn-block`}>
              {tier.ctaLabel}
            </a>
          </RevealItem>
        ))}
      </RevealGroup>

      <p className="pricing-footnote">
        Every tier includes the full platform — garment analysis, virtual try-on, reusable
        avatars, and outfit intelligence. Higher tiers are more room to run it, not more of the
        product. Annual pricing is exactly eleven months' worth billed up front — one month free,
        not a rounded-off estimate.
      </p>

      <Reveal delay={0.1} style={{ marginTop: 56 }}>
        <div className="section-head center">
          <h3 className="section-title" style={{ fontSize: "clamp(22px, 2.6vw, 28px)" }}>How we&rsquo;ll measure it</h3>
          <p className="section-sub">
            Before vs. after, on a slice of your own traffic — not a self-reported estimate.
          </p>
        </div>
        <div className="method-steps">
          <div className="method-step">
            <div className="method-num">1</div>
            <h4>Baseline your current numbers</h4>
            <p>Your existing conversion rate and return rate, on the pages the pilot will touch — measured before anything changes.</p>
          </div>
          <div className="method-step">
            <div className="method-num">2</div>
            <h4>Run the pilot window</h4>
            <p>Live on a defined slice of SKUs and traffic for a fixed period, long enough to see real purchase and return behavior.</p>
          </div>
          <div className="method-step">
            <div className="method-num">3</div>
            <h4>Compare, plainly</h4>
            <p>Same metrics, same slice, before vs. after. If it didn&rsquo;t move, you&rsquo;ll see that too — not just the wins.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
