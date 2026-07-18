import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getMyProducts } from "@/actions/products";
import { RoleSwitchCTA } from "@/components/layout/RoleSwitchCTA";
import { ShopDetailsForm } from "@/components/shop/ShopDetailsForm";
import { Plus } from "lucide-react";

export const metadata = { title: "Shop Dashboard" };

export default async function ShopDashboardPage() {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login?redirect=/shop/dashboard");

  const role = auth.profile?.role;
  if (role !== "shop_owner" && role !== "admin") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <RoleSwitchCTA targetRole="shop_owner" label="Shop Owner" />
      </div>
    );
  }

  const products = await getMyProducts(auth.user.id);
  const hasLocation = auth.profile?.latitude != null && auth.profile?.longitude != null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 grid gap-6 md:grid-cols-[360px_1fr]">
        <ShopDetailsForm
          initial={{
            shop_name: auth.profile?.shop_name ?? null,
            shop_address: auth.profile?.shop_address ?? null,
            latitude: auth.profile?.latitude ?? null,
            longitude: auth.profile?.longitude ?? null,
          }}
        />

        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">My Products</h1>
              {!hasLocation && (
                <p className="mt-1 text-sm text-red-500">
                  Set your shop location (left) or customers browsing "near me" won't see your products.
                </p>
              )}
            </div>
            <Link href="/shop/products/new" className="btn-primary">
              <Plus className="h-4 w-4" /> Upload Product
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-muted p-12 text-center text-ink/40">
              No products yet.{" "}
              <Link href="/shop/products/new" className="text-indigo-600 hover:underline">
                Upload your first one
              </Link>
              .
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p: any) => {
                    const stock = (p.inventory ?? []).reduce((n: number, i: any) => n + i.quantity, 0);
                    const image = p.product_images?.find((i: any) => i.is_primary)?.url ?? p.product_images?.[0]?.url;
                    return (
                      <tr key={p.id} className="border-b border-slate-50 last:border-0 dark:border-slate-800">
                        <td className="flex items-center gap-3 p-4">
                          <div className="relative h-10 w-10 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                            {image && <Image src={image} alt="" fill className="object-cover" />}
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-100">{p.name}</span>
                        </td>
                        <td className="p-4">₹{p.price.toLocaleString("en-IN")}</td>
                        <td className="p-4">
                          <span className={stock <= 5 ? "text-red-500" : "text-slate-600 dark:text-slate-300"}>{stock}</span>
                        </td>
                        <td className="p-4">
                          <span className={`rounded-full px-2 py-1 text-xs ${p.is_active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}>
                            {p.is_active ? "Active" : "Draft"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
