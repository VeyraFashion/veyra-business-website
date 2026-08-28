/** The single site nav — used as-is on the marketing homepage, and reused verbatim (via
 *  `homeHref`) on pages like `/demo/[brandId]` that aren't the homepage themselves, so a visitor
 *  on a per-brand demo link sees the same Veyra business identity and can navigate back to the
 *  real site instead of a demo-specific, disposable-feeling nav. */
export default function Nav({ homeHref = "" }: { homeHref?: string }) {
  return (
    <nav>
      <div className="wrap">
        <div className="nav-glass">
          <div className="wordmark">
            <a href={homeHref || "#"} style={{ color: "inherit", textDecoration: "none" }}>Veyra</a>{" "}
            <small style={{ fontFamily: "var(--sans)", fontWeight: 500, fontSize: 12, color: "var(--faint)", border: "1px solid var(--line)", borderRadius: 999, padding: "3px 9px", marginLeft: 4 }}>for business</small>
          </div>
          <div className="nav-links">
            <div className="links-inline">
              <a href={`${homeHref}#how`}>How it works</a>
              <a href={`${homeHref}#platform`}>Platform</a>
              <a href={`${homeHref}#evidence`}>Evidence</a>
              <a href={`${homeHref}#integration`}>For developers</a>
            </div>
            <a href={`${homeHref}#demo`} className="btn btn-primary" style={{ padding: "10px 18px", fontSize: 13 }}>
              Book a demo
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
