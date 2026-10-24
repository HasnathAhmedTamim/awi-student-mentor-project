"use client";

import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEARCH_MAX_LENGTH } from "@/lib/search-params";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;

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
  const [text, setText] = useState(value);
  const [requested, setRequested] = useState(value);
  const [pending, startTransition] = useTransition();

  // The URL changed without this box, e.g. through a "Clear search" link.
  if (value !== requested) {
    setRequested(value);
    setText(value);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function search(next: string) {
    clearTimeout(timer.current);
    const q = next.trim();
    if (q === requested) return;
    setRequested(q);

    const query = new URLSearchParams();
    for (const [key, param] of Object.entries(params ?? {})) {
      if (param) query.set(key, param);
    }
    if (q) query.set("q", q);
    const href = query.size ? `${basePath}?${query}` : basePath;
    startTransition(() => router.replace(href, { scroll: false }));
  }

  function clear() {
    setText("");
    search("");
    inputRef.current?.focus();
  }

  const Icon = pending ? Loader2Icon : SearchIcon;

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
      <Icon
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground",
          pending && "animate-spin",
        )}
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
        aria-busy={pending}
        className="h-9 bg-card pr-9 pl-9 [&::-webkit-search-cancel-button]:appearance-none"
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => search(next), DEBOUNCE_MS);
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
