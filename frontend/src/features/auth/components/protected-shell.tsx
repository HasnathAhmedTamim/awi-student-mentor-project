import { AppHeader } from "@/components/shared/app-header";
import { requireRole } from "@/lib/auth/session";
import type { Role } from "@/types/user";

/** Server-side role gate for a whole route segment. Must render inside <Suspense>. */
export async function ProtectedShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const user = await requireRole(role);

  return (
    <>
      <AppHeader user={user} />
      {children}
    </>
  );
}
