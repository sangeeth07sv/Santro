"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition, useRef, useEffect } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/utils/cn";

const SORT_OPTIONS = [
  { value: "newest", label: "Relevance" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function FilterChips({ categories }: { categories: { name: string; slug: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [openMenu, setOpenMenu] = useState<"sort" | "category" | "price" | null>(null);
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
    setOpenMenu(null);
  }

  function applyPriceRange() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
    setOpenMenu(null);
  }

  const activeSort = SORT_OPTIONS.find((o) => o.value === (searchParams.get("sort") ?? "newest"))?.label ?? "Relevance";
  const activeCategory = categories.find((c) => c.slug === searchParams.get("category"))?.name ?? "Category";
  const hasPriceFilter = !!(searchParams.get("minPrice") || searchParams.get("maxPrice"));

  return (
    <div ref={wrapRef} className="relative mb-4 flex items-center gap-2 overflow-x-auto pb-1">
      <span className="flex shrink-0 items-center justify-center rounded-full border border-surface-muted p-2 text-ink/50 dark:border-indigo-700">
        <SlidersHorizontal className="h-4 w-4" />
      </span>

      <div className="relative shrink-0">
        <Chip label={activeSort} active={activeSort !== "Relevance"} onClick={() => setOpenMenu(openMenu === "sort" ? null : "sort")} />
        {openMenu === "sort" && (
          <Dropdown>
            {SORT_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => updateParam("sort", opt.value)} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-muted dark:hover:bg-indigo-800">
                {opt.label}
              </button>
            ))}
          </Dropdown>
        )}
      </div>

      <div className="relative shrink-0">
        <Chip label={activeCategory} active={activeCategory !== "Category"} onClick={() => setOpenMenu(openMenu === "category" ? null : "category")} />
        {openMenu === "category" && (
          <Dropdown>
            <button onClick={() => updateParam("category", "")} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-muted dark:hover:bg-indigo-800">
              All categories
            </button>
            {categories.map((c) => (
              <button key={c.slug} onClick={() => updateParam("category", c.slug)} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-muted dark:hover:bg-indigo-800">
                {c.name}
              </button>
            ))}
          </Dropdown>
        )}
      </div>

      <div className="relative shrink-0">
        <Chip label="Price" active={hasPriceFilter} onClick={() => setOpenMenu(openMenu === "price" ? null : "price")} />
        {openMenu === "price" && (
          <Dropdown wide>
            <div className="flex items-center gap-2 p-2">
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full rounded-lg border border-surface-muted px-3 py-2 text-sm dark:border-indigo-700 dark:bg-indigo-900" />
              <span className="text-ink/40">–</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full rounded-lg border border-surface-muted px-3 py-2 text-sm dark:border-indigo-700 dark:bg-indigo-900" />
            </div>
            <button onClick={applyPriceRange} className="btn-primary mx-2 mb-2 w-[calc(100%-1rem)] text-xs">Apply</button>
          </Dropdown>
        )}
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "border-marigold-500 bg-marigold-50 text-marigold-700 dark:bg-marigold-500/10"
          : "border-surface-muted text-ink/70 hover:bg-surface-muted dark:border-indigo-700 dark:text-slate-200 dark:hover:bg-indigo-800"
      )}
    >
      {label}
      <ChevronDown className="h-3.5 w-3.5" />
    </button>
  );
}

function Dropdown({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn("card absolute left-0 top-11 z-20 py-1.5", wide ? "w-72" : "w-52")}>
      {children}
    </div>
  );
    }
