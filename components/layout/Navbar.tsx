"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";

export function Navbar({
  isLoggedIn,
  isAdmin,
  cartCount,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
  cartCount: number;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-surface-dark/95">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <button className="md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link href="/" className="text-xl font-bold text-brand-700 dark:text-brand-400">
          SANTRO
        </Link>

        <nav className="hidden gap-6 md:flex">
          <Link href="/products" className="text-sm text-slate-600 hover:text-brand-700 dark:text-slate-300">
            Shop
          </Link>
          <Link href="/categories" className="text-sm text-slate-600 hover:text-brand-700 dark:text-slate-300">
            Categories
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-sm text-slate-600 hover:text-brand-700 dark:text-slate-300">
              Admin
            </Link>
          )}
        </nav>

        <form onSubmit={handleSearch} className="ml-auto hidden max-w-md flex-1 items-center md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:bg-slate-800 dark:border-slate-700"
            />
          </div>
        </form>

        <div className={cn("flex items-center gap-3", "ml-auto md:ml-0")}>
          <Link href="/dashboard/wishlist" className="relative">
            <Heart className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 px-4 py-3 md:hidden dark:border-slate-800">
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none dark:bg-slate-800 dark:border-slate-700"
            />
          </form>
          <nav className="flex flex-col gap-3">
            <Link href="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/categories" onClick={() => setMenuOpen(false)}>Categories</Link>
            {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}
