"use client";

import { Check, Clipboard, ClipboardCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const CHECKLIST = `Veyra pilot brief

Customer moment:
Catalog slice (5–25 SKUs):
Primary business measure:
Storefront/app owner:
Analytics owner:
Target pilot window:
Known garment or image edge cases:`;

export default function PilotChecklist() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyChecklist() {
    try {
      await navigator.clipboard.writeText(CHECKLIST);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="home-pilot-action">
      <div>
        <span className="home-pilot-action-icon"><Check size={18} aria-hidden="true" /></span>
        <p><strong>Take the next useful step.</strong> Copy a seven-line brief your commerce, product, and analytics teams can fill in together.</p>
      </div>
      <Button className="home-pilot-copy" variant="inverse" type="button" onClick={copyChecklist} aria-live="polite">
        {copied ? <ClipboardCheck size={18} aria-hidden="true" /> : <Clipboard size={18} aria-hidden="true" />}
        {copied ? "Pilot brief copied" : "Copy pilot brief"}
      </Button>
    </div>
  );
}
