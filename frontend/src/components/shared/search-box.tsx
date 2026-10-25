"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEARCH_MAX_LENGTH } from "@/lib/search-params";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 600;

type SearchBoxProps = {
  /** The search currently in the URL. */
  value: string;
  basePath: string;
  /** Other search params to keep, such as the status filter. The page always resets to 1. */
  params?: Record<string, string | undefined>;
  label: string;
  placeholder: string;
  className?: string;
};

/** Updates `?q=` in the URL while the user types, so results come from the server. */
export function SearchBox({ value, basePath, params, label, placeholder, className }: SearchBoxProps) {
  const router = useRouter();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const requested = useRef(value);
  const navigationPending = useRef(false);
  const [text, setText] = useState(value);
  const preservedParams = new URLSearchParams();
  for (const [key, param] of Object.entries(params ?? {})) {
    if (param) preservedParams.set(key, param);
  }
  const paramsKey = preservedParams.toString();

  useEffect(() => {
    if (value === requested.current) {
      navigationPending.current = false;
      return;
    }
    if (timer.current !== undefined || navigationPending.current) return;

    requested.current = value;
    setText(value);
  }, [value]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const search = useCallback((next: string) => {
    clearTimeout(timer.current);
    timer.current = undefined;
    const q = next.trim();
    if (q === requested.current) return;
    requested.current = q;
    navigationPending.current = true;

    const query = new URLSearchParams(paramsKey);
    if (q) query.set("q", q);
    const href = query.size ? `${basePath}?${query}` : basePath;
    router.replace(href, { scroll: false });
  }, [basePath, paramsKey, router]);

  useEffect(() => {
    const q = text.trim();
    if (q === requested.current) return;

    const timeout = setTimeout(() => {
      timer.current = undefined;
      search(q);
    }, DEBOUNCE_MS);
    timer.current = timeout;

    return () => {
      clearTimeout(timeout);
      if (timer.current === timeout) timer.current = undefined;
    };
  }, [search, text]);

  function clear() {
    setText("");
    search("");
    inputRef.current?.focus();
  }

  return (
    <form
      role="search"
      className={cn("relative w-full", className)}
      onSubmit={(event) => {
        event.preventDefault();
        search(text);
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        id={id}
        type="search"
        value={text}
        maxLength={SEARCH_MAX_LENGTH}
        placeholder={placeholder}
        autoComplete="off"
        className="h-9 bg-card pr-9 pl-9 [&::-webkit-search-cancel-button]:appearance-none"
        onChange={(event) => {
          setText(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && text) {
            event.preventDefault();
            clear();
          }
        }}
      />
      {text && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground"
          aria-label="Clear search"
          onClick={clear}
        >
          <XIcon aria-hidden="true" />
        </Button>
      )}
    </form>
  );
}
