#!/usr/bin/env python3
"""Refresh the private House of Masaba demos from the store's public product feed."""

import json
import re
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal
from pathlib import Path
from urllib.request import urlopen


STORE = "https://www.houseofmasaba.com"
BRAND = "House of Masaba"
ASSETS = Path(__file__).resolve().parents[1] / "assets" / BRAND
NON_APPAREL = {"armlet", "bracelets", "cuffs", "earrings", "gift cards", "neckpiece", "rings"}
MENS_TAGS = {"gender_men", "gender_male"}
WOMENS_TAGS = {"gender_women", "gender_female"}
PAGE_SIZE = 250


def read(url):
    with urlopen(url, timeout=25) as response:
        return response.read()


def store_products(collection=""):
    products = {}
    prefix = f"/collections/{collection}" if collection else ""
    for page in range(1, 101):
        batch = json.loads(read(f"{STORE}{prefix}/products.json?limit={PAGE_SIZE}&page={page}"))["products"]
        for product in batch:
            handle = product["handle"]
            if handle in products:
                raise ValueError(f"Repeated handle in {prefix or 'store'} page {page}: {handle}")
            products[handle] = product
        if len(batch) < PAGE_SIZE:
            return products
    raise ValueError(f"{prefix or 'Store'} product feed exceeded the pagination limit")


def product_urls():
    index = ET.fromstring(read(f"{STORE}/sitemap.xml"))
    sitemaps = [node.text for node in index.findall(".//{*}loc") if "/sitemap_products_" in node.text]
    if not sitemaps:
        raise ValueError("Store index did not list a product sitemap")
    urls = set()
    for sitemap in sitemaps:
        root = ET.fromstring(read(sitemap))
        urls.update(node.text for node in root.findall(".//{*}url/{*}loc") if node.text.startswith(f"{STORE}/products/"))
    return urls


def tag_values(tags, prefix):
    return sorted({tag[len(prefix):].strip().lower() for tag in tags if tag.startswith(prefix) and tag[len(prefix):].strip()})


def audience_for(product, menswear, womenswear, bridal):
    handle = product["handle"]
    tags = {tag.lower() for tag in product["tags"]}
    men = bool(tags & MENS_TAGS) or handle in menswear
    women = bool(tags & WOMENS_TAGS) or handle in womenswear or handle in bridal
    if men == women:
        raise ValueError(f"Ambiguous apparel audience for {handle}")
    return "menswear" if men else "womenswear"


def garment_type(product):
    kind = product["product_type"].strip().lower().removeprefix("men's ")
    title = product["title"].lower()
    if "bandi" in title or kind in {"bandi", "bandi set", "bandi sets"}:
        return ("full_body", "bandi set") if "set" in title or "set" in kind else ("outerwear", "bandi")
    if kind == "sherwani" or "koti set" in title:
        return "full_body", "sherwani set" if kind == "sherwani" else "raja koti set"
    if kind in {"kurta", "kurta set", "kurta sets"}:
        return ("top", "kurta") if kind == "kurta" and "set" not in title else ("full_body", "kurta set")
    if kind in {"shirt", "sweatshirt", "tops & shirts", "kurtas & tunics"}:
        return "top", kind
    if kind == "jackets":
        return "outerwear", "jacket"

    normalized = {"co ord": "co-ord set", "co ord set": "co-ord set", "dresses": "dress", "pallazo set": "palazzo set"}
    if kind:
        return "full_body", normalized.get(kind, kind)
    if "coat set" in title:
        return "full_body", "coat set"
    return "full_body", "bridal look"


def catalog_item(product):
    handle = product["handle"]
    if not re.fullmatch(r"[a-z0-9-]+", handle):
        raise ValueError(f"Unsafe store handle: {handle}")
    category, subcategory = garment_type(product)
    tags = product["tags"]
    variants = product["variants"]
    available_variants = [variant for variant in variants if variant["available"]]
    fabrics = tag_values(tags, "Fabric_")
    occasions = tag_values(tags, "Occasion_")
    descriptors = fabrics + occasions + [tag.lower() for tag in ("Festive", "Bridal", "Pret") if tag in tags]
    gallery = [image["src"] for image in product["images"]]
    if not gallery:
        raise ValueError(f"Missing product imagery for {handle}")
    return {
        "id": f"masaba-{handle}",
        "name": product["title"].strip(),
        "category": category,
        "colors": tag_values(tags, "Color_"),
        "tags": sorted(set(descriptors)),
        "image_url": gallery[0],
        "metadata": {
            "brand": BRAND,
            "subcategory": subcategory,
            "product_url": f"{STORE}/products/{handle}",
            "price_inr": float(min(Decimal(variant["price"]) for variant in available_variants or variants)),
            "available": bool(available_variants),
        },
    }


def main():
    with ThreadPoolExecutor(max_workers=5) as pool:
        feed = pool.submit(store_products)
        men = pool.submit(store_products, "menswear")
        women = pool.submit(store_products, "womenswear-all")
        bridal = pool.submit(store_products, "bridal-new")
        sitemap = pool.submit(product_urls)
        products, menswear, womenswear, bridalwear, urls = (job.result() for job in (feed, men, women, bridal, sitemap))

    feed_urls = {f"{STORE}/products/{handle}" for handle in products}
    if urls != feed_urls:
        raise ValueError(f"Feed and sitemap disagree: {len(urls - feed_urls)} sitemap-only, {len(feed_urls - urls)} feed-only")
    catalogs = {"menswear": [], "womenswear": []}
    for product in products.values():
        if product["product_type"].strip().lower() in NON_APPAREL:
            continue
        audience = audience_for(product, menswear, womenswear, bridalwear)
        catalogs[audience].append(catalog_item(product))

    ASSETS.mkdir(parents=True, exist_ok=True)
    print(f"Verified {len(urls)} product URLs against the store sitemap")
    for audience, items in catalogs.items():
        items.sort(key=lambda item: not item["metadata"]["available"])
        slug = f"house-of-masaba-{audience}"
        catalog = {"brand": f"{BRAND} {audience.title()}", "slug": slug, "wardrobe": items}
        (ASSETS / f"{slug}.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        available = sum(item["metadata"]["available"] for item in items)
        print(f"{audience}: {len(items)} apparel products ({available} available)")


if __name__ == "__main__":
    main()
