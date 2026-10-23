"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await api.post("/auth/logout");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Could not log out. Please try again.");
      setPending(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={pending}>
      <LogOutIcon aria-hidden="true" />
      {pending ? "Logging out…" : "Log out"}
    </Button>
  );
}
