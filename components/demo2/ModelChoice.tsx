"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import type { CatalogItem } from "@/lib/catalog";
import { MODELS, type ModelId, modelsFor } from "@/components/demo2/models";

/** Stand-in models, so a brand can run the room without uploading a photo of themselves.
 *
 *  Which models a brand sees is decided in models.ts — explicit config first, then a read of
 *  the loaded catalogue, then both. */
export default function ModelChoice({
  brand,
  catalog,
  onPick,
  onError,
}: {
  brand: string;
  catalog: CatalogItem[];
  onPick: (file: File) => void;
  onError: (message: string | null) => void;
}) {
  const [loading, setLoading] = useState<ModelId | null>(null);
  const offered = useMemo(() => modelsFor(brand, catalog), [brand, catalog]);

  async function pick(id: ModelId) {
    setLoading(id);
    onError(null);
    try {
      const response = await fetch(MODELS[id].src);
      if (!response.ok) throw new Error(String(response.status));
      const blob = await response.blob();
      onPick(new File([blob], `${id}-model.png`, { type: blob.type || "image/png" }));
    } catch {
      onError("That model could not be loaded. Try again, or upload a photo instead.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="sr-models">
      <p className="sr-models-head">
        <UserRound size={15} aria-hidden="true" />
        No photo to hand? Use a {offered.length === 1 ? "stand-in" : "model"}.
      </p>
      <div className="sr-models-row">
        {offered.map((id) => (
          <button key={id} type="button" className="sr-model" onClick={() => pick(id)} disabled={loading !== null}>
            <span className="sr-model-thumb">
              <Image src={MODELS[id].src} alt="" fill sizes="44px" style={{ objectFit: "cover", objectPosition: "center top" }} />
            </span>
            <span>{loading === id ? "Loading…" : MODELS[id].label}</span>
          </button>
        ))}
      </div>
      <p className="sr-models-note">Runs the same live endpoints as an uploaded photo.</p>
    </div>
  );
}
