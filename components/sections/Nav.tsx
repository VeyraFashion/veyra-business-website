export default function Nav() {
  return (
    <nav>
      <div className="wrap">
        <div className="nav-glass">
          <div className="wordmark">
            Veyra <small style={{ fontFamily: "var(--sans)", fontWeight: 500, fontSize: 12, color: "var(--faint)", border: "1px solid var(--line)", borderRadius: 999, padding: "3px 9px", marginLeft: 4 }}>for business</small>
          </div>
          <div className="nav-links">
            <div className="links-inline">
              <a href="#how">How it works</a>
              <a href="#platform">Platform</a>
              <a href="#pricing">Pricing</a>
              <a href="#integration">For developers</a>
            </div>
            <a href="#demo" className="btn btn-primary" style={{ padding: "10px 18px", fontSize: 13 }}>
              Book a demo
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
