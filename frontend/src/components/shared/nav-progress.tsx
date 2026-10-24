"use client";

import { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";

/** Shows the top progress bar while the enclosing <Link> is navigating. Must render inside a <Link>. */
export function NavProgress() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return createPortal(<div className="nav-progress" aria-hidden="true" />, document.body);
}
