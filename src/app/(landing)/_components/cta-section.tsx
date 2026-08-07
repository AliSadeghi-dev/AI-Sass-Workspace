import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_NAME } from "@/constants";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-background ring-1 ring-violet-500/25">
          <CardContent className="flex flex-col items-center px-6 py-14 text-center sm:px-12 sm:py-16">
            <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to turn AI chats into organized work?
            </h2>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Join {PROJECT_NAME} and build a structured environment where every
              conversation, prompt, and output has a place.
            </p>

            <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <Link href={"/auth/login"}>
                <Button
                  size={"lg"}
                  className={"w-full sm:w-auto cursor-pointer"}
                >
                  Get early access
                </Button>
              </Link>

              <Button
                variant={"outline"}
                size={"lg"}
                className={"w-full sm:w-auto"}
              >
                <a href="#roadmap">View roadmap</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
