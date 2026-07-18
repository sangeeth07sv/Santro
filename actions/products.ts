"use server";

import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
  page?: number;
  pageSize?: number;
}

/** Public product listing with search, filters, and pagination (used by Server Components). */
export async function getProducts(filters: ProductFilters = {}) {
  const supabase = await createClient();
  const { category, search, minPrice, maxPrice, sort = "newest", page = 1, pageSize = 12 } = filters;

  const categorySelect = category
    ? "category:categories!inner(name, slug)"
    : "category:categories(name, slug)";

  let query = supabase
    .from("products")
    .select(`*, product_images(*), ${categorySelect}`, { count: "exact" })
    .eq("is_active", true);

  if (category) query = query.eq("category.slug", category);
  if (search) query = query.textSearch("search_vector", search, { type: "websearch" });
  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);

  switch (sort) {
    case "price_asc": query = query.order("price", { ascending: true }); break;
    case "price_desc": query = query.order("price", { ascending: false }); break;
    case "rating": query = query.order("rating_avg", { ascending: false }); break;
    default: query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return { products: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), category:categories(name, slug), inventory(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data;
}

export async function getFeaturedProducts(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(limit);
  return data ?? [];
}

export async function getProductReviews(productId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, profile:profiles(full_name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ---------------- ADMIN CRUD ----------------

export async function createProduct(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse({
    ...raw,
    is_active: raw.is_active === "true",
    is_featured: raw.is_featured === "true",
    category_id: raw.category_id || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { data, error } = await supabase.from("products").insert(parsed.data).select().single();
  if (error) return { error: error.message };

  // seed a default inventory row
  await supabase.from("inventory").insert({ product_id: data.id, variant_key: "default", quantity: 0 });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true, product: data };
}

export async function updateProduct(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.partial().safeParse({
    ...raw,
    is_active: raw.is_active === "true",
    is_featured: raw.is_featured === "true",
    category_id: raw.category_id || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateInventory(productId: string, variantKey: string, quantity: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("product_id", productId)
    .eq("variant_key", variantKey);

  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return { success: true };
}
