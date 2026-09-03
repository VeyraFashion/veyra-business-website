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
const catalogPickerSource = await readFile(path.join(root, "components/demo/CatalogPicker.tsx"), "utf8");
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
  "—not STYLD performance",
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

assert.match(publicHomepage, /Make [“&quot;]Will this suit me\?[”&quot;] answerable/);
assert.match(publicHomepage, /corporate\.zalando\.com\/en\/technology\/how-zalando-uses-technology-help-customers-find-right-size/);

// Commercial positioning: the walkthrough booking is the primary action throughout.
assert.match(publicHomepage, /Book a 20-minute walkthrough/);
assert.match(publicHomepage, /Book a walkthrough/);
assert.match(publicHomepage, /and measurable/);
assert.match(publicHomepage, /Send us a product URL/);

// Claim safety (non-negotiable). Every headline third-party metric must carry its brand,
// its methodology and a scope caveat — and must never read as a STYLD outcome.
assert.match(publicHomepage, /third-party evidence, not claimed STYLD customer results/);
assert.match(publicHomepage, /None of the numbers to the left are ours/);
assert.match(publicHomepage, /control group against ourselves/);
assert.match(publicHomepage, /arithmetic on the inputs shown, not a STYLD result/);
assert.match(publicHomepage, /Not a guarantee/);

for (const [metric, brand] of [
  ["\\+39%", "Rhone"],
  ["Up to −40%", "Zalando"],
  ["\\+7\\.06%", "Garcia"],
  ["\\+3\\.5%", "DIDI"],
]) {
  assert.match(publicHomepage, new RegExp(metric), `Missing sourced metric: ${metric}`);
  assert.match(publicHomepage, new RegExp(brand), `Metric ${metric} is missing its attribution`);
}

// Consolidation guard: every metric must appear exactly ONCE in the rendered homepage.
// Before consolidating, +39% appeared three times and the controlled-test figures twice,
// across four separate stat blocks — which read as padding rather than proof.
// Strip <script>/<style> bodies first: Next embeds the RSC flight payload in a script
// tag, so raw tag-stripping would double-count every string on the page.
const renderedText = builtHome
  .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ");
for (const metric of ["+7.06%", "+3.5%", "+39%", "−5.54%", "−13.1%", "Up to −40%"]) {
  const occurrences = renderedText.split(metric).length - 1;
  assert.equal(
    occurrences,
    1,
    `Metric ${metric} appears ${occurrences} times in the rendered homepage; it must appear exactly once`,
  );
}

// Methodology badges must be rendered, so a reader can weigh a number by how it was made.
for (const badge of ["Controlled A/B", "Retailer pilot", "Vendor case", "Adjacent category"]) {
  assert.match(publicHomepage, new RegExp(badge.replace("/", "\\/")), `Missing methodology badge: ${badge}`);
}

// Market-framing numbers deliberately removed: they added stat-fatigue without giving a
// buyer a reason to switch.
for (const dropped of ["2.6×", "Cia Hering", "~98%", "IRP Commerce", "1 in 2", "10–15%", "10×"]) {
  assert.equal(
    publicHomepage.includes(dropped),
    false,
    `Homepage still contains a de-emphasised market-framing stat: ${dropped}`,
  );
}

// Unsafe phrasings the brief explicitly rules out.
for (const unsafe of [
  /STYLD increases conversion 2\.6/i,
  /STYLD cuts returns by 40/i,
  /STYLD increases AOV by 39/i,
  /Expect a 7% STYLD conversion lift/i,
  /guaranteed/i,
]) {
  assert.doesNotMatch(publicHomepage, unsafe, `Homepage contains an unsafe claim: ${unsafe}`);
}

// The pilot is framed as controlled measurement, including the self-selection warning.
assert.match(publicHomepage, /How it goes live/);
assert.match(publicHomepage, /inflates apparent performance/);
assert.match(publicHomepage, /Incremental contribution per eligible session/);

// Placeholders must survive: data handling and commercials depend on facts this repo
// does not have, and inventing either is worse than showing the gap.
for (const required of [
  "Content required",
  "do not fabricate",
  "wire this to a real destination",
]) {
  assert.match(publicHomepage, new RegExp(required, "i"), `Missing honesty placeholder: ${required}`);
}

// De-emphasised per the brief: the unscoped fit-attribution range is gone.
assert.equal(
  pageSource.includes("50–70%"),
  false,
  "Homepage still contains the unscoped fit-attribution range",
);
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
assert.match(demoCss, /\.picker-tile-name[\s\S]*color: var\(--demo-ink\) !important/);
assert.match(demoSource, /Live catalog intelligence/);
assert.match(demoSource, /Complete looks\. Already on you\./);
assert.match(demoSource, /Receive your try-ons/);
assert.match(outfitPanelSource, /Create looks on me/);
assert.match(outfitPanelSource, /Checking your photo and composing your looks/);
assert.match(outfitPanelSource, /photoAssessment\.status === "needs_new_photo"/);
assert.match(outfitPanelSource, /Promise\.allSettled/);

// The shopper-facing copy must not promise a fixed look count: the ranker can return
// fewer than it asks for, so "3 looks" was a promise the product couldn't always keep.
for (const [label, source] of [["StoreDemo", demoSource], ["OutfitPanel", outfitPanelSource]]) {
  assert.doesNotMatch(
    source,
    /(three|3)\s+(new\s+)?(complete\s+)?(looks|try-ons|outfits)/i,
    `${label} promises a fixed look count in shopper-facing copy`,
  );
}
assert.match(catalogPickerSource, /aria-pressed=\{selected\}/);
// The picker must stay a filtered picker, not revert to a long unbounded list.
assert.match(catalogPickerSource, /INITIAL_VISIBLE/);
assert.match(catalogPickerSource, /aria-live="polite"/);
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
assert.match(layoutSource, /applicationName: "STYLD"/);
assert.match(layoutSource, /title: "STYLD — Virtual Try-On & AI Styling for Fashion E-commerce"/);
assert.match(builtHome, /<title>STYLD — Virtual Try-On &amp; AI Styling for Fashion E-commerce<\/title>/);
assert.match(
  builtHome,
  /<link rel="icon" href="\/favicon\.ico\?[^\"]+" sizes="64x64" type="image\/x-icon"\/>/,
);
assert.match(builtCss, /\.bg-styld-cobalt\{background-color:/);
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
