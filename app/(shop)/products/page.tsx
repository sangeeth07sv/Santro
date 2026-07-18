import { Suspense } from "react";
import { getProducts, getNearbyProducts } from "@/actions/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGridSkeleton } from "@/components/shop/ProductCardSkeleton";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">
        {params.search ? `Results for "${params.search}"` : hasLocation ? "Shops Near You" : "All Products"}
      </h1>

      <LocationGate />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        <FilterSidebar />
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductResults params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductResults({ params }: { params: PageProps["searchParams"] extends Promise<infer T> ? T : never }) {
  const page = Number(params.page) || 1;
  const filters = {
    category: params.category,
    search: params.search,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: (params.sort as any) || "newest",
    page,
  };

  const usingLocation = !!(params.lat && params.lng);
  const { products, total, pageSize } = usingLocation
    ? { ...(await getNearbyProducts(Number(params.lat), Number(params.lng), filters)), pageSize: 9999 }
    : await getProducts(filters);

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-16 text-center text-slate-400">
        {usingLocation
          ? "No shops with GPS location set are within range yet. Try again once more shops nearby set their location."
          : "No products found. Try adjusting your filters."}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {products.map((product: any) => (
          <div key={product.id}>
            <ProductCard product={product} />
            {usingLocation && typeof product.distance_km === "number" && (
              <p className="mt-1 text-xs text-slate-400">
                {product.owner?.shop_name ?? "Local shop"} · {product.distance_km.toFixed(1)} km away
              </p>
            )}
          </div>
        ))}
      </div>
      {!usingLocation && <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize)} />}
    </div>
  );
}
