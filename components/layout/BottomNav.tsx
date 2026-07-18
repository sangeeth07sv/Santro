"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Search, ShoppingCart, User, LayoutDashboard, Package, Truck } from "lucide-react";
import { cn } from "@/utils/cn";

type Role = "customer" | "shop_owner" | "delivery_partner" | "admin" | null | undefined;

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
}

const CUSTOMER_ITEMS: [NavItem, NavItem, NavItem, NavItem] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Shop", icon: Store },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/dashboard", label: "Account", icon: User },
];

const SHOP_OWNER_ITEMS: [NavItem, NavItem, NavItem, NavItem] = [
  { href: "/shop/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shop/products", label: "Products", icon: Package },
  { href: "/shop/products/new", label: "Add", icon: Store },
  { href: "/dashboard", label: "Account", icon: User },
];

const DELIVERY_ITEMS: [NavItem, NavItem, NavItem, NavItem] = [
  { href: "/delivery/dashboard", label: "Deliveries", icon: Truck },
  { href: "/delivery/dashboard", label: "Active", icon: Package },
  { href: "/products", label: "Shop", icon: Store },
  { href: "/dashboard", label: "Account", icon: User },
];

function itemsForRole(role: Role): [NavItem, NavItem, NavItem, NavItem] {
  if (role === "shop_owner") return SHOP_OWNER_ITEMS;
  if (role === "delivery_partner") return DELIVERY_ITEMS;
  return CUSTOMER_ITEMS;
}

export function BottomNav({
  isLoggedIn,
  role,
  cartCount,
}: {
  isLoggedIn: boolean;
  role?: string | null;
  cartCount: number;
}) {
  const pathname = usePathname();

  // Rule: no bottom nav on the landing page, and none for signed-out visitors
  // (there's no role to key the nav off yet — they see the top nav + a sign-in prompt instead).
  if (pathname === "/" || !isLoggedIn) return null;

  const [first, second, , fourth] = itemsForRole(role as Role);
  const searchHref = "/products";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-muted bg-white/95 backdrop-blur dark:border-indigo-700 dark:bg-indigo-900/95 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <div className="relative mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-2 pt-2">
        <NavLink item={first} active={pathname === first.href} />
        <NavLink item={second} active={pathname === second.href} />

        {/* Center FAB — search */}
        <div className="flex items-end justify-center">
          <Link
            href={searchHref}
            aria-label="Search"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-marigold-500 text-indigo-900 shadow-elevated transition-transform active:scale-95"
          >
            <Search className="h-6 w-6" />
          </Link>
        </div>

        {role === "customer" || !role ? (
          <NavLink item={CUSTOMER_ITEMS[2]} active={pathname === CUSTOMER_ITEMS[2].href} badge={cartCount} />
        ) : (
          <NavLink item={itemsForRole(role as Role)[2]} active={false} />
        )}
        <NavLink item={fourth} active={pathname.startsWith(fourth.href)} />
      </div>
    </nav>
  );
}

function NavLink({ item, active, badge }: { item: NavItem; active: boolean; badge?: number }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium",
        active ? "text-marigold-600 dark:text-marigold-300" : "text-ink/40 dark:text-slate-400"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
      {!!badge && badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-marigold-500 text-[9px] font-bold text-indigo-900">
          {badge}
        </span>
      )}
      <span className="uppercase tracking-wide">{item.label}</span>
    </Link>
  );
}
