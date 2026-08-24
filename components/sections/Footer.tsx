const SOCIALS = [
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <path d="M4.98 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.7c0-1.36-.02-3.1-1.89-3.1-1.9 0-2.19 1.48-2.19 3v5.8h-4V9Z" />
    ),
  },
  {
    name: "X (Twitter)",
    href: "#",
    icon: <path d="M18.9 3H21l-6.55 7.49L22 21h-6.1l-4.78-6.25L5.6 21H3.5l7-8.01L2 3h6.25l4.32 5.72L18.9 3Zm-1.07 16.17h1.16L7.24 4.75H6l11.83 14.42Z" />,
  },
  {
    name: "Instagram",
    href: "#",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="1.1" />
      </>
    ),
  },
];

export default function Footer() {
  return (
    <footer>
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <div className="wordmark" style={{ fontSize: 18 }}>Veyra</div>
          <p className="footer-tagline">The AI try-on and styling layer, licensed into your storefront.</p>
          <div className="social-icons">
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.href} className="social-icon" aria-label={s.name} title={s.name}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  {s.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h5>Product</h5>
          <a href="#how">How it works</a>
          <a href="#platform">Platform</a>
          <a href="#pricing">Pricing</a>
          <a href="#integration">For developers</a>
        </div>

        <div className="footer-col">
          <h5>Company</h5>
          <a href="#about">About</a>
          <a href="#team">Team</a>
          <a href="#demo">Book a demo</a>
        </div>

        <div className="footer-col">
          <h5>Legal</h5>
          <a href="#">Privacy policy</a>
          <a href="#">Terms of service</a>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <div className="foot-fine">© 2026 Veyra. All rights reserved.</div>
        <div className="foot-fine">Made for teams who&rsquo;d rather ship a pilot than a slide deck.</div>
      </div>
    </footer>
  );
}
