import Link from "next/link";
import { NavProgress } from "@/components/shared/nav-progress";

/**
 * Internal link that shows a progress bar while the next page loads. Pages verify the
 * session on the server before rendering, so without it a click can look ignored.
 */
export function AppLink({ children, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <NavProgress />
    </Link>
  );
}
