"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Search } from "lucide-react";
import type { CatalogItem } from "@/lib/catalog";

/** Catalogue picker.
 *
 *  This control's job is *selection*, not browsing: a visitor optionally pins one or two
 *  pieces before the styling room generates looks. It used to render as a storefront —
 *  one section per garment role, each with a full heading — which for SNITCH meant a
 *  76-item section of tall product cards plus three sections carrying a heading for a
 *  single item. So:
 *
 *  - **One section, filtered**, instead of five wildly uneven ones.
 *  - **Filtered by subcategory, not role**, because role is the wrong axis when 83% of the
 *    catalogue is "top". Shirts / t-shirts / trousers / jeans are what someone looks for.
 *  - **Dense square tiles.** For picking, the image is the content; price and an action
 *    label only made each tile taller.
 *  - **Two rows visible, then "Show all N"** rather than an inner scrollbar, which fights
 *    the page scroll and hides content from in-page find.
 */

/** ~2 rows at the widest layout (4 per row). Narrower viewports show the same count over
 *  more rows, which is still far shorter than the full list. */
const INITIAL_VISIBLE = 8;

const ALL = "__all__";

function label(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function CatalogPicker({
  items,
  selectedIds,
  onToggle,
}: {
  items: CatalogItem[];
  selectedIds: string[];
  onToggle: (item: CatalogItem) => void;
}) {
  const [group, setGroup] = useState<string>(ALL);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const searchId = useId();
  const gridId = useId();

  // Subcategory buckets, largest first, so the chip row reads as a sensible hierarchy.
  const groups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const key = item.subcategory ?? item.category;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const key = item.subcategory ?? item.category;
      if (group !== ALL && key !== group) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        key.toLowerCase().includes(q) ||
        item.colors.some((c) => c.toLowerCase().includes(q)) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, group, query]);

  const visible = expanded ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hidden = filtered.length - visible.length;

  /** Changing the filter or the query collapses the list again — otherwise switching from
   *  a 2-item filter to a 59-item one silently dumps 59 tiles on the page. */
  function reset(next: () => void) {
    next();
    setExpanded(false);
  }

  return (
    <div className="picker">
      <div className="picker-controls">
        <div className="picker-search">
          <label className="home-visually-hidden" htmlFor={searchId}>
            Search the catalogue
          </label>
          <Search size={16} aria-hidden="true" />
          <input
            id={searchId}
            type="search"
            placeholder="Search by name, colour or fit…"
            value={query}
            onChange={(event) => reset(() => setQuery(event.target.value))}
          />
        </div>

        <div className="picker-chips" role="group" aria-label="Filter by category">
          <button
            type="button"
            aria-pressed={group === ALL}
            className={group === ALL ? "is-active" : undefined}
            onClick={() => reset(() => setGroup(ALL))}
          >
            All <span>{items.length}</span>
          </button>
          {groups.map(([key, count]) => (
            <button
              key={key}
              type="button"
              aria-pressed={group === key}
              className={group === key ? "is-active" : undefined}
              onClick={() => reset(() => setGroup(key))}
            >
              {label(key)} <span>{count}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="picker-count" aria-live="polite">
        {filtered.length === 0
          ? "No pieces match that search."
          : `Showing ${visible.length} of ${filtered.length} ${
              filtered.length === 1 ? "piece" : "pieces"
            }`}
      </p>

      {filtered.length > 0 && (
        <div className="picker-grid" id={gridId}>
          {visible.map((item) => {
            const selected = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                className={selected ? "picker-tile is-selected" : "picker-tile"}
                onClick={() => onToggle(item)}
                aria-pressed={selected}
                aria-label={`${selected ? "Remove" : "Select"} ${item.name}`}
              >
                <span className="picker-tile-image">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(max-width: 430px) 45vw, (max-width: 760px) 46vw, (max-width: 1020px) 30vw, 22vw"
                  />
                  <span className="picker-tile-check" aria-hidden="true">
                    <Check size={13} strokeWidth={3} />
                  </span>
                </span>
                <span className="picker-tile-name">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {hidden > 0 && (
        <button
          type="button"
          className="picker-more"
          aria-expanded={false}
          aria-controls={gridId}
          onClick={() => setExpanded(true)}
        >
          Show all {filtered.length}
          {group === ALL ? " pieces" : ` ${label(group).toLowerCase()}`}
          <span aria-hidden="true">⌄</span>
        </button>
      )}

      {expanded && filtered.length > INITIAL_VISIBLE && (
        <button
          type="button"
          className="picker-more"
          aria-expanded
          aria-controls={gridId}
          onClick={() => setExpanded(false)}
        >
          Show fewer <span aria-hidden="true">⌃</span>
        </button>
      )}
    </div>
  );
}
