import { cn } from "@/lib/utils";

type AuthCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/80 p-6 shadow-lg ring-1 ring-foreground/10 backdrop-blur-sm sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
