"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import type { CatalogItem } from "@/lib/catalog";

interface OutfitItemRef {
  item_id: string | null;
  name: string;
  category: string;
  role: string | null;
}

interface Outfit {
  name: string;
  items: OutfitItemRef[];
  rationale: string;
  confidence: number;
}

const groupVariants: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function formatMatch(confidence: number) {
  const normalized = confidence <= 1 ? confidence * 100 : confidence;
  return `${Math.max(0, Math.min(100, Math.round(normalized)))}% match`;
}

export default function OutfitPanel({
  brandId,
  catalogById,
  onTryOutfit,
}: {
  brandId: string;
  catalogById: Record<string, CatalogItem>;
  onTryOutfit: (itemIds: string[]) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();

  async function fetchOutfits() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`/api/demo/${brandId}/outfits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion: "everyday casual", limit: 3 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not rank outfits.");
      setOutfits(data.outfits ?? []);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
      setStatus("error");
    }
  }

  const friendlyError =
    error &&
    (error.toLowerCase().includes("gemini") || error.toLowerCase().includes("credential")
      ? "Connect the Gemini API key in veyra-ai/.env to activate live outfit ranking."
      : error);

  if (outfits.length === 0) {
    return (
      <div className="demo-stylist-panel">
        <div className="demo-stylist-icon" aria-hidden="true"><Sparkles size={30} /></div>
        <div className="demo-stylist-intro">
          <span>Live recommendation</span>
          <p>
            Veyra compares compatible combinations across silhouette, color, weather,
            occasion, and catalog coverage, then returns three explainable looks.
          </p>
        </div>
        <button
          type="button"
          className="demo-button demo-button-lime demo-stylist-action"
          onClick={fetchOutfits}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Styling the catalog…" : "Generate three looks"}
          {status !== "loading" && <ArrowRight size={18} aria-hidden="true" />}
        </button>
        {friendlyError && <p className="demo-error-line">{friendlyError}</p>}
      </div>
    );
  }

  return (
    <div className="demo-outfit-results">
      <motion.div
        className="demo-outfit-grid"
        initial={reduced ? undefined : "hidden"}
        animate={reduced ? undefined : "visible"}
        variants={reduced ? undefined : groupVariants}
      >
        {outfits.map((outfit, idx) => {
          const ids = outfit.items.map((item) => item.item_id).filter((id): id is string => !!id);
          return (
            <motion.article
              className="demo-outfit-card"
              key={`${outfit.name}-${idx}`}
              variants={reduced ? undefined : cardVariants}
              whileHover={reduced ? undefined : { y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
            >
              <div className="demo-outfit-card-head">
                <span>Look {String(idx + 1).padStart(2, "0")}</span>
                <strong>{formatMatch(outfit.confidence)}</strong>
              </div>
              <h3>{outfit.name}</h3>
              <div className="demo-outfit-items" aria-label={`${outfit.name} products`}>
                {ids.map((id) => {
                  const item = catalogById[id];
                  return item ? (
                    <div className="demo-outfit-thumb" key={id}>
                      <Image src={item.image} alt={item.name} fill sizes="110px" />
                    </div>
                  ) : null;
                })}
              </div>
              <p>{outfit.rationale}</p>
              <button
                type="button"
                className="demo-button demo-button-dark demo-outfit-action"
                onClick={() => onTryOutfit(ids)}
                disabled={ids.length === 0}
              >
                Try this look <ArrowRight size={17} aria-hidden="true" />
              </button>
            </motion.article>
          );
        })}
      </motion.div>
      <AnimatePresence>
        {friendlyError && <p className="demo-error-line">{friendlyError}</p>}
      </AnimatePresence>
    </div>
  );
}
