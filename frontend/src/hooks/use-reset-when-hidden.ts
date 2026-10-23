import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * With Cache Components, Next.js hides pages with React's `<Activity>` instead of
 * unmounting them, so a submitted form would still be filled in when the user comes back.
 * Call the returned function after a successful submit; `reset` then runs as soon as the
 * page is hidden. `reset` must be stable (e.g. wrapped in `useCallback`).
 */
export function useResetWhenHidden(reset: () => void) {
  const shouldReset = useRef(false);

  useLayoutEffect(
    () => () => {
      if (shouldReset.current) {
        shouldReset.current = false;
        reset();
      }
    },
    [reset],
  );

  return useCallback(() => {
    shouldReset.current = true;
  }, []);
}
