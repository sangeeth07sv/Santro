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

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Products from shop owners within `radiusKm` of (lat, lng), sorted nearest
 * first. Admin-catalog products (owner_id null, no shop location) are
 * excluded — there's nothing to measure distance from.
 *
 * NOTE: no DB-side pagination — distance is computed in JS after fetching
 * all active shop-owner products, then filtered/sorted. Fine for a few
 * hundred products; revisit with a PostGIS/RPC-based query if the catalog
 * grows large.
 */
export async function getNearbyProducts(lat: number, lng: number, filters: ProductFilters = {}, radiusKm = 15) {
  const supabase = await createClient();
  const { category, search, minPrice, maxPrice, sort = "newest" } = filters;

  const categorySelect = category
    ? "category:categories!inner(name, slug)"
    : "category:categories(name, slug)";

  let query = supabase
    .from("products")
    .select(`*, product_images(*), owner:profiles!products_owner_id_fkey(shop_name, shop_address, latitude, longitude), ${categorySelect}`)
    .eq("is_active", true)
    .not("owner_id", "is", null);

  if (category) query = query.eq("category.slug", category);
  if (search) query = query.textSearch("search_vector", search, { type: "websearch" });
  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const withDistance = (data ?? [])
    .filter((p: any) => p.owner?.latitude != null && p.owner?.longitude != null)
    .map((p: any) => ({ ...p, distance_km: haversineKm(lat, lng, p.owner.latitude, p.owner.longitude) }))
    .filter((p: any) => p.distance_km <= radiusKm);

  switch (sort) {
    case "price_asc": withDistance.sort((a: any, b: any) => a.price - b.price); break;
    case "price_desc": withDistance.sort((a: any, b: any) => b.price - a.price); break;
    case "rating": withDistance.sort((a: any, b: any) => b.rating_avg - a.rating_avg); break;
    default: withDistance.sort((a: any, b: any) => a.distance_km - b.distance_km); // nearest first
  }

  return { products: withDistance, total: withDistance.length };
}

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, name, slug").eq("is_active", true).order("sort_order");
  return data ?? [];
}

/** Products uploaded by the given shop owner (or all admin-owned products if ownerId is null). */
export async function getMyProducts(ownerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), inventory(quantity)")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ---------------- ADMIN / SHOP OWNER CRUD ----------------

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

  // owner_id is derived server-side from the session, never trusted from the
  // client — a shop_owner always owns what they upload, an admin uploads to
  // the shared catalog (owner_id null). RLS backs this up independently.
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const ownerId = profile?.role === "shop_owner" ? user!.id : null;

  const { data, error } = await supabase
    .from("products")
    .insert({ ...parsed.data, owner_id: ownerId })
    .select()
    .single();
  if (error) return { error: error.message };

  // optional single image URL, uploaded straight from the form
  const imageUrl = raw.image_url as string | undefined;
  if (imageUrl) {
    await supabase.from("product_images").insert({ product_id: data.id, url: imageUrl, is_primary: true });
  }

  // seed a default inventory row
  const startingQty = Number(raw.quantity) || 0;
  await supabase.from("inventory").insert({ product_id: data.id, variant_key: "default", quantity: startingQty });

  revalidatePath("/admin/products");
  revalidatePath("/shop/dashboard");
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
    
