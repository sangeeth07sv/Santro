import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { getCurrentUser } from "@/actions/auth";
import { getCart } from "@/actions/cart";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SANTRO — Premium Shopping, Simplified", template: "%s | SANTRO" },
  description: "Shop the latest products with fast delivery, secure checkout, and premium quality.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const auth = await getCurrentUser();
  const { items } = await getCart();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar
          isLoggedIn={!!auth}
          isAdmin={auth?.profile?.role === "admin"}
          cartCount={items.reduce((n: number, i: any) => n + i.quantity, 0)}
        />
        <main className="min-h-[70vh]">{children}</main>
        <footer className="mt-16 border-t border-slate-100 bg-slate-50 py-10 text-sm text-slate-500 dark:bg-slate-900 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4">
            © {new Date().getFullYear()} SANTRO. All rights reserved.
          </div>
        </footer>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
