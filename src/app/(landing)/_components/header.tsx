import { Button } from "@/components/ui/button";
import { PROJECT_NAME } from "@/constants";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { navLinks } from "./constants";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            {PROJECT_NAME}
          </span>
        </a>

        <nav className="flex flex-wrap items-center gap-1 sm:gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="
              rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground
              "
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link href={"/auth/login"}>
            <Button
              variant={"ghost"}
              size="sm"
              className={"hidden sm:inline-flex cursor-pointer"}
            >
              Sign In
            </Button>
          </Link>
          <Link href={"/auth/login"}>
            <Button size={"sm"} className={"cursor-pointer"}>
              Get Started
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
