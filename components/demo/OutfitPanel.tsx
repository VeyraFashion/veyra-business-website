"use client";

import { useState } from "react";
import Image from "next/image";
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
      <div className="panel panel-idle">
        <svg viewBox="0 0 24 24"><use href="#g-sparkle" /></svg>
        <p>Veyra scores every combination in the catalog above on fit, weather, occasion, and your stated preferences — then ranks the best three.</p>
        <button type="button" className="btn btn-primary" onClick={fetchOutfits} disabled={status === "loading"}>
          {status === "loading" ? "Styling…" : "✨ Get AI-styled outfit ideas"}
        </button>
        {friendlyError && <p className="error-line">{friendlyError}</p>}
      </div>
    );
  }

  return (
    <div>
      <motion.div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
        initial={reduced ? undefined : "hidden"}
        animate={reduced ? undefined : "visible"}
        variants={reduced ? undefined : groupVariants}
      >
        {outfits.map((outfit, idx) => {
          const ids = outfit.items.map((i) => i.item_id).filter((id): id is string => !!id);
          return (
            <motion.div
              className="card outfit-card"
              key={idx}
              variants={reduced ? undefined : cardVariants}
              whileHover={reduced ? undefined : { y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
            >
              <div className="title-row">
                <span className="title">{outfit.name}</span>
              </div>
              <div className="outfit-items">
                {ids.map((id) => {
                  const item = catalogById[id];
                  return item ? (
                    <div className="mini-thumb" key={id}>
                      <Image src={item.image} alt={item.name} width={96} height={96} sizes="48px" />
                    </div>
                  ) : null;
                })}
              </div>
              <p className="rationale">{outfit.rationale}</p>
              <button
                type="button"
                className="btn btn-primary btn-sm btn-block"
                onClick={() => onTryOutfit(ids)}
                disabled={ids.length === 0}
              >
                Try this outfit on
              </button>
            </motion.div>
          );
        })}
      </motion.div>
      <AnimatePresence>
        {friendlyError && (
          <p className="error-line" style={{ textAlign: "left", marginTop: 12 }}>
            {friendlyError}
          </p>
        )}
      </AnimatePresence>
    </div>
  );
}
