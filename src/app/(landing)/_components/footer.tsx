import { PROJECT_NAME } from "@/constants";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-muted-foreground sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="font-medium text-foreground">{PROJECT_NAME}</span>
        </div>

        <p>AI workspace SaaS — create, organize, reuse.</p>
        <p>
          © {new Date().getFullYear()} {PROJECT_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
