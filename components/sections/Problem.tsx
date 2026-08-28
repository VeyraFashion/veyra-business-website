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
          <span className="n">24<span className="accent">.4%</span></span>
          <div className="d">average return rate for apparel bought online in the US — the highest of any retail category</div>
        </RevealItem>
        <RevealItem className="stat">
          <span className="n">53<span className="accent">%</span></span>
          <div className="d">of those returns are attributed to size and fit alone, not the product itself</div>
        </RevealItem>
        <RevealItem className="stat">
          <span className="n">$38<span className="accent">B</span></span>
          <div className="d">estimated yearly cost of online apparel returns in the US market alone</div>
        </RevealItem>
        <RevealItem className="stat">
          <span className="n">Months</span>
          <div className="d">of specialized ML engineering it typically takes to build multi-garment try-on in-house — before finding out if customers even use it</div>
        </RevealItem>
      </RevealGroup>
      <Reveal delay={0.1}>
        <p className="stat-source">
          Sources:{" "}
          <a href="https://3dlook.ai/content-hub/true-cost-apparel-returns-data-rising-return-rates/" target="_blank" rel="noreferrer">Coresight Research, apparel returns survey (2023 estimate, cited via 3DLOOK)</a>
          {" · "}
          <a href="https://www.richpanel.com/learn/ecommerce-return-rates" target="_blank" rel="noreferrer">Richpanel, Ecommerce Return Rates 2026</a>
          {" · "}
          <a href="https://www.rocketreturns.io/blog/ecommerce-return-rates-2025-complete-industry-analysis-benchmarks-by-category" target="_blank" rel="noreferrer">Rocket Returns, 2025 Industry Analysis</a>
        </p>
      </Reveal>

      <Reveal delay={0.15} style={{ marginTop: 176 }}>
        <div className="math-box">
          <h3 className="math-head">The category&rsquo;s already been measured.</h3>
          <div className="math-slots">
            <div className="math-slot">
              <div className="figure"><span className="accent">+</span>2.1%</div>
              <div className="label">Conversion rate, live A/B test</div>
            </div>
            <div className="math-slot">
              <div className="figure"><span className="accent">+</span>1.8%</div>
              <div className="label">Items added to cart, same test</div>
            </div>
            <div className="math-slot">
              <div className="figure"><span className="accent">4&ndash;8%</span></div>
              <div className="label">Fewer size-related returns, across the tested approaches</div>
            </div>
          </div>
          <p className="math-note">
            Source:{" "}
            <a href="https://arxiv.org/abs/2106.03532" target="_blank" rel="noreferrer">
              Nestler et al., &ldquo;SizeFlags: Reducing Size and Fit Related Returns in Fashion
              E-Commerce,&rdquo; Zalando SE, KDD 2021
            </a>
            .
          </p>
        </div>
      </Reveal>
    </section>
  );
}
