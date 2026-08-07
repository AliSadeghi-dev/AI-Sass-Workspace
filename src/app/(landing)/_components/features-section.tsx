import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { features } from "./constants";

export function FeaturesSection() {
  return (
    <section
      className="border-t border-border/60 bg-muted/20 py-20 sm:py-24"
      id="features"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need for a real SaaS
          </h2>
          <p className="mt-4 text-muted-foreground">
            From auth and workspaces to streaming chat and billing — built in
            the right order, without overengineering early.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              className="transition-colors hover:bg-card/80"
              key={feature.title}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <feature.icon className="size-5" />
                  </span>
                  <Badge
                    className="shrink-0"
                    variant={feature.status === "MVP" ? "default" : "outline"}
                  >
                    {feature.status}
                  </Badge>
                </div>

                <CardTitle className="mt-3">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
