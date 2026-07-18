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
      <section className="bg-indigo-800">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:py-20">
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything, <span className="text-marigold-400">sorted.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-indigo-200">
            Fashion, electronics, home & daily essentials — one cart, one checkout, delivered across India.
          </p>
          <Link href="/products" className="btn-primary mt-8 inline-flex">
            Start shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-ink dark:text-white">Featured Products</h2>
          <Link href="/products" className="text-sm font-medium text-indigo-700 hover:underline dark:text-marigold-400">
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
      <div className="rounded-xl border border-dashed border-surface-muted p-12 text-center text-ink/40">
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
