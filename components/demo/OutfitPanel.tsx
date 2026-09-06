"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  Check,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
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

interface PhotoAssessment {
  status: "not_supplied" | "passed" | "needs_new_photo" | "unavailable";
  suitable_for_try_on: boolean;
  framing: string;
  pose: string;
  issues: string[];
  guidance: string | null;
}

interface OutfitResponse {
  outfits?: Outfit[];
  photo_assessment?: PhotoAssessment | null;
}

type JourneyStatus = "idle" | "ranking" | "rendering" | "done" | "photo-error" | "error";
type RenderStatus = "waiting" | "queued" | "processing" | "done" | "error";

interface LookRender {
  status: RenderStatus;
  imageUrl?: string;
  message: string;
}

const PROMPT_STARTERS = [
  "A first date at an art gallery, polished but relaxed",
  "Dinner by the sea after sunset, romantic with comfortable walking",
  "A live music night with strong photographs and plenty of movement",
];

const MAX_USER_IMAGE_BYTES = 8 * 1024 * 1024;
const USER_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function formatMatch(confidence: number) {
  const normalized = confidence <= 1 ? confidence * 100 : confidence;
  return `${Math.max(0, Math.min(100, Math.round(normalized)))}% match`;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export default function OutfitPanel({
  brandId,
  catalogById,
  mustIncludeIds,
  onClearSelection,
}: {
  brandId: string;
  catalogById: Record<string, CatalogItem>;
  mustIncludeIds: string[];
  onClearSelection: () => void;
}) {
  const [status, setStatus] = useState<JourneyStatus>("idle");
  const [prompt, setPrompt] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<PhotoAssessment | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [renders, setRenders] = useState<LookRender[]>([]);
  const [error, setError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const runTokenRef = useRef(0);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    runTokenRef.current += 1;
  }, [photoPreview]);

  function resetResults() {
    runTokenRef.current += 1;
    setAssessment(null);
    setOutfits([]);
    setRenders([]);
    setError(null);
    setStatus("idle");
  }

  function handlePhoto(file: File | null) {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    resetResults();
    if (!file) return;
    if (!USER_IMAGE_TYPES.has(file.type)) {
      setError("Choose a JPEG, PNG, or WebP photo.");
      setStatus("error");
      return;
    }
    if (file.size > MAX_USER_IMAGE_BYTES) {
      setError("Choose a photo that is 8 MB or smaller.");
      setStatus("error");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function updateRender(index: number, next: LookRender) {
    setRenders((current) => current.map((render, renderIndex) => (
      renderIndex === index ? next : render
    )));
  }

  async function renderLook(outfit: Outfit, index: number, photo: File, token: number) {
    const itemIds = outfit.items
      .map((item) => item.item_id)
      .filter((id): id is string => Boolean(id && catalogById[id]));
    if (itemIds.length === 0) {
      updateRender(index, { status: "error", message: "This look has no renderable catalogue items." });
      return;
    }

    try {
      updateRender(index, { status: "queued", message: "Sending this look to the fitting room…" });
      const form = new FormData();
      form.set("photo", photo);
      form.set("itemIds", JSON.stringify(itemIds));
      const response = await fetch(`/api/demo/${brandId}/tryon`, { method: "POST", body: form });
      const accepted = await response.json();
      if (!response.ok) throw new Error(accepted.error || "Could not start this render.");

      for (let poll = 0; poll < 90; poll += 1) {
        if (runTokenRef.current !== token) return;
        const jobResponse = await fetch(`/api/demo/${brandId}/tryon/${accepted.job_id}`);
        const job = await jobResponse.json();
        if (!jobResponse.ok) throw new Error(job.error || "Could not read this render.");
        if (job.status === "completed") {
          const result = job.result as { output_image_base64: string; mime_type: string };
          if (!result?.output_image_base64) throw new Error("The render completed without an image.");
          updateRender(index, {
            status: "done",
            imageUrl: `data:${result.mime_type};base64,${result.output_image_base64}`,
            message: "Ready",
          });
          return;
        }
        if (job.status === "failed") {
          throw new Error(job.error?.message || "This render could not be completed.");
        }
        updateRender(index, {
          status: job.status === "processing" ? "processing" : "queued",
          message: job.status === "processing" ? "Dressing your photo…" : "Waiting for the fitting room…",
        });
        await wait(2_000);
      }
      throw new Error("This render is taking longer than expected. Try this look again.");
    } catch (renderError) {
      if (runTokenRef.current !== token) return;
      updateRender(index, {
        status: "error",
        message: renderError instanceof Error ? renderError.message : "This render could not be completed.",
      });
    }
  }

  async function fetchOutfits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const brief = prompt.trim();
    if (!photoFile) {
      setError("Add one clear, full-body photo to see the looks on you.");
      setStatus("error");
      photoInputRef.current?.focus();
      return;
    }
    if (brief.length < 4) {
      setError("Describe the occasion and how you want the outfit to feel.");
      setStatus("error");
      return;
    }

    const token = runTokenRef.current + 1;
    runTokenRef.current = token;
    setStatus("ranking");
    setError(null);
    setAssessment(null);
    setOutfits([]);
    setRenders([]);

    try {
      const form = new FormData();
      form.set("prompt", brief);
      form.set("limit", "3");
      form.set("userImage", photoFile);
      form.set("itemIds", JSON.stringify(mustIncludeIds));

      const response = await fetch(`/api/demo/${brandId}/outfits`, {
        method: "POST",
        body: form,
      });
      const data = await response.json() as OutfitResponse & { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not create your looks.");
      if (runTokenRef.current !== token) return;

      const photoAssessment = data.photo_assessment ?? null;
      setAssessment(photoAssessment);
      if (!photoAssessment || photoAssessment.status === "unavailable") {
        throw new Error(photoAssessment?.guidance || "Photo quality could not be checked. Try again.");
      }
      if (photoAssessment.status === "needs_new_photo" || !photoAssessment.suitable_for_try_on) {
        setStatus("photo-error");
        return;
      }

      const ranked = (data.outfits ?? []).slice(0, 3);
      if (ranked.length === 0) throw new Error("No compatible catalogue looks were returned.");
      setOutfits(ranked);
      setRenders(ranked.map(() => ({ status: "waiting", message: "Preparing this look…" })));
      setStatus("rendering");
      await Promise.allSettled(
        ranked.map((outfit, index) => renderLook(outfit, index, photoFile, token)),
      );
      if (runTokenRef.current === token) setStatus("done");
    } catch (requestError) {
      if (runTokenRef.current !== token) return;
      setError(requestError instanceof Error ? requestError.message : "Unknown error.");
      setStatus("error");
    }
  }

  async function retryRender(index: number) {
    const outfit = outfits[index];
    if (!outfit || !photoFile) return;
    const token = runTokenRef.current;
    setStatus("rendering");
    await renderLook(outfit, index, photoFile, token);
    if (runTokenRef.current === token) setStatus("done");
  }

  const friendlyError = error;
  const selectedItems = mustIncludeIds.map((id) => catalogById[id]).filter(Boolean);
  const busy = status === "ranking" || status === "rendering";

  return (
    <div className="demo-outfit-experience">
      <div className="demo-journey-rail" aria-label="Styling journey">
        <span className={photoFile ? "complete" : "active"}><b>1</b> Your photo</span>
        <span className={photoFile && prompt.trim().length >= 4 ? "complete" : ""}><b>2</b> Your plan</span>
        <span className={outfits.length ? "complete" : ""}><b>3</b> Your try-ons</span>
      </div>

      <div className="demo-stylist-panel">
        <form className="demo-stylist-form" onSubmit={fetchOutfits}>
          <div className="demo-stylist-form-head">
            <div className="demo-stylist-icon" aria-hidden="true"><Sparkles size={30} /></div>
            <div className="demo-stylist-intro">
              <span>One guided experience</span>
              <h3>Upload once. Receive complete looks on you.</h3>
              <p>STYLD checks the photo, ranks compatible catalogue outfits, and renders every recommendation automatically.</p>
            </div>
          </div>

          <div className="demo-stylist-input-grid">
            <label className={`demo-stylist-photo${photoPreview ? " has-photo" : ""}`}>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Add your full-body photo"
                onChange={(event) => handlePhoto(event.target.files?.[0] ?? null)}
              />
              {photoPreview ? (
                <>
                  <Image src={photoPreview} alt="Your selected photo" fill unoptimized sizes="320px" />
                  <span>Change photo</span>
                </>
              ) : (
                <span className="demo-stylist-photo-prompt">
                  <Camera size={30} aria-hidden="true" />
                  <strong>Add your photo</strong>
                  <small>One person · head to toe · facing forward</small>
                </span>
              )}
            </label>

            <div className="demo-brief-column">
              <label className="demo-chat-field">
                <span>Where are you going?</span>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Example: Dinner near Marine Drive at sunset. Romantic, polished and comfortable for a walk."
                  rows={6}
                  maxLength={600}
                />
                <small>{prompt.length}/600</small>
              </label>
              <div className="demo-photo-checklist" aria-label="Photo requirements">
                <span><Check size={14} /> Full body and feet visible</span>
                <span><Check size={14} /> Face and hands unobstructed</span>
                <span><Check size={14} /> Front-facing, even lighting</span>
              </div>
            </div>
          </div>

          <div className="demo-prompt-starters" aria-label="Styling brief ideas">
            {PROMPT_STARTERS.map((starter) => (
              <button type="button" key={starter} onClick={() => setPrompt(starter)}>{starter}</button>
            ))}
          </div>

          {selectedItems.length > 0 && (
            <div className="demo-required-items">
              <div>
                <span>Include my catalogue picks</span>
                <strong>{selectedItems.map((item) => item.name).join(" + ")}</strong>
              </div>
              <button type="button" onClick={onClearSelection}>Clear</button>
            </div>
          )}

          <div className="demo-stylist-submit-row">
            <p>Your photo moves directly from recommendation to try-on and stays out of STYLD&apos;s request logs.</p>
            <button
              type="submit"
              className="demo-button demo-button-lime demo-stylist-action"
              disabled={busy || !photoFile || prompt.trim().length < 4}
            >
              {status === "ranking" ? "Checking photo and styling…" : status === "rendering" ? "Rendering your looks…" : outfits.length ? "Create new looks" : "Create looks on me"}
              {!busy && <ArrowRight size={18} aria-hidden="true" />}
              {busy && <LoaderCircle className="demo-spin" size={18} aria-hidden="true" />}
            </button>
          </div>
        </form>

        {status === "ranking" && (
          <div className="demo-journey-loader" role="status" aria-live="polite">
            <span className="demo-loader-orbit"><LoaderCircle size={27} aria-hidden="true" /></span>
            <div>
              <strong>Checking your photo and composing your looks</strong>
              <p>STYLD is reviewing framing first, then occasion fit, compatible garment roles, colour, and proportion.</p>
            </div>
            <span className="demo-loader-label">Please keep this page open</span>
          </div>
        )}

        {status === "photo-error" && assessment && (
          <div className="demo-photo-feedback" role="alert">
            <span className="demo-photo-feedback-icon"><ImagePlus size={24} /></span>
            <div>
              <span>Let&apos;s use a clearer photo</span>
              <h3>{assessment.guidance || "Take one front-facing, head-to-toe photo."}</h3>
              {assessment.issues.length > 0 && <p>{assessment.issues.join(" ")}</p>}
            </div>
            <button type="button" onClick={() => photoInputRef.current?.click()}>Choose another photo</button>
          </div>
        )}
        {friendlyError && (
          <p className="demo-error-line" role="alert"><AlertCircle size={17} /> {friendlyError}</p>
        )}
      </div>

      {outfits.length > 0 && (
        <div className="demo-outfit-results">
          <div className="demo-results-head" aria-live="polite">
            <div>
              <span>Your STYLD fitting room</span>
              <strong>{outfits.length} complete looks, rendered on your photo</strong>
            </div>
            <span className="demo-results-context"><Check size={15} /> Photo approved for try-on</span>
          </div>

          <div className="demo-outfit-grid">
            {outfits.map((outfit, index) => {
              const render = renders[index] ?? { status: "waiting", message: "Preparing this look…" };
              const ids = outfit.items.map((item) => item.item_id).filter((id): id is string => Boolean(id));
              return (
                <article className="demo-outfit-card" key={`${outfit.name}-${index}`}>
                  <div className="demo-outfit-render">
                    {render.imageUrl ? (
                      <motion.img
                        src={render.imageUrl}
                        alt={`${outfit.name} rendered on your uploaded photo`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.35 }}
                      />
                    ) : (
                      <div className={`demo-render-state ${render.status}`}>
                        {render.status === "error" ? <AlertCircle size={30} /> : <LoaderCircle className="demo-spin" size={30} />}
                        <strong>{render.status === "error" ? "Render needs another pass" : `Look ${index + 1} is in progress`}</strong>
                        <span>{render.message}</span>
                        {render.status === "error" && (
                          <button type="button" onClick={() => retryRender(index)}><RefreshCw size={15} /> Retry this render</button>
                        )}
                      </div>
                    )}
                    <span className="demo-render-number">0{index + 1}</span>
                  </div>
                  <div className="demo-outfit-card-body">
                    <div className="demo-outfit-card-head">
                      <span>Look {String(index + 1).padStart(2, "0")}</span>
                      <strong>{formatMatch(outfit.confidence)}</strong>
                    </div>
                    <h3>{outfit.name}</h3>
                    <div className="demo-outfit-items" aria-label={`${outfit.name} source products`}>
                      {ids.map((id) => {
                        const item = catalogById[id];
                        return item ? (
                          <div className="demo-outfit-thumb" key={id}>
                            <Image src={item.image} alt={item.name} fill sizes="84px" />
                          </div>
                        ) : null;
                      })}
                    </div>
                    <p>{outfit.rationale}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
