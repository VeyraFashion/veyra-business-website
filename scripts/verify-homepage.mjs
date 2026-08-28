import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pageSource = await readFile(path.join(root, "components/home/BusinessHome.tsx"), "utf8");
const layoutSource = await readFile(path.join(root, "app/layout.tsx"), "utf8");
const homeCss = await readFile(path.join(root, "app/home.css"), "utf8");
const demoCss = await readFile(path.join(root, "app/demo.css"), "utf8");
const legacyAndDemoCss = await readFile(path.join(root, "app/theme.css"), "utf8");
const demoSource = await readFile(path.join(root, "components/demo/StoreDemo.tsx"), "utf8");
const outfitPanelSource = await readFile(path.join(root, "components/demo/OutfitPanel.tsx"), "utf8");
const productGridSource = await readFile(path.join(root, "components/demo/ProductGrid.tsx"), "utf8");
const tryOnPanelSource = await readFile(path.join(root, "components/demo/TryOnPanel.tsx"), "utf8");
const aiClientSource = await readFile(path.join(root, "lib/veyra-ai.ts"), "utf8");
const outfitRouteSource = await readFile(path.join(root, "app/api/demo/[brandId]/outfits/route.ts"), "utf8");
const tryOnRouteSource = await readFile(path.join(root, "app/api/demo/[brandId]/tryon/route.ts"), "utf8");
const jobRouteSource = await readFile(path.join(root, "app/api/demo/[brandId]/tryon/[jobId]/route.ts"), "utf8");
const tailwindCss = await readFile(path.join(root, "app/tailwind.css"), "utf8");
const builtHome = await readFile(path.join(root, ".next/server/app/index.html"), "utf8");
const builtCssDirectory = path.join(root, ".next/static/chunks");
const builtCssFiles = (await readdir(builtCssDirectory)).filter((file) => file.endsWith(".css"));
const builtCss = (
  await Promise.all(builtCssFiles.map((file) => readFile(path.join(builtCssDirectory, file), "utf8")))
).join("\n");

const publicHomepage = `${pageSource}\n${builtHome}`;
const forbiddenPublicCopy = [
  "Shobhit Tulshain",
  "Omkar Ghugarkar",
  "$299",
  "$899",
  "#pricing",
  ">Pricing<",
];

const negativePublicFraming = [
  "does not ask shoppers",
  "Not another destination app",
  "Not a generic chatbot",
  "No invented performance claims",
  "High-quality try-on is not",
  "The goal is not",
  "—not Veyra performance",
  "Answer the first doubt",
];

for (const forbidden of forbiddenPublicCopy) {
  assert.equal(
    publicHomepage.includes(forbidden),
    false,
    `Public homepage still contains hidden content: ${forbidden}`,
  );
}

for (const framing of negativePublicFraming) {
  assert.equal(
    publicHomepage.toLowerCase().includes(framing.toLowerCase()),
    false,
    `Public homepage contains negative framing: ${framing}`,
  );
}

assert.match(publicHomepage, /Make [“&quot;]Will this suit me\?[”&quot;] answerable\./);
assert.match(publicHomepage, /cloud\.google\.com\/blog\/topics\/retail\/how-breuninger-boosted-sales/);
assert.match(publicHomepage, /corporate\.zalando\.com\/en\/technology\/how-zalando-uses-technology-help-customers-find-right-size/);
assert.match(publicHomepage, /corporate\.zalando\.com\/en\/fashion\/tracking-future-why-zalando-uniquely-placed-lead-next-era-retail/);
assert.match(publicHomepage, /Plan a 5-SKU pilot/);
assert.match(publicHomepage, /From pilot signal to retail scale\./);
assert.match(publicHomepage, /Up to 40%/);
assert.match(publicHomepage, /fewer returns in recent Virtual Fitting Room pilots/);
assert.match(publicHomepage, /Scaling to millions of customers/);
assert.match(publicHomepage, /retailer-reported pilot result/);
assert.equal(publicHomepage.includes("Zalando SizeFlags"), false, "Homepage contains dated adjacent evidence");
assert.equal(publicHomepage.includes("KDD 2021"), false, "Homepage contains the dated KDD label");
assert.equal(pageSource.includes("−3.8%"), false, "Homepage contains the old shoe return metric");
assert.equal(pageSource.includes("−4.3% to −6.6%"), false, "Homepage contains the old textile return metric");
assert.equal(pageSource.includes("4–8%"), false, "Homepage contains the old mixed return range");
assert.equal(pageSource.includes("+2.1%"), false, "Homepage contains the old oversized conversion metric");
assert.equal(pageSource.includes("+1.8%"), false, "Homepage contains the old oversized cart metric");
assert.equal(builtHome.includes('href="#"'), false, "Homepage contains a dead placeholder link");

