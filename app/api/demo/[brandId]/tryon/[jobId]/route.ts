import { NextRequest, NextResponse } from "next/server";
import { resolveBrand } from "@/lib/brands";
import { getJob } from "@/lib/veyra-ai";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brandId: string; jobId: string }> }
) {
  try {
    const { brandId, jobId } = await params;
    if (!resolveBrand(brandId)) {
      return NextResponse.json({ error: "Unknown demo link." }, { status: 404 });
    }
    const status = await getJob(jobId);
    return NextResponse.json(status);
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 500;
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
