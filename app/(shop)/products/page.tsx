import { Suspense } from "react";
import { getProducts, getNearbyProducts, getCategories } from "@/actions/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGridSkeleton } from "@/components/shop/ProductCardSkeleton";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { FilterChips } from "@/components/shop/FilterChips";
import { ShopResultCard } from "@/components/shop/ShopResultCard";
import { NearbyShopsMapLoader } from "@/components/shop/NearbyShopsMapLoader";
import { Pagination } from "@/components/shop/Pagination";
import { LocationGate } from "@/components/shop/LocationGate";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shop All Products" };

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    lat?: string;
    lng?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const hasLocation = !!(params.lat && params.lng);

  return (
    <div className={hasLocation ? "" : "mx-auto max-w-7xl px-4 py-8"}>
      {!hasLocation && (
        <h1 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">
          {params.search ? `Results for "${params.search}"` : "All Products"}
        </h1>
      )}

      {!hasLocation && <LocationGate />}

      <Suspense fallback={<div className="px-4 py-8"><ProductGridSkeleton /></div>}>
        <ProductResults params={params} hasLocation={hasLocation} />
      </Suspense>
    </div>
  );
}

async function ProductResults({
  params,
  hasLocation,
}: {
  params: PageProps["searchParams"] extends Promise<infer T> ? T : never;
  hasLocation: boolean;
}) {
  const page = Number(params.page) || 1;
  const filters = {
    category: params.category,
    search: params.search,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: (params.sort as any) || "newest",
    page,
  };

  if (hasLocation) {
    const [{ products, total }, categories] = await Promise.all([
      getNearbyProducts(Number(params.lat), Number(params.lng), filters),
      getCategories(),
    ]);

    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col md:flex-row">
        <div className="h-64 shrink-0 md:h-full md:w-1/2 lg:w-3/5">
          <NearbyShopsMapLoader userLat={Number(params.lat)} userLng={Number(params.lng)} products={products} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 md:w-1/2 lg:w-2/5">
          <h1 className="mb-3 text-lg font-semibold text-ink dark:text-white">
            {total} shop item{total === 1 ? "" : "s"} near you
          </h1>
          <FilterChips categories={categories ?? []} />

          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-muted p-10 text-center text-sm text-ink/40">
              No shops with GPS location set are within range yet. Try again once more shops nearby set their location.
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product: any) => (
                <ShopResultCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const { products, total, pageSize } = await getProducts(filters);

  if (products.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-[240px_1fr]">
        <FilterSidebar />
        <div className="rounded-xl border border-dashed border-slate-200 p-16 text-center text-slate-400">
          No products found. Try adjusting your filters.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-[240px_1fr]">
      <FilterSidebar />
      <div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize)} />
      </div>
    </div>
  );
      }
