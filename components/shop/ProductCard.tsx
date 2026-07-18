"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addToCart, toggleWishlist } from "@/actions/cart";
import type { Product } from "@/types/database";
import { cn } from "@/utils/cn";

export function ProductCard({ product, wishlisted = false }: { product: Product; wishlisted?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [isWishlisted, setIsWishlisted] = useState(wishlisted);

  const primaryImage =
    product.product_images?.find((img) => img.is_primary)?.url ??
    product.product_images?.[0]?.url ??
    "/placeholder-product.png";

  const discountPct =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(100 - (product.price / product.compare_at_price) * 100)
      : null;

  function handleAddToCart() {
    startTransition(async () => {
      const res = await addToCart(product.id);
      if (res?.error) toast.error(res.error);
      else toast.success("Added to cart");
    });
  }

  function handleWishlist() {
    setIsWishlisted((prev) => !prev); // optimistic
    startTransition(async () => {
      const res = await toggleWishlist(product.id);
      if (res?.error) {
        setIsWishlisted((prev) => !prev); // revert
        toast.error(res.error);
      }
    });
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card group relative overflow-hidden"
    >
      <button
        onClick={handleWishlist}
        aria-label="Toggle wishlist"
        className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-card backdrop-blur transition-transform hover:scale-110 dark:bg-slate-800/90"
      >
        <Heart className={cn("h-4 w-4", isWishlisted ? "fill-brand-600 text-brand-600" : "text-slate-400")} />
      </button>

      {discountPct && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-600 px-2 py-1 text-xs font-semibold text-white">
          -{discountPct}%
        </span>
      )}

      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="p-4">
          {product.brand && <p className="text-xs uppercase tracking-wide text-slate-400">{product.brand}</p>}
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-slate-800 dark:text-slate-100">{product.name}</h3>

          {product.rating_count > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {product.rating_avg.toFixed(1)} ({product.rating_count})
            </div>
          )}

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-semibold text-brand-700 dark:text-brand-400">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{product.compare_at_price.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={isPending}
          className="btn-primary w-full text-xs disabled:opacity-60"
        >
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
