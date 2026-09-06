/** Central registry for every external claim shown on this site.
 *
 *  Rule this file exists to enforce: **no third-party number is ever presented as a STYLD
 *  customer result.** Each entry carries the brand it belongs to, how it was measured, a
 *  source URL, and the note that scopes it. Components render those fields — they never
 *  hard-code a metric — so a claim can't drift away from its methodology or its source.
 *
 *  Deliberately small, and grouped by the three commercial levers a fashion brand actually
 *  decides on: conversion, basket size, returns. Every metric appears in exactly one place
 *  on the page.
 */

export type Methodology =
  | "controlled_ab"
  | "retailer_pilot"
  | "vendor_case"
  /** Real result, but from tooling adjacent to visual try-on (e.g. size-and-fit advice).
   *  Badged separately so it is never read as evidence for try-on itself. */
  | "adjacent_category";

export const METHODOLOGY_LABEL: Record<Methodology, string> = {
  controlled_ab: "Controlled A/B",
  retailer_pilot: "Retailer pilot",
  vendor_case: "Vendor case",
  adjacent_category: "Adjacent category",
};

export type Lever = "conversion" | "basket" | "returns";

export interface EvidenceItem {
  id: string;
  lever: Lever;
  metric: string;
  /** Reads directly after the metric, e.g. "conversion · −13.1% returns". */
  label: string;
  brand: string;
  methodology: Methodology;
  sourceUrl: string;
  /** Scope-limiting note, shown under the attribution. */
  note?: string;
  /** `primary` gets the large accented figure; `secondary` sits below it, smaller. */
  emphasis: "primary" | "secondary";
}

export const EVIDENCE: EvidenceItem[] = [
  {
    id: "didi-vto",
    lever: "conversion",
    metric: "+3.5%",
    label: "conversion · −13.1% returns",
    brand: "DIDI × Faslet",
    methodology: "controlled_ab",
    sourceUrl: "https://faslet.me/cases/business-case-didi/",
    emphasis: "primary",
  },
  {
    id: "garcia-vto",
    lever: "conversion",
    metric: "+7.06%",
    label: "conversion · −5.54% returns",
    brand: "Garcia × Faslet",
    methodology: "adjacent_category",
    sourceUrl: "https://faslet.me/cases/business-case-garcia/",
    note: "Size-and-fit tooling rather than visual try-on; both groups already used Faslet size-me.",
    emphasis: "secondary",
  },
  {
    id: "rhone-stylitics",
    lever: "basket",
    metric: "+39%",
    label: "AOV on orders influenced by complete-look merchandising",
    brand: "Rhone × Stylitics",
    methodology: "vendor_case",
    sourceUrl: "https://stylitics.com/resources/case-studies/rhone/",
    note: "Applies to influenced orders, not all site traffic.",
    emphasis: "primary",
  },
  {
    id: "zalando-vfr",
    lever: "returns",
    metric: "Up to −40%",
    label: "returns in Virtual Fitting Room pilots",
    brand: "Zalando",
    methodology: "retailer_pilot",
    sourceUrl:
      "https://corporate.zalando.com/en/technology/how-zalando-uses-technology-help-customers-find-right-size",
    note: "Described as a pilot result; scaled performance may differ.",
    emphasis: "primary",
  },
];

const BY_ID = new Map(EVIDENCE.map((item) => [item.id, item]));

/** Throws on a typo rather than silently rendering nothing — a missing citation next to a
 *  big number is exactly the failure this registry prevents. */
export function evidence(id: string): EvidenceItem {
  const item = BY_ID.get(id);
  if (!item) throw new Error(`Unknown evidence id: ${id}`);
  return item;
}

export function evidenceByLever(lever: Lever): EvidenceItem[] {
  return EVIDENCE.filter((item) => item.lever === lever);
}

export const EVIDENCE_DISCLOSURE =
  "Published industry outcomes shown here are third-party evidence, not claimed STYLD customer results. Each figure is attributed to the brand it belongs to and badged with how it was produced. STYLD pilots are designed to measure incremental impact on each brand's own traffic; comparing only shoppers who chose to engage against those who didn't inflates apparent performance and is not incremental lift.";
