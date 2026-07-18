import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getCategories } from "@/actions/products";
import { NewProductForm } from "@/components/shop/NewProductForm";
import { RoleSwitchCTA } from "@/components/layout/RoleSwitchCTA";

export const metadata = { title: "Upload Product" };

export default async function NewShopProductPage() {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login?redirect=/shop/products/new");

  const role = auth.profile?.role;
  if (role !== "shop_owner" && role !== "admin") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <RoleSwitchCTA targetRole="shop_owner" label="Shop Owner" />
      </div>
    );
  }

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">Upload a Product</h1>
      <NewProductForm categories={categories} />
    </div>
  );
}
