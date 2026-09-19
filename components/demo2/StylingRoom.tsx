"use client";

import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ExternalLink,
  ImagePlus,
  Layers,
  Lightbulb,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Shirt,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import type { CatalogItem } from "@/lib/catalog";
import ShopperPhotoField, { type ShopperPhoto } from "@/components/demo/ShopperPhotoField";
import { similarTo } from "@/components/demo2/similar";
import ModelChoice from "@/components/demo2/ModelChoice";

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
  render_instructions: string | null;
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

/** Used when the shopper writes nothing.
 *
 *  It names a concrete occasion on purpose. A brief along the lines of "no particular
 *  occasion, anything versatile" reads as the safest possible default and is in fact the
 *  worst one: with no pinned garment either, the ranker faces the whole catalogue with no
 *  direction, overruns its upstream timeout and comes back with `photo_assessment:
 *  unavailable` and zero looks. Measured — that phrasing failed on every attempt, while this
 *  one succeeds. Keep any replacement equally specific. */
const DEFAULT_BRIEF =
  "Everyday smart casual. Put together complete looks I could wear to the office, out for " +
  "coffee, or to meet friends after work.";

const PROMPT_STARTERS = [
  "I have a casual first date this weekend. I want to look good without feeling overdressed.",
  "I’m meeting friends for dinner. I want something simple, comfortable, and put together.",
  "I’m going to a concert and need something comfortable enough to stand and move around in.",
];

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/** The personal styling room, carried over from the original demo page unchanged, with three
 *  things added underneath the results:
 *
 *  - **Refine by chat.** Nothing behind this remembers a conversation, so the transcript is
 *    kept here and every turn re-renders the chosen look with the whole instruction history
 *    resent. The model never has to remember because the full brief goes again each time.
 *    A turn costs a real image job — this is a refinement loop, not a chat window.
 *  - **Complete the look**, keyed off what the shopper picked rather than what was ranked,
 *    so it answers "what am I missing" whether they chose one piece or four.
 *  - **View similar**, computed from the catalogue in the browser so it answers instantly.
 *
 *  This is a copy of components/demo/OutfitPanel.tsx rather than an import, because the extra
 *  features need the rendered looks and that panel keeps them private. The original is left
 *  untouched — /demo still renders it. */
