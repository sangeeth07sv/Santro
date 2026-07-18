import { Suspense } from "react";
import Link from "next/link";
import { getFeaturedProducts } from "@/actions/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGridSkeleton } from "@/components/shop/ProductCardSkeleton";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white dark:from-slate-900 dark:to-surface-dark">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Premium shopping, <span className="text-brand-600">simplified.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-500 dark:text-slate-400">
            Curated products, fast delivery, and a checkout experience built for speed.
          </p>
          <Link href="/products" className="btn-primary mt-8 inline-flex">
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Featured Products</h2>
          <Link href="/products" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <FeaturedGrid />
        </Suspense>
      </section>
    </div>
  );
}

async function FeaturedGrid() {
  const products = await getFeaturedProducts(8);

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
        No featured products yet. Add some from the admin dashboard.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
