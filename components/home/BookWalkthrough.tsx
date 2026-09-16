"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";

/** Address that receives walkthrough requests. Set NEXT_PUBLIC_STYLD_CONTACT_EMAIL in the
 *  environment; with it unset the draft still opens, just without a recipient filled in. */
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_STYLD_CONTACT_EMAIL ?? "";

/** Closing conversion section.
 *
 *  There is no form endpoint yet, so the submit composes a mail draft from the fields
 *  instead of posting into a void. The visitor keeps their input and can see exactly what
 *  gets sent — accepting a submission and silently dropping it is the one outcome to avoid.
 *  Swap this for a real endpoint or scheduling link when one exists. */
export default function BookWalkthrough() {
  const [fields, setFields] = useState({ name: "", email: "", brand: "", url: "" });

  const update =
    (key: keyof typeof fields) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      setFields((current) => ({ ...current, [key]: event.target.value }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = [
      `Name: ${fields.name}`,
      `Work email: ${fields.email}`,
      `Brand: ${fields.brand}`,
      fields.url ? `Product URL to render: ${fields.url}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      "Walkthrough request",
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="book-grid">
      <div>
        <h2 id="book-title">The benchmark is interesting. Your number is what matters.</h2>
        <p className="book-lede">
          We show the product on one of your own SKUs, agree the surface and the KPI, and
          tell you honestly whether a pilot is worth your quarter.
        </p>
        <ul className="book-ticks">
          <li><Check size={15} aria-hidden="true" /> Send a product URL beforehand and we&rsquo;ll bring the render</li>
          <li><Check size={15} aria-hidden="true" /> No deck — the live product and your numbers</li>
          <li><Check size={15} aria-hidden="true" /> We&rsquo;ll say if your traffic can&rsquo;t support a clean control</li>
        </ul>
      </div>

      <form className="book-card" onSubmit={handleSubmit}>
        <p className="book-card-head">Book a walkthrough</p>
        <div className="book-fields">
          <input type="text" aria-label="Your name" placeholder="Your name" required value={fields.name} onChange={update("name")} />
          <input type="email" aria-label="Work email" placeholder="Work email" required value={fields.email} onChange={update("email")} />
          <input type="text" aria-label="Brand" placeholder="Brand" required value={fields.brand} onChange={update("brand")} />
          <input type="url" aria-label="A product URL to render" placeholder="A product URL for us to render (optional)" value={fields.url} onChange={update("url")} />
        </div>
        <button type="submit" className="book-submit">
          Request the walkthrough <ArrowRight size={17} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
