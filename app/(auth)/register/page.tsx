"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { register } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { ShoppingBag, Store, Truck } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "customer", label: "Customer", desc: "Browse & buy products", icon: ShoppingBag },
  { value: "shop_owner", label: "Shop Owner", desc: "Upload & sell products", icon: Store },
  { value: "delivery_partner", label: "Delivery Partner", desc: "Deliver orders", icon: Truck },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<(typeof ROLE_OPTIONS)[number]["value"]>("customer");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await register(formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Account created! Check your email to confirm.");
        router.push("/login");
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Join SANTRO in seconds.</p>

      <form action={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">I am a...</label>
          <input type="hidden" name="role" value={role} />
          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-colors",
                  role === value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "border-slate-200 text-slate-500 hover:border-indigo-200 dark:border-slate-700"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">You can switch this anytime from your dashboard.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Full Name</label>
          <input name="fullName" required className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800 dark:border-slate-700" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
          <input name="email" type="email" required className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800 dark:border-slate-700" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
          <input name="password" type="password" required className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800 dark:border-slate-700" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Confirm Password</label>
          <input name="confirmPassword" type="password" required className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800 dark:border-slate-700" />
        </div>
        <Button type="submit" isLoading={isPending} className="w-full">Create Account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account? <Link href="/login" className="font-medium text-indigo-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
          }
