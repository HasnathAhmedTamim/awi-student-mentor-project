"use client";

import { LogOutIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await api.post("/auth/logout");
      // A full page load discards pages Next.js keeps in memory, so the next
      // person on this device never sees this user's drafts or form input.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- reload is intended
      window.location.href = "/login";
    } catch {
      toast.error("Could not log out. Please try again.");
      setPending(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={pending}>
      <LogOutIcon aria-hidden="true" />
      <span>{pending ? "Logging out…" : "Log out"}</span>
    </Button>
  );
}
