"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import type { CatalogItem } from "@/lib/catalog";

type Status = "idle" | "submitting" | "polling" | "done" | "error";

export default function TryOnPanel({
  brandId,
  selectedItems,
}: {
  brandId: string;
  selectedItems: CatalogItem[];
}) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = usePrefersReducedMotion();

  function handlePhoto(file: File | null) {
    setPhotoFile(file);
    setResultUrl(null);
    setError(null);
    setStatus("idle");
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function stopPolling() {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }

  async function pollJob(jobId: string) {
    try {
      const res = await fetch(`/api/demo/${brandId}/tryon/${jobId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to check job status.");

      if (data.status === "completed") {
        const result = data.result as { output_image_base64: string; mime_type: string };
        setResultUrl(`data:${result.mime_type};base64,${result.output_image_base64}`);
        setStatus("done");
        setStatusMessage("");
        return;
      }
      if (data.status === "failed") {
        setError(data.error?.message || "Generation failed.");
        setStatus("error");
        return;
      }
      setStatusMessage(
        data.status === "processing" ? "Generating your try-on…" : "Queued…"
      );
      pollTimer.current = setTimeout(() => pollJob(jobId), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error while polling.");
      setStatus("error");
    }
  }

  async function submit() {
    if (!photoFile || selectedItems.length === 0) return;
    stopPolling();
    setStatus("submitting");
    setError(null);
    setResultUrl(null);
    setStatusMessage("Uploading…");

    try {
      const form = new FormData();
      form.set("photo", photoFile);
      form.set("itemIds", JSON.stringify(selectedItems.map((i) => i.id)));

      const res = await fetch(`/api/demo/${brandId}/tryon`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start try-on job.");

      setStatus("polling");
      setStatusMessage("Queued…");
      pollJob(data.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
      setStatus("error");
    }
  }

  const busy = status === "submitting" || status === "polling";
  const friendlyError =
    error &&
    (error.toLowerCase().includes("gemini") || error.toLowerCase().includes("credential")
      ? "The AI service isn't configured yet (missing Gemini API key on the server) — this UI is fully wired, it just needs a real key in veyra-ai/.env."
      : error);

  return (
    <div className="panel">
      <div className="tryon-layout">
        {/* ---- Left: input — your photo + what you're wearing ---- */}
        <div className="tryon-col">
          <div className="tryon-col-label">Your Photo</div>
          <label className="upload-box">
            <AnimatePresence mode="wait" initial={false}>
              {photoPreview ? (
                <motion.img
                  key="preview"
                  src={photoPreview}
                  alt="Your upload"
                  className="preview-photo"
                  initial={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              ) : (
                <motion.span
                  key="placeholder"
                  initial={reduced ? undefined : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  📷 Upload a full-body photo of yourself
                </motion.span>
              )}
            </AnimatePresence>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="selected-chips">
            {selectedItems.length === 0 && (
              <span className="selected-chip empty">Pick at least one item from the catalog above</span>
            )}
            {selectedItems.map((item) => (
              <span className="selected-chip" key={item.id}>
                <img src={item.image} alt="" />
                {item.name}
              </span>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={!photoFile || selectedItems.length === 0 || busy}
            onClick={submit}
            style={{ marginTop: "auto" }}
          >
            {busy ? "Generating…" : "Generate try-on"}
          </button>
        </div>

        {/* ---- Right: output — the actual render ---- */}
        <div className="tryon-col">
          <div className="tryon-col-label">Result</div>
          <div className="result-frame" aria-busy={busy}>
            <AnimatePresence mode="wait">
              {resultUrl ? (
                <motion.img
                  key="result"
                  src={resultUrl}
                  alt="Try-on result"
                  initial={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              ) : busy ? (
                <motion.div
                  key="spinner"
                  className="spinner"
                  initial={reduced ? undefined : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
                />
              ) : (
                <motion.div
                  key="placeholder"
                  className="result-placeholder"
                  initial={reduced ? undefined : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
                >
                  <svg viewBox="0 0 24 24"><use href="#g-jacket" /></svg>
                  <span>Your try-on will appear here, side by side with your photo</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {statusMessage && status !== "done" && !error && (
            <p className="status-line">{statusMessage}</p>
          )}
          {friendlyError && <p className="error-line">{friendlyError}</p>}
        </div>
      </div>
    </div>
  );
}
