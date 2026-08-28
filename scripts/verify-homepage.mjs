import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pageSource = await readFile(path.join(root, "components/home/BusinessHome.tsx"), "utf8");
const layoutSource = await readFile(path.join(root, "app/layout.tsx"), "utf8");
const homeCss = await readFile(path.join(root, "app/home.css"), "utf8");
const builtHome = await readFile(path.join(root, ".next/server/app/index.html"), "utf8");

const publicHomepage = `${pageSource}\n${builtHome}`;
const forbiddenPublicCopy = [
  "Shobhit Tulshain",
  "Omkar Ghugarkar",
  "$299",
  "$899",
  "#pricing",
  ">Pricing<",
];

for (const forbidden of forbiddenPublicCopy) {
  assert.equal(
    publicHomepage.includes(forbidden),
    false,
    `Public homepage still contains hidden content: ${forbidden}`,
  );
}

assert.match(publicHomepage, /Make [“&quot;]Will this suit me\?[”&quot;] answerable\./);
assert.match(publicHomepage, /cloud\.google\.com\/blog\/topics\/retail\/how-breuninger-boosted-sales/);
assert.match(publicHomepage, /Zalando SE/);
assert.match(publicHomepage, /Plan a 5-SKU pilot/);
assert.equal(builtHome.includes('href="#"'), false, "Homepage contains a dead placeholder link");

assert.match(homeCss, /@media \(max-width: 760px\)/);
assert.match(homeCss, /@media \(max-width: 430px\)/);
assert.match(homeCss, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(homeCss, /:focus-visible/);
assert.match(layoutSource, /metadataBase/);

for (const asset of [
  "app/opengraph-image.png",
  "public/field-jacket.png",
  "public/products/snitch/shirt-quads-line-grey.png",
  "public/products/snitch/jeans-washed-straight-fit.png",
  "public/products/snitch/shirt-denim-regular-fit.png",
]) {
  await access(path.join(root, asset));
}

console.log("Homepage verification passed: content privacy, evidence, links, responsive rules, metadata, and assets.");
