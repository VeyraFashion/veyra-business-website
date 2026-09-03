import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import RoiCalculator from "@/components/home/RoiCalculator";
import { StoreInputsProvider } from "@/components/home/StoreInputs";
import { EVIDENCE_DISCLOSURE, METHODOLOGY_LABEL, evidence } from "@/lib/evidence";
import { SCENARIOS } from "@/lib/roi";

export const metadata: Metadata = {
  title: "Fashion E-commerce ROI Calculator | STYLD",
  description:
    "Estimate how changes in conversion, average order value and return rate could affect your fashion e-commerce revenue. Use editable, benchmark-informed assumptions.",
  alternates: { canonical: "/roi-calculator" },
};

/** The evidence each scenario band is anchored to, shown so a visitor can audit the
 *  assumptions rather than take them on faith. */
const ANCHOR_IDS = ["garcia-vto", "didi-vto", "rhone-stylitics", "zalando-vfr"] as const;

export default function RoiCalculatorPage() {
  return (
    <StoreInputsProvider>
    <main className="business-home" id="top">
      <a className="home-skip-link" href="#calculator">
        Skip to calculator
      </a>

      <header className="home-nav" aria-label="Primary navigation">
        <div className="home-shell home-nav-inner">
          <Link className="home-mark" href="/" aria-label="STYLD for Business home">
            <span className="home-mark-symbol" aria-hidden="true"><BrandMark /></span>
            <span>STYLD</span>
          </Link>
          <div className="home-nav-actions">
            <Link className="home-nav-secondary" href="/">
              <ArrowLeft size={15} aria-hidden="true" /> Back to overview
            </Link>
          </div>
        </div>
      </header>

      <div id="main-content">
        <section className="home-section home-shell" aria-labelledby="roi-page-title">
          <div className="home-section-intro home-section-intro-wide">
            <p className="home-overline">Revenue opportunity</p>
            <h2 id="roi-page-title">Fashion e-commerce ROI calculator.</h2>
            <p>
              Model what a conservative improvement in conversion, average order value and return
              rate could mean for your business. Every assumption is editable, and every scenario
              band is anchored to published retail evidence rather than a sales target.
            </p>
          </div>

          <div id="calculator">
            <RoiCalculator bookHref="/#book" />
          </div>
        </section>

        <section className="home-section home-shell home-anchor-section" aria-labelledby="anchors-title">
          <div className="home-section-intro home-section-intro-wide">
            <p className="home-overline">Where the assumptions come from</p>
            <h2 id="anchors-title">The evidence behind each scenario band.</h2>
          </div>

          <div className="roi-anchor-scenarios">
            {SCENARIOS.map((scenario) => (
              <div className="roi-anchor-card" key={scenario.id}>
                <h3>{scenario.name}</h3>
                <dl>
                  <div>
                    <dt>Conversion lift</dt>
                    <dd>+{(scenario.conversionLift * 100).toFixed(1)}% relative</dd>
                  </div>
                  <div>
                    <dt>AOV lift</dt>
                    <dd>+{(scenario.aovLift * 100).toFixed(0)}%</dd>
                  </div>
                  <div>
                    <dt>Return rate</dt>
                    <dd>−{(scenario.returnRateReductionPp * 100).toFixed(1)} pp</dd>
                  </div>
                </dl>
                <p>{scenario.rationale}</p>
              </div>
            ))}
          </div>

          <div className="evidence-cards roi-anchor-evidence">
            {ANCHOR_IDS.map((id) => {
              const item = evidence(id);
              return (
                <article className="evidence-card" key={item.id}>
                  <span className="evidence-badge">{METHODOLOGY_LABEL[item.methodology]}</span>
                  <div className="evidence-metrics">
                    <strong>{item.metric}</strong>
                    <span>{item.label}</span>
                  </div>
                  <span className="evidence-brand">{item.brand}</span>
                  {item.note && <p className="evidence-caveat">{item.note}</p>}
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                    View source <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </article>
              );
            })}
          </div>

          <p className="evidence-disclosure">{EVIDENCE_DISCLOSURE}</p>
        </section>
      </div>

      <footer className="home-footer">
        <div className="home-shell home-footer-bottom">
          <span>© 2026 STYLD</span>
          <Link href="/">Back to overview</Link>
        </div>
      </footer>
    </main>
    </StoreInputsProvider>
  );
}
