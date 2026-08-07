import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PROJECT_NAME } from "@/constants";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pt-24 lg:px-8 lg:pt-28">
      <div className="mx-auto max-w-exl text-center">
        <Badge variant="secondary" className="mb-6">
          {PROJECT_NAME}
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Create, organize, and{" "}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            reuse
          </span>{" "}
          your AI work
        </h1>

        <p className="mt-6 text-lg text-muted-foreground text-pretty sm:text-xl">
          {PROJECT_NAME} is not just another chat app. It is a structured
          productivity environment for working with AI — workspaces, persistent
          conversations, and a prompt library built in.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={"/auth/login"}>
            <Button>Start Building</Button>
          </Link>

          <Button
            variant={"outline"}
            size={"lg"}
            className={"w-full sm:w-auto"}
          >
            <a href="#features">Explore Features</a>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2">
        <Card className="border-dashed bg-muted/30">
          <CardHeader>
            <CardTitle className="text-violet-300">Instead of...</CardTitle>
            <CardDescription className="text-base text-foreground/80">
              Just chatting with AI and losing context every session.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-violet-500/30 bg-violet-500/5 ring-violet-500/20">
          <CardHeader>
            <CardTitle className="text-violet-300">You get…</CardTitle>
            <CardDescription className="text-base text-foreground/90">
              A system to create, organize, and reuse AI output inside
              structured workspaces.{" "}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
