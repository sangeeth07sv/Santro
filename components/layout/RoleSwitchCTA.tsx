"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateRole } from "@/actions/auth";
import { Button } from "@/components/ui/Button";

export function RoleSwitchCTA({
  targetRole,
  label,
}: {
  targetRole: "customer" | "shop_owner" | "delivery_partner";
  label: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSwitch() {
    startTransition(async () => {
      const res = await updateRole(targetRole);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(`You're now set up as ${label}`);
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-dashed border-surface-muted p-8 text-center">
      <p className="text-ink/70 dark:text-slate-300">
        This dashboard is for <strong>{label}</strong> accounts. Switch your account to this role to continue.
      </p>
      <Button onClick={handleSwitch} isLoading={isPending} className="mt-4">
        Switch to {label}
      </Button>
    </div>
  );
}
