import type { Snippet } from "../types";

export const ctaBanner: Snippet = {
  slug: "cta-banner",
  title: "CTA Banner",
  description:
    "A simple full-width call-to-action banner with a headline and two buttons, ready to drop at the bottom of any page.",
  code: `import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col items-center gap-6 rounded-xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to get started?
        </h2>
        <p className="max-w-xl text-primary-foreground/80">
          Create your account in minutes and see why teams switch to us. No
          credit card required.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" variant="secondary">
            Start free trial
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Talk to sales
          </Button>
        </div>
      </div>
    </section>
  );
}
`,
};
