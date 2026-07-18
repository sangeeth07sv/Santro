"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/actions/orders";
import { MapPin } from "lucide-react";

const STATUS_FLOW = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"] as const;

function addressToQuery(addr: any) {
  if (!addr) return "";
  return [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country]
    .filter(Boolean)
    .join(", ");
}

export function DeliveryOrderCard({ order }: { order: any }) {
  const [isPending, startTransition] = useTransition();
  const query = addressToQuery(order.shipping_address);
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;

  function handleAdvance() {
    if (!nextStatus) return;
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, nextStatus);
      if (res?.error) toast.error(res.error);
      else toast.success(`Marked as ${nextStatus.replace(/_/g, " ")}`);
    });
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">{order.order_number}</p>
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" /> {query || "No address on file"}
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs capitalize text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {query && (
        <iframe
          title={`Map for ${order.order_number}`}
          src={mapSrc}
          className="h-48 w-full border-0"
          loading="lazy"
        />
      )}

      <div className="flex items-center justify-between p-4 pt-3">
        <span className="text-sm text-slate-500">₹{Number(order.total).toLocaleString("en-IN")}</span>
        {nextStatus ? (
          <button
            onClick={handleAdvance}
            disabled={isPending}
            className="btn-primary px-4 py-2 text-xs disabled:opacity-50"
          >
            Mark as {nextStatus.replace(/_/g, " ")}
          </button>
        ) : (
          <span className="text-xs text-green-600">Delivered ✓</span>
        )}
      </div>
    </div>
  );
}
