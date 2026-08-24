import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

export default function Problem() {
  return (
    <section className="wrap section" id="problem">
      <Reveal className="section-head center">
        <h2 className="section-title">Fit is the reason fashion e-commerce loses money — and it&rsquo;s already measured.</h2>
        <p className="section-sub">Every retailer already tracks this number. Most don&rsquo;t have a fix that actually moves it.</p>
      </Reveal>
      <RevealGroup className="stats" stagger={0.1}>
        <RevealItem className="stat">
          <span className="n">25<span className="accent">%</span></span>
          <div className="d">average return rate for apparel bought online — more than double electronics or beauty</div>
        </RevealItem>
        <RevealItem className="stat">
          <span className="n"><span className="accent">~</span>Half</span>
          <div className="d">of apparel returns come down to fit and sizing alone, not the product itself</div>
        </RevealItem>
        <RevealItem className="stat">
          <span className="n">Months</span>
          <div className="d">of specialized ML engineering it typically takes to build multi-garment try-on in-house — before finding out if customers even use it</div>
        </RevealItem>
      </RevealGroup>
      <Reveal delay={0.1}>
        <p className="stat-close">
          None of that is a Veyra number — it&rsquo;s the industry&rsquo;s own. What we&rsquo;re
          offering to help you find out is what happens to <em>your</em> conversion rate and{" "}
          <em>your</em> return rate once real customers can see the fit before they buy.
        </p>
        <p className="stat-source">
          Sources:{" "}
          <a href="https://www.richpanel.com/learn/ecommerce-return-rates" target="_blank" rel="noreferrer">Richpanel, Ecommerce Return Rates 2026</a>
          {" · "}
          <a href="https://www.rocketreturns.io/blog/ecommerce-return-rates-2025-complete-industry-analysis-benchmarks-by-category" target="_blank" rel="noreferrer">Rocket Returns, 2025 Industry Analysis</a>
        </p>
      </Reveal>
    </section>
  );
}
