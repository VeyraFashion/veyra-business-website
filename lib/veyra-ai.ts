/** Thin server-side client for the private Veyra AI service. Never call this from client code —
 *  it is imported only from Next.js route handlers so credentials and provider details remain
 *  server-side. */

export function veyraAiBaseUrl(): string {
  return process.env.VEYRA_AI_BASE_URL || "http://127.0.0.1:8000";
}

export function serviceKeyHeaders(): Record<string, string> {
  const key = process.env.VEYRA_AI_SERVICE_KEY;
  return key ? { "X-Service-Key": key } : {};
}

export function qualityProfile(): string {
  return process.env.VEYRA_AI_QUALITY_PROFILE || "interactive";
}

export interface ImageJobAccepted {
  job_id: string;
  feature: "wardrobe_studio" | "avatar" | "try_on";
  status: "queued";
  quality_profile: string;
  status_url: string;
  submitted_at: string;
  model_plan: Record<string, unknown>;
  message: string;
}

export interface ImageJobStatus {
  job_id: string;
  feature: string;
  status: "queued" | "processing" | "completed" | "failed";
  quality_profile: string;
  submitted_at: string;
  started_at: string | null;
  completed_at: string | null;
  queue_seconds: number | null;
  processing_seconds: number | null;
  result: Record<string, unknown> | null;
  error: { code: string; message: string } | null;
}

/** Converts private service failures into provider-neutral errors before a route can expose them. */
async function veyraFetch(pathname: string, init: RequestInit): Promise<Response> {
  const res = await fetch(`${veyraAiBaseUrl()}${pathname}`, init);
  if (!res.ok) {
    const message = res.status >= 500
      ? "Veyra's AI service is temporarily unavailable."
      : "Veyra could not complete this request.";
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res;
}

export async function submitTryOnJob(form: FormData): Promise<ImageJobAccepted> {
  const res = await veyraFetch("/ai/jobs/try-on", {
    method: "POST",
    body: form,
    headers: { ...serviceKeyHeaders() },
  });
  return res.json();
}

export async function getJob(jobId: string): Promise<ImageJobStatus> {
  const res = await veyraFetch(`/ai/jobs/${jobId}`, {
    method: "GET",
    headers: { ...serviceKeyHeaders() },
  });
  return res.json();
}

export async function rankOutfits(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await veyraFetch("/ai/outfits", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...serviceKeyHeaders() },
    body: JSON.stringify(body),
  });
  return res.json();
}
