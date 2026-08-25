#!/usr/bin/env python3
"""
extract_brand_images.py

Splits the master `brand_wardrobes.json` catalog into one self-contained
folder per brand: assets/<Brand>/<slug>.json + assets/<Brand>/images/*.

For every wardrobe item that has an `image_url`, downloads the image into
that brand's `images/` folder and stamps the item with a new `image_path`
key — a path relative to the brand's own folder (e.g. "images/foo.jpg").
Items with no source `image_url` get `image_path: null` instead of being
dropped or faked.

Safe to re-run: existing images are skipped (not re-downloaded) unless
--force is passed, and JSON output is regenerated fresh each time.

Usage:
    python3 extract_brand_images.py                    # process every brand, looped
    python3 extract_brand_images.py --brands snitch bewakoof
    python3 extract_brand_images.py --list              # just list brand slugs
    python3 extract_brand_images.py --force              # re-download existing images
    python3 extract_brand_images.py --workers 4          # tune per-brand parallelism

Downloads go through `curl` rather than urllib — on this machine python3's
ssl module has no local CA bundle wired up, so urllib.request fails with
CERTIFICATE_VERIFY_FAILED while curl (which uses the system trust store)
works fine.
"""
import argparse
import concurrent.futures
import json
import os
import subprocess
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE_JSON = os.path.join(SCRIPT_DIR, "brand_wardrobes.json")

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


def sniff_extension(path, fallback):
    """Return the extension that actually matches the downloaded bytes.
    CDNs sometimes serve a different format than the URL's extension implies
    (observed: .webp-looking URLs serving plain JPEG bytes) — trust the
    magic bytes over the URL."""
    try:
        with open(path, "rb") as f:
            head = f.read(16)
    except OSError:
        return fallback
    if head[:3] == b"\xff\xd8\xff":
        return ".jpg"
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if head[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return ".webp"
    return fallback


def download(url, dest, force=False):
    """Downloads url to dest via curl. Returns (ok, error)."""
    if os.path.exists(dest) and not force:
        return True, None
    result = subprocess.run(
        ["curl", "-sL", "--fail", "--max-time", "20", "-A", USER_AGENT, "-o", dest, url],
        capture_output=True, text=True,
    )
    if result.returncode != 0 or not os.path.exists(dest) or os.path.getsize(dest) == 0:
        if os.path.exists(dest):
            os.remove(dest)
        return False, (result.stderr or "").strip() or f"curl exit {result.returncode}"
    return True, None


def process_brand(brand_entry, force=False, workers=8):
    brand_name = brand_entry["brand"]
    slug = brand_entry["slug"]
    brand_dir = os.path.join(SCRIPT_DIR, brand_name)
    images_dir = os.path.join(brand_dir, "images")
    out_json = os.path.join(brand_dir, f"{slug}.json")
    os.makedirs(images_dir, exist_ok=True)

    items = brand_entry["wardrobe"]
    items_out = []
    jobs = []  # (index, item, url, dest, ext)

    for idx, item in enumerate(items):
        new_item = dict(item)
        items_out.append(new_item)
        url = item.get("image_url")
        if not url:
            new_item["image_path"] = None
            continue
        ext = os.path.splitext(url.split("?")[0])[1] or ".jpg"
        dest = os.path.join(images_dir, f"{item['id']}{ext}")
        jobs.append((idx, item, url, dest, ext))

    ok_count = 0
    fail_count = 0
    skip_count = len(items) - len(jobs)
    failures = []

    def worker(job):
        idx, item, url, dest, ext = job
        ok, err = download(url, dest, force=force)
        return idx, item, dest, ext, ok, err

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        for idx, item, dest, ext, ok, err in pool.map(worker, jobs):
            if not ok:
                fail_count += 1
                failures.append({"id": item["id"], "url": item["image_url"], "error": err})
                items_out[idx]["image_path"] = None
                continue
            real_ext = sniff_extension(dest, ext)
            if real_ext != ext:
                fixed_dest = os.path.join(images_dir, f"{item['id']}{real_ext}")
                os.replace(dest, fixed_dest)
                dest = fixed_dest
            items_out[idx]["image_path"] = f"images/{os.path.basename(dest)}"
            ok_count += 1

    brand_out = dict(brand_entry)
    brand_out["wardrobe"] = items_out
    with open(out_json, "w") as f:
        json.dump(brand_out, f, indent=2)
        f.write("\n")

    return {
        "brand": brand_name,
        "slug": slug,
        "total": len(items),
        "downloaded": ok_count,
        "skipped_no_url": skip_count,
        "failed": fail_count,
        "failures": failures,
        "json_path": out_json,
    }


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--brands", nargs="+", default=None,
        help="Only process these brands (match by slug or brand name, case-insensitive). "
             "Default: every brand in brand_wardrobes.json, in a loop.",
    )
    parser.add_argument("--force", action="store_true", help="Re-download images even if already present.")
    parser.add_argument("--workers", type=int, default=8, help="Parallel downloads per brand (default: 8).")
    parser.add_argument("--list", action="store_true", help="List available brand slugs and exit.")
    args = parser.parse_args()

    with open(SOURCE_JSON) as f:
        data = json.load(f)
    all_brands = data["brands"]

    if args.list:
        for b in all_brands:
            print(f"{b['slug']:20s} {b['brand']}")
        return

    if args.brands:
        wanted = {b.lower() for b in args.brands}
        selected = [
            b for b in all_brands
            if b["slug"].lower() in wanted or b["brand"].lower() in wanted
        ]
        found = {b["slug"].lower() for b in selected} | {b["brand"].lower() for b in selected}
        missing = wanted - found
        if missing:
            print(f"Unknown brand(s): {', '.join(sorted(missing))}", file=sys.stderr)
            print("Run with --list to see valid brand names/slugs.", file=sys.stderr)
            sys.exit(1)
    else:
        selected = all_brands

    summaries = []
    for brand_entry in selected:
        print(f"\n=== {brand_entry['brand']} ({brand_entry['slug']}) ===")
        summary = process_brand(brand_entry, force=args.force, workers=args.workers)
        summaries.append(summary)
        print(
            f"  items: {summary['total']}  downloaded/verified: {summary['downloaded']}  "
            f"no image_url: {summary['skipped_no_url']}  failed: {summary['failed']}"
        )
        for f_ in summary["failures"]:
            print(f"    FAILED {f_['id']}: {f_['error']}", file=sys.stderr)
        print(f"  -> {summary['json_path']}")

    print("\n=== Summary ===")
    total_items = sum(s["total"] for s in summaries)
    total_ok = sum(s["downloaded"] for s in summaries)
    total_fail = sum(s["failed"] for s in summaries)
    total_skip = sum(s["skipped_no_url"] for s in summaries)
    print(
        f"Brands processed: {len(summaries)}  Items: {total_items}  "
        f"Images OK: {total_ok}  No source URL: {total_skip}  Failed: {total_fail}"
    )


if __name__ == "__main__":
    main()
