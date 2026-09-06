"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#demo", label: "See it work" },
  { href: "#difference", label: "Why it's different" },
  { href: "#evidence", label: "Results" },
  { href: "#roi", label: "ROI" },
  { href: "#live", label: "Go live" },
  { href: "#book", label: "Book a walkthrough" },
] as const;

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="home-mobile-nav">
      <button
        type="button"
        className="home-mobile-nav-toggle"
        aria-expanded={open}
        aria-controls="home-mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>
      {open && (
        <nav id="home-mobile-nav-panel" className="home-mobile-nav-panel" aria-label="Homepage sections">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
