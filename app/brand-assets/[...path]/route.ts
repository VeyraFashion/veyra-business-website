import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

/** Serves files directly out of /assets/<Brand>/... (product images living next to each
 *  brand's catalog JSON) — this repo's actual source of truth for brand imagery, not a
 *  copy staged under public/. Read-only, image files only. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  if (!segments || segments.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const assetsRoot = path.join(process.cwd(), "assets");
  const target = path.join(assetsRoot, ...segments);

  // Path-traversal guard: the resolved path must stay inside assets/.
  const relative = path.relative(assetsRoot, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(target).toLowerCase();
  const contentType = MIME_BY_EXT[ext];
  if (!contentType) {
    // Only ever serve known image types through this route.
    return new NextResponse("Not found", { status: 404 });
  }

  let stat;
  try {
    stat = fs.statSync(target);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!stat.isFile()) {
    return new NextResponse("Not found", { status: 404 });
  }

  // These are served by path with no content hash, so they are emphatically NOT immutable —
  // and the previous `max-age=31536000, immutable` meant replacing a file changed nothing a
  // visitor could see for a year. Next's image optimizer honours upstream cache headers too,
  // so a stale asset stuck in both its cache and the browser's.
  //
  // An ETag from mtime + size lets a repeat request settle as a cheap 304 while an edited
  // file is picked up on the next load.
  const etag = `W/"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: { ETag: etag, "Cache-Control": "public, max-age=300, must-revalidate" },
    });
  }

  const body = fs.readFileSync(target);
  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      ETag: etag,
      "Last-Modified": new Date(stat.mtimeMs).toUTCString(),
      "Cache-Control": "public, max-age=300, must-revalidate",
    },
  });
}
