import { ArrowUpRight } from "lucide-react";
import {
  EVIDENCE_DISCLOSURE,
  METHODOLOGY_LABEL,
  evidenceByLever,
  type Lever,
} from "@/lib/evidence";

/** The site's ONLY evidence block.
 *
 *  Grouped by the three commercial levers a fashion brand decides on, so each number
 *  appears exactly once in the column that answers a question the reader already has.
 *
 *  The fourth column is the point of the section: it says outright that none of these
 *  results are STYLD's, and commits to measuring against a randomised control instead.
 *  Putting that beside the borrowed numbers — rather than in fine print underneath — is
 *  what keeps the block honest at a glance. */
const LEVERS: { id: Lever; label: string; question: string }[] = [
  { id: "conversion", label: "Conversion", question: "Do more visits become orders?" },
  { id: "basket", label: "Basket size", question: "Do orders get bigger?" },
  { id: "returns", label: "Returns", question: "Does less of it come back?" },
];

export default function EvidenceBlock() {
  return (
    <div className="ev">
      <div className="ev-grid">
        {LEVERS.map((lever) => (
          <section className="ev-col" key={lever.id} aria-label={lever.label}>
            <header className="ev-col-head">
              <h3>{lever.label}</h3>
              <p>{lever.question}</p>
            </header>

            {evidenceByLever(lever.id).map((item) => (
              <article
                className={item.emphasis === "primary" ? "ev-item" : "ev-item ev-item-secondary"}
                key={item.id}
              >
                <strong className="ev-metric">{item.metric}</strong>
                <em className="ev-label">{item.label}</em>
                <div className="ev-source">
                  <span className="ev-brand">{item.brand}</span>
                  <span
                    className={
                      item.methodology === "adjacent_category"
                        ? "ev-badge ev-badge-flag"
                        : "ev-badge"
                    }
                  >
                    {METHODOLOGY_LABEL[item.methodology]}
                  </span>
                </div>
                {item.note && <p className="ev-note">{item.note}</p>}
                <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                  Source <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </article>
            ))}
          </section>
        ))}

        <section className="ev-col ev-col-yours" aria-label="What we will measure on yours">
          <header className="ev-col-head">
            <h3 className="is-lime">Yours</h3>
            <p>And what will we measure?</p>
          </header>
          <div className="ev-yours-body">
            <p className="ev-yours-lead">None of the numbers to the left are ours.</p>
            <p className="ev-yours-copy">
              They tell you the category opportunity. A STYLD pilot tells you the answer for
              your catalogue, your shoppers and your economics — against a randomised control
              where your traffic allows it.
            </p>
            <p className="ev-yours-kicker">
              We are the vendor willing to run a control group against ourselves.
            </p>
          </div>
        </section>
      </div>

      <details className="ev-disclosure">
        <summary>Methodology and disclosure</summary>
        <p>{EVIDENCE_DISCLOSURE}</p>
      </details>
    </div>
  );
}
