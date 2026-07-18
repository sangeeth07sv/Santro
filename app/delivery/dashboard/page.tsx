import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getDeliveryOrders } from "@/actions/orders";
import { RoleSwitchCTA } from "@/components/layout/RoleSwitchCTA";
import { DeliveryOrderCard } from "@/components/shop/DeliveryOrderCard";

export const metadata = { title: "Delivery Dashboard" };

export default async function DeliveryDashboardPage() {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login?redirect=/delivery/dashboard");

  const role = auth.profile?.role;
  if (role !== "delivery_partner" && role !== "admin") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <RoleSwitchCTA targetRole="delivery_partner" label="Delivery Partner" />
      </div>
    );
  }

  const orders = await getDeliveryOrders();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Deliveries</h1>
      <p className="mb-6 text-sm text-slate-500">
        Confirmed orders ready to move, with their drop-off location on the map.
      </p>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-muted p-12 text-center text-ink/40">
          No orders waiting for delivery right now.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <DeliveryOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
