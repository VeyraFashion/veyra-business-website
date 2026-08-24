import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

export default function Segments() {
  return (
    <section className="wrap section">
      <Reveal className="section-head">
        <h2 className="section-title">Built for two kinds of teams.</h2>
      </Reveal>
      <RevealGroup className="personas" stagger={0.12}>
        <RevealItem className="persona">
          <h4>The fast-growing DTC brand</h4>
          <p>
            Selling well, return rate quietly eating the margin, no in-house ML team to fix it —
            wants fit and try-on solved without hiring for it.
          </p>
        </RevealItem>
        <RevealItem className="persona">
          <h4>The platform or marketplace team</h4>
          <p>
            Already has engineering resources, wants an API it owns the integration of rather
            than an embedded widget — cares more about docs, schemas, and SLAs than an install
            wizard.
          </p>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