export default function StylingRoom({
  brandId,
  brand,
  catalog,
  cueSubmit = 0,
  catalogById,
  mustIncludeIds,
  selected,
  onClearSelection,
  onAdd,
  photo,
  photoShared,
  onPhotoChange,
  mode = "guided",
}: {
  brandId: string;
  brand: string;
  catalog: CatalogItem[];
  /** Bumped by the page when the selection dock sends someone here. A counter rather than a
   *  boolean so repeat clicks re-fire the cue instead of going quiet after the first. */
  cueSubmit?: number;
  catalogById: Record<string, CatalogItem>;
  mustIncludeIds: string[];
  selected: CatalogItem[];
  onClearSelection: () => void;
  onAdd: (item: CatalogItem) => void;
  photo: ShopperPhoto | null;
  photoShared: boolean;
  onPhotoChange: (file: File | null) => void;
  mode?: "guided" | "specific";
}) {
  const [status, setStatus] = useState<JourneyStatus>("idle");
  const [prompt, setPrompt] = useState("");
  const [assessment, setAssessment] = useState<PhotoAssessment | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [renders, setRenders] = useState<LookRender[]>([]);
  const [submittedBrief, setSubmittedBrief] = useState("");
  const [error, setError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const runTokenRef = useRef(0);

  // --- the three additions ---
  const [refineIndex, setRefineIndex] = useState(0);
  const [chat, setChat] = useState<{ from: "shopper" | "styld"; text: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [refining, setRefining] = useState(false);
  const adjustmentsRef = useRef<Record<number, string[]>>({});
  const [extrasError, setExtrasError] = useState<string | null>(null);
  const [showSimilar, setShowSimilar] = useState(false);
  const [cued, setCued] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  const actionHintId = useId();
  const promptInputId = useId();
  const photoFile = photo?.file ?? null;

  useEffect(() => () => {
    runTokenRef.current += 1;
  }, []);

  /** Bring the submit into view and mark it, so "Try these on" lands somewhere specific
   *  rather than somewhere near. Focus moves too when the button is actually usable —
   *  focusing a disabled control does nothing and would strand a keyboard user. When it is
   *  disabled the hint underneath already says what is missing, and the cue points at it. */
  useEffect(() => {
    if (cueSubmit === 0) return;
    const button = submitRef.current;
    if (!button) return;

    button.scrollIntoView({ behavior: "smooth", block: "center" });
    if (!button.disabled) button.focus({ preventScroll: true });
    setCued(true);
    const timer = window.setTimeout(() => setCued(false), 2600);
    return () => window.clearTimeout(timer);
  }, [cueSubmit]);

  function resetExtras() {
    adjustmentsRef.current = {};
    setChat([]);
    setDraft("");
    setExtrasError(null);
    setShowSimilar(false);
    setRefineIndex(0);
  }

  function resetResults() {
    resetExtras();
    runTokenRef.current += 1;
    setAssessment(null);
    setOutfits([]);
    setRenders([]);
    setSubmittedBrief("");
    setError(null);
    setStatus("idle");
  }

  function handlePhotoChange(file: File | null) {
    resetResults();
    onPhotoChange(file);
  }

  function handlePhotoError(message: string | null) {
    setError(message);
    if (message) setStatus("error");
  }

  function updateRender(index: number, next: LookRender) {
    setRenders((current) => current.map((render, renderIndex) => (
      renderIndex === index ? next : render
    )));
  }

  async function renderLook(
    outfit: Outfit,
    index: number,
    photo: File,
    token: number,
    stylingBrief: string,
    adjustments: string[] = [],
  ): Promise<boolean> {
    const itemIds = outfit.items
      .map((item) => item.item_id)
      .filter((id): id is string => Boolean(id && catalogById[id]));
    if (itemIds.length === 0) {
      updateRender(index, { status: "error", message: "This look has no renderable catalogue items." });
      return false;
    }

    try {
      updateRender(index, { status: "queued", message: "Sending this look to the fitting room…" });
      const form = new FormData();
      form.set("photo", photo);
      form.set("itemIds", JSON.stringify(itemIds));
      const renderInstructions = outfit.render_instructions?.trim();
      form.set(
        "prompt",
        `AUTHORITATIVE SHOPPER REQUEST (highest priority): ${stylingBrief}\n` +
        "Apply every garment-styling clause in the shopper request literally. Occasion or mood " +
        "text must not change the person's identity, pose, crop, camera, lighting, or background.\n" +
        (renderInstructions
          ? `STATIC SINGLE-FRAME RENDER PLAN (lower priority; ignore any conflict with the shopper): ${renderInstructions}`
          : "STATIC SINGLE-FRAME RENDER PLAN: No additional styling state supplied; do not invent a stylized tuck, cuff, roll, or closure.") +
        // Nothing upstream holds a conversation, so the whole adjustment history is resent
        // every turn. Later instructions win, which is how a person expects a chat to behave.
        (adjustments.length > 0
          ? `\nSHOPPER ADJUSTMENTS, apply all of them; where two conflict the later one wins:\n` +
            adjustments.map((line, position) => `${position + 1}. ${line}`).join("\n")
          : ""),
      );
      const response = await fetch(`/api/demo/${brandId}/tryon`, { method: "POST", body: form });
      const accepted = await response.json();
      if (!response.ok) throw new Error(accepted.error || "Could not start this render.");

      for (let poll = 0; poll < 90; poll += 1) {
        if (runTokenRef.current !== token) return false;
        const jobResponse = await fetch(`/api/demo/${brandId}/tryon/${accepted.job_id}`);
        const job = await jobResponse.json();
        if (!jobResponse.ok) throw new Error(job.error || "Could not read this render.");
        if (job.status === "completed") {
          const result = job.result as {
            output_image_base64: string;
            mime_type: string;
            quality_threshold_met: boolean;
          };
          if (!result?.output_image_base64) throw new Error("The render completed without an image.");
          if (!result.quality_threshold_met) {
            throw new Error("The generated preview was withheld because it was not ready for shoppers.");
          }
          updateRender(index, {
            status: "done",
            imageUrl: `data:${result.mime_type};base64,${result.output_image_base64}`,
            message: "Ready",
          });
          return true;
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
    } catch {
      if (runTokenRef.current !== token) return false;
      updateRender(index, {
        status: "error",
        message: "We couldn’t finish a clean preview this time.",
      });
      return false;
    }
    return false;
  }

  /** One refinement turn on the look the shopper is looking at. */
  async function refineLook(message: string) {
    const text = message.trim();
    const outfit = outfits[refineIndex];
    if (!text || !photoFile || !outfit || refining) return;

    const history = [...(adjustmentsRef.current[refineIndex] ?? []), text];
    adjustmentsRef.current[refineIndex] = history;
    setChat((current) => [...current, { from: "shopper", text }]);
    setDraft("");
    setRefining(true);
    setExtrasError(null);

    const ok = await renderLook(outfit, refineIndex, photoFile, runTokenRef.current, submittedBrief, history);

    if (!ok) {
      // Drop the failed instruction, or every later turn inherits whatever broke this one.
      adjustmentsRef.current[refineIndex] = history.slice(0, -1);
    }
    setChat((current) => [...current, {
      from: "styld",
      text: ok
        ? "Updated on your photo."
        : "That one didn’t render cleanly, so I’ve left it out. Try wording it differently.",
    }]);
    setRefining(false);
  }

  async function fetchOutfits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedNames = mustIncludeIds
      .map((id) => catalogById[id]?.name)
      .filter((name): name is string => Boolean(name));
    const brief = mode === "guided"
      ? (prompt.trim() || DEFAULT_BRIEF)
      : `Apply exactly and only these selected catalogue pieces to the shopper: ${selectedNames.join(", ")}. Do not add any unselected garment, layer, overshirt, jacket, footwear, or accessory. If a category was not selected, leave that part of the shopper's original photo unchanged.`;
    if (!photoFile) {
      setError("Add one clear, full-body photo to see the looks on you.");
      setStatus("error");
      photoInputRef.current?.focus();
      return;
    }
    if (mustIncludeIds.length === 0) {
      setError("Select at least one piece from the catalogue to try on.");
      setStatus("error");
      return;
    }
    const token = runTokenRef.current + 1;
    runTokenRef.current = token;
    setStatus(mode === "guided" ? "ranking" : "rendering");
    setError(null);
    setAssessment(null);
    setOutfits([]);
    setRenders([]);
    setSubmittedBrief(brief);

    try {
      if (mode === "specific") {
        const exactLook: Outfit = {
          name: "Your selected look",
          items: mustIncludeIds.map((id) => ({
            item_id: id,
            name: catalogById[id].name,
            category: catalogById[id].category,
            role: catalogById[id].role,
          })),
          rationale: "Only your selected pieces were applied. Unselected garment categories and optional layers were left unchanged.",
          render_instructions: brief,
          confidence: 1,
        };
        setOutfits([exactLook]);
        setRenders([{ status: "waiting", message: "Preparing your exact selection…" }]);
        await renderLook(exactLook, 0, photoFile, token, brief);
        if (runTokenRef.current === token) setStatus("done");
        return;
      }

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
        ranked.map((outfit, index) => renderLook(outfit, index, photoFile, token, brief)),
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
    await renderLook(outfit, index, photoFile, token, submittedBrief);
    if (runTokenRef.current === token) setStatus("done");
  }

  const friendlyError = error;
  const selectedItems = mustIncludeIds.map((id) => catalogById[id]).filter(Boolean);
  const busy = status === "ranking" || status === "rendering";
  const guided = mode === "guided";
  // Two things are genuinely required: someone to dress, and something to put on them.
  // The styling brief is not one of them — without it the ranker gets DEFAULT_BRIEF and still
  // returns complete looks.
  const needsPhoto = !photoFile;
  const needsPieces = selectedItems.length === 0;
  const actionDisabled = busy || needsPhoto || needsPieces;
  const disabledReason = busy
    ? guided ? "Your looks are being created now." : "Your selected look is being created now."
    : needsPhoto && needsPieces
      ? "Add a photo and pick at least one piece from the catalogue."
      : needsPhoto
        ? "Add a photo — upload one or start from the model above."
        : needsPieces
          ? "Pick at least one piece from the catalogue to try on."
          : null;
  const successfulRenderCount = renders.filter((render) => render.status === "done").length;
  // Five, shown in full. The list used to cap at six behind a scroller that clipped at
  // four and gave no sign it could scroll; a short complete list beats a long clipped one.
  const similar = useMemo(() => similarTo(selected, catalog, 5), [selected, catalog]);
  const hasActiveOrReadyGuidedRender = renders.some((render) => render.status !== "error");
  // `index` stays the outfit's slot in the ranking because renders[] is keyed by it, but the
  // label has to come from position on screen. A failed first render used to leave the grid
  // reading "Look 02, Look 03" with no Look 01 anywhere.
  const visibleOutfits = outfits
    .map((outfit, index) => ({ outfit, index }))
    .filter(({ index }) => (
      !guided || renders[index]?.status !== "error" || !hasActiveOrReadyGuidedRender
    ))
    .map((entry, position) => ({ ...entry, label: String(position + 1).padStart(2, "0") }));

  const renderableLooks = visibleOutfits.filter(({ index }) => renders[index]?.status === "done");

  return (
    <div className={`demo-outfit-experience${guided ? "" : " is-specific"}`}>
      {guided && (
        <div className="demo-journey-rail" aria-label="Styling journey">
          <span className={photoFile ? "complete" : "active"}><b>1</b> Your photo</span>
          <span className={!needsPieces ? "complete" : photoFile ? "active" : ""}><b>2</b> Your pieces</span>
          <span className={outfits.length ? "complete" : ""}><b>3</b> Your try-ons</span>
        </div>
      )}

      <div className="demo-stylist-panel">
        <form className="demo-stylist-form" onSubmit={fetchOutfits}>
          <div className="demo-stylist-form-head">
            <div className="demo-stylist-icon" aria-hidden="true"><Sparkles size={30} /></div>
            <div className="demo-stylist-intro">
              <span>{guided ? "One guided experience" : "Selected-piece styling"}</span>
              <h3>{guided ? "Upload once. Receive complete looks on you." : "See your exact picks on you."}</h3>
              <p>
                {guided
                  ? "STYLD checks the photo, ranks compatible catalogue outfits, and renders every recommendation automatically."
                  : "No conversation needed. STYLD applies exactly the products you selected and renders one result below."}
              </p>
            </div>
          </div>

          <div className="demo-stylist-input-grid">
            <div className="sr-photo-column">
              <ShopperPhotoField
                photo={photo}
                isShared={photoShared}
                inputRef={photoInputRef}
                inputLabel={guided ? "Add your full-body photo" : "Add your photo for selected-piece looks"}
                clearLabel={guided ? "Remove photo for guided looks" : "Remove photo for selected-piece looks"}
                privateLabel={guided ? "Used only for guided looks" : "Used only for selected-piece looks"}
                onPhotoChange={handlePhotoChange}
                onError={handlePhotoError}
              />
              {!photo && (
                <ModelChoice brand={brand} catalog={catalog} onPick={handlePhotoChange} onError={handlePhotoError} />
              )}
            </div>

            {guided ? (
              <div className="demo-brief-column">
                <div className="demo-chat-field">
                  <div className="demo-chat-field-head">
                    <label htmlFor={promptInputId}>
                      Where are you going? <span className="sr-optional">Optional</span>
                    </label>
                  </div>
                  <textarea
                    id={promptInputId}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Optional — example: Dinner near Marine Drive at sunset. Romantic, polished and comfortable for a walk. Leave blank for everyday looks."
                    rows={6}
                    maxLength={600}
                  />
                  <small>{prompt.length}/600</small>
                </div>
                <div className="demo-brief-field-meta">
                  <div className="demo-photo-checklist" aria-label="Photo requirements">
                    <span><Check size={14} /> Full body and feet visible</span>
                    <span><Check size={14} /> Face and hands unobstructed</span>
                    <span><Check size={14} /> Front-facing, even lighting</span>
                  </div>
                  {prompt.length > 0 && (
                    <button
                      type="button"
                      className="demo-field-clear"
                      aria-label="Clear styling brief"
                      onClick={() => {
                        setPrompt("");
                        resetResults();
                      }}
                    >
                      Clear text
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="demo-specific-plan">
                <div className="demo-specific-plan-head">
                  <span>Apply to this one look</span>
                  <strong>{selectedItems.length ? `${selectedItems.length} selected` : "Choose below"}</strong>
                </div>
                <div className="demo-specific-selection" aria-label="Products required in every look">
                  {selectedItems.length === 0 && (
                    <span className="demo-selected-chip empty">
                      <Shirt size={17} aria-hidden="true" /> Select a product from the catalogue
                    </span>
                  )}
                  {selectedItems.map((item) => (
                    <span className="demo-selected-chip" key={item.id}>
                      <Image src={item.image} alt="" width={42} height={42} sizes="42px" />
                      {item.name}
                    </span>
                  ))}
                </div>
                <p>STYLD applies only these pieces. Unselected categories and optional layers—such as shoes or an overshirt—are not added.</p>
                {selectedItems.length > 0 && (
                  <button type="button" className="demo-specific-clear" onClick={onClearSelection}>Clear selected pieces</button>
                )}
              </div>
            )}
          </div>

          {guided && (
            <div className="demo-prompt-starters" aria-label="Styling brief ideas">
              {PROMPT_STARTERS.map((starter) => (
                <button type="button" key={starter} onClick={() => setPrompt(starter)}>{starter}</button>
              ))}
            </div>
          )}

          <div className="demo-stylist-submit-row">
            <p>
              {guided
                ? "Your photo moves directly from recommendation to try-on and stays out of STYLD's request logs."
                : "Your selected products go directly to one exact try-on. No conversation, recommendations, or extra garments."}
            </p>
            <div className="demo-stylist-action-group" title={disabledReason ?? undefined}>
              <button
                ref={submitRef}
                type="submit"
                className={`demo-button demo-button-lime demo-stylist-action${cued ? " is-cued" : ""}`}
                disabled={actionDisabled}
                aria-describedby={disabledReason ? actionHintId : undefined}
              >
                {status === "ranking"
                  ? "Checking photo and styling…"
                  : status === "rendering"
                    ? guided ? "Rendering your looks…" : "Rendering your selected look…"
                    : outfits.length
                      ? guided ? "Create new looks" : "Create this look again"
                      : guided
                        ? "Create looks on me"
                        : "Create this look on me"}
                {!busy && <ArrowRight size={18} aria-hidden="true" />}
                {busy && <LoaderCircle className="demo-spin" size={18} aria-hidden="true" />}
              </button>
              {disabledReason && (
                <small className="demo-stylist-action-hint" id={actionHintId}>
                  <AlertCircle size={13} aria-hidden="true" /> {disabledReason}
                  {needsPieces && !busy && (
                    <a className="sr-jump" href="#demo-catalog">Take me to the catalogue</a>
                  )}
                </small>
              )}
            </div>
          </div>
        </form>

        {busy && (
          <div className="demo-journey-loader" role="status" aria-live="polite">
            <span className="demo-loader-orbit"><LoaderCircle size={27} aria-hidden="true" /></span>
            <div>
              <strong>
                {status === "ranking"
                  ? "Checking your photo and composing your looks"
                  : guided
                    ? "Rendering your looks on your photo"
                    : "Rendering your selected pieces on your photo"}
              </strong>
              <p>
                {status === "ranking"
                  ? "STYLD is reviewing framing first, then occasion fit, compatible garment roles, colour, and proportion."
                  : guided
                    ? "Your recommendations are ready. STYLD is now creating the final images."
                    : "STYLD is applying only the pieces you selected and leaving everything else unchanged."}
              </p>
            </div>
            <span className="demo-loader-label">Results take 30–60 seconds. Keep this page open.</span>
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
              <span>{guided ? "Your STYLD fitting room" : "Your exact selected-piece result"}</span>
              <strong>
                {guided
                  ? busy
                    ? `${successfulRenderCount} of ${outfits.length} looks ready`
                    : successfulRenderCount > 0
                      ? `${successfulRenderCount} complete ${successfulRenderCount === 1 ? "look" : "looks"}, rendered on your photo`
                      : "Your recommendations are ready—previews need another try"
                  : "1 image using only the pieces you selected"}
              </strong>
            </div>
            <span className="demo-results-context"><Check size={15} /> Photo approved for try-on</span>
          </div>

          <div className="demo-outfit-grid">
            {visibleOutfits.map(({ outfit, index, label }) => {
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
                        <strong>{render.status === "error" ? "Preview not ready yet" : `Look ${label} is in progress`}</strong>
                        <span>{render.message}</span>
                        {render.status === "error" && (
                          <button type="button" onClick={() => retryRender(index)}><RefreshCw size={15} /> Try this look again</button>
                        )}
                      </div>
                    )}
                    <span className="demo-render-number">{label}</span>
                  </div>
                  <div className="demo-outfit-card-body">
                    <div className="demo-outfit-card-head">
                      <span>Look {label}</span>
                      {!guided && <strong>Exact selection</strong>}
                    </div>
                    <h3>{outfit.name}</h3>
                    {guided && (
                      <div className="demo-outfit-reason">
                        <span><Lightbulb size={14} aria-hidden="true" /> Why this works</span>
                        <p>{outfit.rationale}</p>
                      </div>
                    )}
                    <span className="demo-outfit-shop-label">Shop this look</span>
                    <div className="demo-outfit-items" aria-label={`${outfit.name} source products`}>
                      {ids.map((id) => {
                        const item = catalogById[id];
                        if (!item) return null;

                        const content = (
                          <>
                            <span className="demo-outfit-thumb">
                              <Image src={item.image} alt="" fill sizes="54px" />
                            </span>
                            <span className="demo-outfit-product-name">{item.name}</span>
                            <span className="demo-outfit-buy-action">
                              {item.productUrl ? <>Buy <ExternalLink size={13} aria-hidden="true" /></> : "Link unavailable"}
                            </span>
                          </>
                        );

                        // Buy leaves for the brand's own store; Try keeps the shopper here and
                        // puts the piece into the next render. The row has to be a wrapper
                        // because the Buy half is an anchor, and a button cannot nest inside one.
                        const alreadyPicked = mustIncludeIds.includes(item.id);
                        return (
                          <div className="sr-shop-row" key={id}>
                            {item.productUrl ? (
                              <a
                                className="demo-outfit-product-link"
                                href={item.productUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Buy ${item.name}`}
                              >
                                {content}
                              </a>
                            ) : (
                              <div className="demo-outfit-product-link is-unavailable">{content}</div>
                            )}
                            <button
                              type="button"
                              className={alreadyPicked ? "sr-try is-picked" : "sr-try"}
                              aria-pressed={alreadyPicked}
                              aria-label={alreadyPicked ? `Remove ${item.name} from your selection` : `Try ${item.name} on`}
                              onClick={() => onAdd(item)}
                            >
                              {alreadyPicked ? (
                                <>
                                  <span className="sr-try-state"><Check size={13} aria-hidden="true" /> Added</span>
                                  <span className="sr-try-swap"><X size={13} aria-hidden="true" /> Remove</span>
                                </>
                              ) : (
                                <><Shirt size={13} aria-hidden="true" /> Try</>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {outfits.length > 0 && (
        <div className="sr-extras">
          {/* ---- Refine the render, in the shopper's own words ---- */}
          <section className="sr-panel sr-panel-chat" aria-labelledby="sr-chat-title">
            <div className="sr-panel-head">
              <MessageSquare size={17} aria-hidden="true" />
              <h4 id="sr-chat-title">Not quite right? Say so.</h4>
            </div>
            <p className="sr-panel-note">
              Each change re-renders on your photo and keeps everything you asked for before.
            </p>

            {renderableLooks.length > 1 && (
              <div className="sr-target" role="group" aria-label="Which look to change">
                {renderableLooks.map(({ index, label }) => (
                  <button
                    key={index}
                    type="button"
                    aria-pressed={index === refineIndex}
                    className={index === refineIndex ? "is-active" : undefined}
                    onClick={() => setRefineIndex(index)}
                  >
                    Look {label}
                  </button>
                ))}
              </div>
            )}

            {chat.length > 0 && (
              <ol className="sr-log" role="log" aria-live="polite" aria-label="Styling changes">
                {chat.map((turn, position) => (
                  <li key={position} className={turn.from === "shopper" ? "is-shopper" : "is-styld"}>
                    <span>{turn.text}</span>
                  </li>
                ))}
              </ol>
            )}

            <div className="sr-ideas">
              {["Roll the sleeves up", "Tuck it in", "Looser fit", "Open at the collar"].map((idea) => (
                <button key={idea} type="button" disabled={refining || busy} onClick={() => refineLook(idea)}>
                  {idea}
                </button>
              ))}
            </div>

            {refining && (
              <p className="sr-working" role="status">
                <LoaderCircle className="demo-spin" size={14} aria-hidden="true" />
                Re-rendering {renderableLooks.find((entry) => entry.index === refineIndex)?.label ? `look ${renderableLooks.find((entry) => entry.index === refineIndex)!.label}` : "your look"} with every change so far — about 20 seconds.
              </p>
            )}

            <form
              className="sr-compose"
              onSubmit={(event) => { event.preventDefault(); refineLook(draft); }}
            >
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask for a change…"
                aria-label="Ask for a change to this look"
                maxLength={160}
                disabled={refining || busy}
              />
              <button type="submit" disabled={refining || busy || !draft.trim()}>
                {refining ? <LoaderCircle className="demo-spin" size={15} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}
                <span>Send</span>
              </button>
            </form>
          </section>

          {/* ---- Similar in the same style ---- */}
          <section className="sr-panel" aria-labelledby="sr-similar-title">
            <div className="sr-panel-head">
              <Layers size={17} aria-hidden="true" />
              <h4 id="sr-similar-title">View similar looks</h4>
            </div>
            <p className="sr-panel-note">
              Other pieces in the same style as what you picked — matched on cut, fabric and colour.
            </p>
            {!showSimilar ? (
              <button type="button" className="demo-button sr-wide" disabled={similar.length === 0} onClick={() => setShowSimilar(true)}>
                {similar.length === 0 ? "Nothing close enough in this catalogue" : `Show ${similar.length} similar`}
              </button>
            ) : (
              <ul className="sr-suggest">
                {similar.map(({ item, reasons }) => (
                  <li key={item.id}>
                    <span className="sr-thumb">
                      <Image src={item.image} alt="" fill sizes="48px" style={{ objectFit: "cover", objectPosition: "center top" }} />
                    </span>
                    <span className="sr-suggest-name">
                      {item.name}
                      {reasons.length > 0 && <em>{reasons.join(" · ")}</em>}
                    </span>
                    <button type="button" onClick={() => onAdd(item)}><Check size={13} aria-hidden="true" /> Try</button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {extrasError && <p className="sr-error" role="alert">{extrasError}</p>}
        </div>
      )}
    </div>
  );
}