const siteCss = `${homeCss}\n${demoCss}\n${legacyAndDemoCss}\n${tailwindCss}`;
for (const orangeToken of ["#ff6b47", "#ff9468", "#ed5b3a", "255, 107, 71", "255,107,71"]) {
  assert.equal(
    siteCss.toLowerCase().includes(orangeToken),
    false,
    `Site CSS still contains the retired orange palette value: ${orangeToken}`,
  );
}
assert.equal(
  /font-size:\s*(?:[0-9](?:\.\d+)?|1[01](?:\.\d+)?)px/.test(`${homeCss}\n${demoCss}\n${legacyAndDemoCss}`),
  false,
  "Site CSS contains text smaller than the 12px readability floor",
);

assert.match(homeCss, /@media \(max-width: 760px\)/);
assert.match(homeCss, /@media \(max-width: 430px\)/);
assert.match(homeCss, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(homeCss, /:focus-visible/);
assert.match(demoCss, /@media \(max-width: 760px\)/);
assert.match(demoCss, /@media \(max-width: 430px\)/);
assert.match(demoCss, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(demoCss, /\.demo-product-card[\s\S]*color: var\(--demo-ink\) !important/);
assert.match(demoSource, /Live catalog intelligence/);
assert.match(demoSource, /Three looks\. Already on you\./);
assert.match(demoSource, /Receive three try-ons/);
assert.match(outfitPanelSource, /Create 3 looks on me/);
assert.match(outfitPanelSource, /Checking your photo and composing three looks/);
assert.match(outfitPanelSource, /photoAssessment\.status === "needs_new_photo"/);
assert.match(outfitPanelSource, /Promise\.allSettled/);
assert.match(productGridSource, /aria-pressed=\{selected\}/);
const hiddenProviderName = ["gem", "ini"].join("");
const clientProviderSurface = [
  pageSource,
  demoSource,
  outfitPanelSource,
  tryOnPanelSource,
  aiClientSource,
  outfitRouteSource,
  tryOnRouteSource,
  jobRouteSource,
].join("\n").toLowerCase();
assert.equal(
  clientProviderSurface.includes(hiddenProviderName),
  false,
  "A private AI provider name is present in the client-facing application source",
);
assert.doesNotMatch(outfitRouteSource, /NextResponse\.json\(result/);
assert.match(outfitRouteSource, /photo_assessment: publicPhotoAssessment/);
assert.doesNotMatch(tryOnRouteSource, /NextResponse\.json\(accepted/);
assert.match(tryOnRouteSource, /job_id: accepted\.job_id/);
assert.doesNotMatch(jobRouteSource, /NextResponse\.json\(status/);
assert.match(jobRouteSource, /result: job\.status === "completed" \? publicResult/);
assert.match(layoutSource, /metadataBase/);
assert.match(layoutSource, /applicationName: "Veyra"/);
assert.match(layoutSource, /title: "Veyra for Business — Virtual Try-On & AI Styling"/);
assert.match(builtHome, /<title>Veyra for Business — Virtual Try-On &amp; AI Styling<\/title>/);
assert.match(
  builtHome,
  /<link rel="icon" href="\/favicon\.ico\?[^\"]+" sizes="64x64" type="image\/x-icon"\/>/,
);
assert.match(builtCss, /\.bg-veyra-cobalt\{background-color:/);
assert.match(builtCss, /\.text-white\\!\{color:[^}]+!important\}/);

for (const asset of [
  "app/favicon.ico",
  "app/opengraph-image.png",
  "public/field-jacket.png",
  "public/products/snitch/shirt-quads-line-grey.png",
  "public/products/snitch/jeans-washed-straight-fit.png",
  "public/products/snitch/shirt-denim-regular-fit.png",
]) {
  await access(path.join(root, asset));
}

console.log("Site verification passed: homepage evidence and privacy plus demo contrast, interaction, responsive rules, metadata, and assets.");
