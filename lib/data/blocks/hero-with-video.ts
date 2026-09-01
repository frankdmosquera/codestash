import type { Snippet } from "../types";

export const heroWithVideo: Snippet = {
  slug: "hero-with-video",
  title: "Hero with Video",
  description:
    "A hero section pairing a headline and CTA buttons with an autoplaying muted product video.",
  code: `import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, PlayIcon } from "lucide-react";

export function HeroWithVideo() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <Badge variant="secondary" className="mb-4">
          Now in public beta
        </Badge>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Ship your product faster than ever
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Watch how teams use our platform to plan, build, and launch
          features without slowing down.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg">
            Get started
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <Button size="lg" variant="outline">
            <PlayIcon data-icon="inline-start" />
            Watch demo
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        {/* Replace src with your own hosted video, e.g. "/videos/product-demo.mp4" */}
        <video
          className="aspect-video w-full bg-muted object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
        >
          <source src="/videos/product-demo.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
`,
};
