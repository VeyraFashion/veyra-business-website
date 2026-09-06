#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const argv = new Set(process.argv.slice(2));
if (!argv.has("--confirm-paid")) {
  console.error("Refusing paid image calls without --confirm-paid.");
  process.exit(2);
}

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const baseUrl = argument("--base-url", "http://127.0.0.1:3002").replace(/\/$/, "");
const brandId = argument("--brand-id", "88c64009be");
const photoPath = path.resolve(argument("--photo", ""));
const outputRoot = path.resolve(argument("--output-root", "test-results/live-tryon"));
if (!photoPath || photoPath === path.resolve("")) {
  console.error("--photo is required.");
  process.exit(2);
}

const itemIds = [
  "snitch-regular-fit-100-cotton-shirt-mp-4sfs071-03",
  "snitch-stretch-relaxed-fit-trousers-4msr5525-04",
];
const allCases = [
  {
    id: "website_fully_untucked",
    prompt:
      "Wear the shirt fully untucked/tucked out. Keep every visible segment of the complete lower hem outside and hanging over the trousers waistband across the front and both wearer-sides. Do not tuck, pinch, or trap any portion in the waistband. No full tuck, French tuck, half-tuck, or side tuck is allowed.",
  },
  {
    id: "website_fully_tucked",
    prompt:
      "Wear the shirt fully tucked into the trousers around the entire waist. Insert the complete lower hem continuously inside the waistband. No visible front or side hem section may hang outside; do not use a French, half, or side tuck.",
  },
];
const caseIdsRaw = argument("--case-ids", "");
const selectedCaseIds = new Set(caseIdsRaw.split(",").map((value) => value.trim()).filter(Boolean));
const unknownCaseIds = [...selectedCaseIds].filter(
  (caseId) => !allCases.some((testCase) => testCase.id === caseId),
);
if (unknownCaseIds.length) {
  console.error(`Unknown --case-ids: ${unknownCaseIds.join(", ")}`);
  process.exit(2);
}
const cases = selectedCaseIds.size
  ? allCases.filter((testCase) => selectedCaseIds.has(testCase.id))
  : allCases;

const stamp = new Date().toISOString().replaceAll(/[-:.]/g, "").replace("Z", "Z");
const runDir = path.join(outputRoot, stamp);
await mkdir(runDir, { recursive: true });
const photo = await readFile(photoPath);

function photoMimeType(filename) {
  switch (path.extname(filename).toLowerCase()) {
    case ".png": return "image/png";
    case ".webp": return "image/webp";
    default: return "image/jpeg";
  }
}

function outputExtension(mimeType) {
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  return ".jpg";
}

async function writeJson(filename, value) {
  await writeFile(filename, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function submit(testCase) {
  const form = new FormData();
  form.set("photo", new Blob([photo], { type: photoMimeType(photoPath) }), path.basename(photoPath));
  form.set("itemIds", JSON.stringify(itemIds));
  form.set("prompt", testCase.prompt);
  const response = await fetch(`${baseUrl}/api/demo/${brandId}/tryon`, {
    method: "POST",
    body: form,
  });
  const body = await response.json();
  if (response.status !== 202 || typeof body.job_id !== "string") {
    throw new Error(`${testCase.id} submission returned HTTP ${response.status}: ${JSON.stringify(body)}`);
  }
  const caseDir = path.join(runDir, testCase.id);
  await mkdir(caseDir, { recursive: true });
  await writeJson(path.join(caseDir, "submission.json"), {
    request: { brand_id: brandId, item_ids: itemIds, prompt: testCase.prompt },
    response_status: response.status,
    response: body,
  });
  console.log(`${testCase.id}: submitted ${body.job_id}`);
  return { ...testCase, jobId: body.job_id, caseDir };
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function poll(submission) {
  const deadline = Date.now() + 20 * 60 * 1000;
  let previousStatus;
  while (Date.now() < deadline) {
    const response = await fetch(
      `${baseUrl}/api/demo/${brandId}/tryon/${submission.jobId}`,
      { cache: "no-store" },
    );
    const body = await response.json();
    if (!response.ok) {
      throw new Error(`${submission.id} poll returned HTTP ${response.status}: ${JSON.stringify(body)}`);
    }
    if (body.status !== previousStatus) {
      console.log(`${submission.id}: ${previousStatus ?? "submitted"} -> ${body.status}`);
      previousStatus = body.status;
    }
    if (body.status === "failed") {
      await writeJson(path.join(submission.caseDir, "status.json"), body);
      return { id: submission.id, jobId: submission.jobId, status: "failed", quality: false };
    }
    if (body.status === "completed") {
      const encoded = body.result?.output_image_base64;
      if (typeof encoded !== "string" || !encoded) {
        throw new Error(`${submission.id} completed without an output image`);
      }
      const image = Buffer.from(encoded, "base64");
      const mimeType = body.result?.mime_type ?? "image/jpeg";
      const outputPath = path.join(
        submission.caseDir,
        `output${outputExtension(mimeType)}`,
      );
      await writeFile(outputPath, image);
      await writeJson(path.join(submission.caseDir, "status.json"), {
        ...body,
        result: {
          ...body.result,
          output_image_base64: "<removed; saved as output artifact>",
          output_artifact: {
            path: path.relative(runDir, outputPath),
            bytes: image.byteLength,
            sha256: createHash("sha256").update(image).digest("hex"),
          },
        },
      });
      return {
        id: submission.id,
        jobId: submission.jobId,
        status: "completed",
        quality: body.result?.quality_threshold_met === true,
        mimeType,
        outputPath: path.relative(runDir, outputPath),
      };
    }
    await delay(2000);
  }
  throw new Error(`${submission.id} timed out`);
}

try {
  const submissions = await Promise.all(cases.map(submit));
  const results = await Promise.all(submissions.map(poll));
  const summary = {
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    brand_id: brandId,
    source_photo: photoPath,
    results,
  };
  await writeJson(path.join(runDir, "summary.json"), summary);
  console.log(`artifacts: ${runDir}`);
  for (const result of results) {
    console.log(`${result.id}: status=${result.status} quality=${result.quality}`);
  }
  process.exitCode = results.every((result) => result.status === "completed" && result.quality)
    ? 0
    : 1;
} catch (error) {
  await writeJson(path.join(runDir, "failure.json"), {
    generated_at: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
  });
  console.error(error);
  process.exitCode = 1;
}
