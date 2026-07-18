import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, LogOut, MapPin, Package, ShieldCheck } from "lucide-react";
import { getCurrentUser, logout } from "@/actions/auth";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Account" };

const ROLE_LABEL: Record<string, string> = {
  customer: "Customer",
  shop_owner: "Shop owner",
  delivery_partner: "Delivery partner",
  admin: "Admin",
};

export default async function DashboardPage() {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login?redirect=/dashboard");

  const { user, profile } = auth;
  const links = [
    { href: "/dashboard/orders", label: "Order history", icon: Package },
    { href: "/dashboard/addresses", label: "Saved addresses", icon: MapPin },
    { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="card flex items-center justify-between p-5">
        <div>
          <p className="text-lg font-semibold text-ink dark:text-white">
            {profile?.full_name || user.email}
          </p>
          <p className="text-sm text-ink/50 dark:text-slate-400">{user.email}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200">
            <ShieldCheck className="h-3 w-3" />
            {ROLE_LABEL[profile?.role ?? "customer"]}
          </span>
        </div>
      </div>

      <nav className="mt-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-ink hover:bg-surface-muted dark:text-slate-100 dark:hover:bg-indigo-800"
          >
            <Icon className="h-4 w-4 text-ink/50" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 space-y-2 border-t border-surface-muted pt-4 dark:border-indigo-700">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-ink/40">Switch account type</p>
        <p className="px-1 text-xs text-ink/50 dark:text-slate-400">
          Have a shop or deliver orders? Visit{" "}
          <Link href="/shop/dashboard" className="text-marigold-600 underline">
            My Shop
          </Link>{" "}
          or{" "}
          <Link href="/delivery/dashboard" className="text-marigold-600 underline">
            Deliveries
          </Link>{" "}
          to set that up.
        </p>
      </div>

      <form action={logout} className="mt-6">
        <Button type="submit" variant="outline" className="w-full">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </form>
    </div>
  );
}
