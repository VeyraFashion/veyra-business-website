"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ImagePlus, Shirt } from "lucide-react";
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
      setStatusMessage(data.status === "processing" ? "Rendering the selected garments…" : "Preparing your look…");
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
    setStatusMessage("Uploading your photo…");

    try {
      const form = new FormData();
      form.set("photo", photoFile);
      form.set("itemIds", JSON.stringify(selectedItems.map((item) => item.id)));

      const res = await fetch(`/api/demo/${brandId}/tryon`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start try-on job.");

      setStatus("polling");
      setStatusMessage("Preparing your look…");
      pollJob(data.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
      setStatus("error");
    }
  }

  const busy = status === "submitting" || status === "polling";
  const friendlyError = error;

  return (
    <div className="demo-tryon-panel">
      <div className="demo-tryon-layout">
        <div className="demo-tryon-column">
          <div className="demo-tryon-column-head">
            <span>01 / Your photo</span>
            <strong>{photoFile ? "Ready" : "Required"}</strong>
          </div>
          <label className={`demo-upload-box${photoPreview ? " has-photo" : ""}`}>
            <AnimatePresence mode="wait" initial={false}>
              {photoPreview ? (
                <motion.img
                  key="preview"
                  src={photoPreview}
                  alt="Your uploaded photo"
                  className="demo-preview-photo"
                  initial={reduced ? undefined : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              ) : (
                <motion.span
                  className="demo-upload-prompt"
                  key="placeholder"
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="demo-upload-icon" aria-hidden="true"><ImagePlus size={34} /></span>
                  <strong>Add a full-body photo</strong>
                  <small>Front-facing images give the clearest result.</small>
                </motion.span>
              )}
            </AnimatePresence>
            <input
              type="file"
              accept="image/*"
              aria-label="Upload a full-body photo"
              onChange={(event) => handlePhoto(event.target.files?.[0] ?? null)}
            />
          </label>

          <div className="demo-selection-list" aria-label="Selected products">
            {selectedItems.length === 0 && (
              <span className="demo-selected-chip empty">
                <Shirt size={17} aria-hidden="true" /> Choose at least one product above
              </span>
            )}
            {selectedItems.map((item) => (
              <span className="demo-selected-chip" key={item.id}>
                <Image src={item.image} alt="" width={34} height={34} sizes="34px" />
                {item.name}
              </span>
            ))}
          </div>

          <button
            type="button"
            className="demo-button demo-button-dark demo-generate-button"
            disabled={!photoFile || selectedItems.length === 0 || busy}
            onClick={submit}
          >
            {busy ? "Generating your look…" : "Generate try-on"}
            {!busy && <ArrowRight size={18} aria-hidden="true" />}
          </button>
        </div>

        <div className="demo-tryon-column demo-result-column">
          <div className="demo-tryon-column-head">
            <span>02 / Generated look</span>
            <strong>{resultUrl ? "Complete" : "Preview"}</strong>
          </div>
          <div className="demo-result-frame" aria-busy={busy}>
            <AnimatePresence mode="wait" initial={false}>
              {resultUrl ? (
                <motion.img
                  key="result"
                  src={resultUrl}
                  alt="Generated try-on result"
                  initial={reduced ? undefined : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              ) : busy ? (
                <motion.div
                  key="spinner"
                  className="demo-result-loading"
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                >
                  <span className="demo-spinner" aria-hidden="true" />
                  <strong>{statusMessage}</strong>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  className="demo-result-placeholder"
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                >
                  <span className="demo-result-index">V / 01</span>
                  <Shirt size={48} strokeWidth={1.35} aria-hidden="true" />
                  <strong>Your generated look appears here.</strong>
                  <p>Selected products are composed in one compatible, front-facing render.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {statusMessage && status !== "done" && !error && !busy && (
            <p className="demo-status-line">{statusMessage}</p>
          )}
          {friendlyError && <p className="demo-error-line">{friendlyError}</p>}
        </div>
      </div>
    </div>
  );
}
