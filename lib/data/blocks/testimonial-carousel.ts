import type { Snippet } from "../types";

export const testimonialCarousel: Snippet = {
  slug: "testimonial-carousel",
  title: "Testimonial Carousel",
  description:
    "A swipeable testimonials section built on the Carousel primitive, with an avatar, name, and role per slide.",
  createdAt: "2026-08-30",
  code: `import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { QuoteIcon } from "lucide-react";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  avatarSrc?: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Switching over cut our release cycle in half. The whole team picked it up in an afternoon.",
    name: "Maya Chen",
    role: "Engineering Lead, Northwind",
    initials: "MC",
    avatarSrc: "/avatars/maya-chen.jpg",
  },
  {
    quote:
      "Support is fast and the product just works. It's rare to find both in the same tool.",
    name: "Diego Ramirez",
    role: "Founder, Ramirez Studio",
    initials: "DR",
    avatarSrc: "/avatars/diego-ramirez.jpg",
  },
  {
    quote:
      "We evaluated four other options and this was the only one that didn't need a workaround for our workflow.",
    name: "Priya Nair",
    role: "Product Manager, Fieldstone",
    initials: "PN",
    avatarSrc: "/avatars/priya-nair.jpg",
  },
];

export function TestimonialCarousel() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">
          Loved by teams everywhere
        </h2>
        <p className="mt-3 text-muted-foreground">
          Here's what customers say after switching over.
        </p>
      </div>

      <Carousel opts={{ loop: true }} className="mx-auto max-w-2xl">
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.name}>
              <Card>
                <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
                  <QuoteIcon className="size-6 text-muted-foreground" />
                  <p className="text-lg leading-relaxed">
                    {testimonial.quote}
                  </p>
                  <Avatar size="lg">
                    <AvatarImage
                      src={testimonial.avatarSrc}
                      alt={testimonial.name}
                    />
                    <AvatarFallback>{testimonial.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
`,
};
