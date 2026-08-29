import { NextRequest, NextResponse } from "next/server";
import { resolveBrand } from "@/lib/brands";
import { getJob } from "@/lib/veyra-ai";

export const runtime = "nodejs";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function publicResult(value: unknown) {
  const result = asRecord(value);
  if (!result || typeof result.output_image_base64 !== "string") return null;
  return {
    output_image_base64: result.output_image_base64,
    mime_type: typeof result.mime_type === "string" ? result.mime_type : "image/jpeg",
    quality_threshold_met: result.quality_threshold_met === true,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string; jobId: string }> }
) {
  try {
    const { brandId, jobId } = await params;
    if (!resolveBrand(brandId)) {
      return NextResponse.json({ error: "Unknown demo link." }, { status: 404 });
    }
    const job = await getJob(jobId);
    return NextResponse.json({
      job_id: job.job_id,
      status: job.status,
      queue_seconds: job.queue_seconds,
      processing_seconds: job.processing_seconds,
      result: job.status === "completed" ? publicResult(job.result) : null,
      error: job.status === "failed"
        ? { message: "This look could not be completed. Please retry it." }
        : null,
    });
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500;
    const publicStatus = status >= 500 ? 503 : status;
    return NextResponse.json(
      { error: "STYLD could not check this try-on. Please try again." },
      { status: publicStatus },
    );
  }
}
