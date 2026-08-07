import { PROJECT_NAME } from "@/constants";
import { SparklesIcon } from "lucide-react";
import Link from "next/link";

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  description: string;
};

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.22_280/0.18),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_100%_0%,oklch(0.6_0.15_250/0.1),transparent)]"
      />

      <header className="px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href={"/"}
          className="mx-auto flex w-fit max-w-md items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SparklesIcon className="size-4" />
          </span>
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            {PROJECT_NAME}
          </span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-12 sm:px-6">
        <div className="w-full max-w-md space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
        <div className="mt-8 w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
