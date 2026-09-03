"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { forgetDemo, useRememberedDemo } from "@/lib/use-demo-memory";

/** Mounted once in app/layout.tsx. A visitor who opened a brand's private /demo/<brandId>
 *  link and then navigated to the main site (e.g. clicked a nav link on the demo page itself)
 *  otherwise has no way back without the original URL — this floating chip is that way back.
 *  Hidden while already on a /demo/* route, and dismissible (dismissing forgets the demo, so
 *  it won't reappear on this browser until a new /demo/<brandId> link is opened). */
export default function DemoReturnChip() {
  const pathname = usePathname();
  const remembered = useRememberedDemo();

  if (!remembered || pathname?.startsWith("/demo/")) return null;

  return (
    <div className="demo-return-chip" role="status">
      <Link href={`/demo/${remembered.brandId}`} className="demo-return-chip-link">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to your {remembered.brand} demo
      </Link>
      <button
        type="button"
        className="demo-return-chip-dismiss"
        aria-label="Dismiss"
        onClick={() => forgetDemo()}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
