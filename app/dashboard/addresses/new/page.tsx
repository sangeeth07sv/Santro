import { createAddress } from "@/actions/addresses";
import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Add address" };

export default async function NewAddressPage() {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login?redirect=/dashboard/addresses/new");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold text-ink dark:text-white">Add a shipping address</h1>
      <p className="mb-6 text-sm text-ink/50 dark:text-slate-400">Used for delivery and order tracking.</p>

      <form action={createAddress} className="card space-y-4 p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink dark:text-slate-100">Full name</label>
          <input
            name="full_name"
            required
            className="w-full rounded-lg border border-surface-muted px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-700 dark:bg-indigo-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink dark:text-slate-100">Phone number</label>
          <input
            name="phone"
            type="tel"
            required
            placeholder="10-digit mobile number"
            className="w-full rounded-lg border border-surface-muted px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-700 dark:bg-indigo-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink dark:text-slate-100">Address line 1</label>
          <input
            name="line1"
            required
            placeholder="Flat / House no., Building, Street"
            className="w-full rounded-lg border border-surface-muted px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-700 dark:bg-indigo-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink dark:text-slate-100">Address line 2 (optional)</label>
          <input
            name="line2"
            placeholder="Landmark, Area"
            className="w-full rounded-lg border border-surface-muted px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-700 dark:bg-indigo-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink dark:text-slate-100">City</label>
            <input
              name="city"
              required
              className="w-full rounded-lg border border-surface-muted px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-700 dark:bg-indigo-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink dark:text-slate-100">State</label>
            <input
              name="state"
              required
              className="w-full rounded-lg border border-surface-muted px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-700 dark:bg-indigo-900"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink dark:text-slate-100">Pincode</label>
          <input
            name="postal_code"
            required
            inputMode="numeric"
            placeholder="6-digit PIN code"
            className="w-full rounded-lg border border-surface-muted px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-700 dark:bg-indigo-900"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70 dark:text-slate-300">
          <input type="checkbox" name="is_default" defaultChecked className="rounded border-surface-muted" />
          Set as default address
        </label>

        <button type="submit" className="btn-primary w-full">Save address</button>
      </form>
    </div>
  );
}
