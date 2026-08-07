import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { phases } from "./constants";

export function RoadmapSection() {
  return (
    <section className="py-20 sm:py-24" id="roadmap">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Production build order
            </h2>
            <p className="mt-4 text-muted-foreground">
              Core first — chat and workspaces — then productivity and polish.
              Scale when the product works.
            </p>
          </div>
          <Badge variant={"outline"} className="w-fit">
            6 phases · MVP in phases 1–3
          </Badge>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {phases.map((phase) => (
            <Card key={phase.step} size="sm">
              <CardContent className="flex gap-4 pt-1">
                <span className="font-mono text-2xl font-semibold text-muted-foreground/60">
                  {phase.step}
                </span>

                <div>
                  <p className="font-medium">{phase.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {phase.items}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
