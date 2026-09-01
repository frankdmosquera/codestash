import type { Snippet } from "../types";

export const pricingTable: Snippet = {
  slug: "pricing-table",
  title: "Pricing Table",
  description:
    "A 3-tier pricing section with a highlighted 'Popular' plan, feature lists, and CTA buttons.",
  createdAt: "2026-08-22",
  code: `import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckIcon } from "lucide-react";

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

const plans: Plan[] = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "For individuals trying things out.",
    features: ["1 project", "Community support", "Basic analytics"],
    cta: "Get started",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For small teams that need more power.",
    features: [
      "Unlimited projects",
      "Priority support",
      "Advanced analytics",
      "Team collaboration",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For organizations with custom needs.",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "SSO & audit logs",
      "Custom contracts",
    ],
    cta: "Contact sales",
  },
];

export function PricingTable() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">
          Simple, transparent pricing
        </h2>
        <p className="mt-3 text-muted-foreground">
          Pick the plan that fits your team. Upgrade or cancel anytime.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.popular ? "ring-2 ring-primary" : undefined
            }
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              {plan.popular ? (
                <CardAction>
                  <Badge>Popular</Badge>
                </CardAction>
              ) : null}
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              <Separator />

              <ul className="flex flex-col gap-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckIcon className="size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
`,
};
