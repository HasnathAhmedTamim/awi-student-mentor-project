import { AppLink } from "@/components/shared/app-link";
import { Brand } from "@/components/shared/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8 sm:py-12">
      <AppLink
        href="/"
        className="rounded-lg text-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Brand />
      </AppLink>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
