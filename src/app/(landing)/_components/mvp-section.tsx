import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import { keyPrinciples, mvpItems } from "./constants";

export function MvpSection() {
  return (
    <section
      className="border-t border-border/60 bg-muted/20 py-20 sm:py-24"
      id="mvp"
    >
      <div className="mx-auto max-w-6xl px-4 am:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <Badge className="mb-4">Final MVP</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ship something real, not perfect
            </h2>
            <p className="mt-4 text-muted-foreground">
              Cut everything else down and you still have a production-ready
              product — fully usable, feeling like a real SaaS, simple enough to
              finish in one build.
            </p>

            <ul className="mt-8 space-y-3">
              {mvpItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <ArrowRight className="size-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Card className="bg-card/80 shadow-lg ring-1 ring-foreground/10">
            <CardHeader>
              <CardTitle>Key principles</CardTitle>
              <CardDescription>
                How we keep the build focused and shippable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {keyPrinciples.map((principle) => (
                <div key={principle} className="flex gap-3 text-sm">
                  <Separator
                    orientation="vertical"
                    className={"h-auto min-h-5 shrink-0"}
                  />
                  <span className="text-muted-foreground">{principle}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
