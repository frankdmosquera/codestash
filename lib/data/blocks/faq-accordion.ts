import type { Snippet } from "../types";

export const faqAccordion: Snippet = {
  slug: "faq-accordion",
  title: "FAQ Accordion",
  description:
    "A frequently-asked-questions section built on the Accordion primitive, with one item open by default.",
  createdAt: "2026-08-27",
  code: `import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    value: "billing",
    question: "How does billing work?",
    answer:
      "You're billed monthly based on the plan you choose. You can upgrade, downgrade, or cancel at any time from your account settings, and changes are prorated automatically.",
  },
  {
    value: "trial",
    question: "Is there a free trial?",
    answer:
      "Yes, every paid plan includes a 14-day free trial. No credit card is required to start, and you'll get a reminder before the trial ends.",
  },
  {
    value: "cancel",
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. There are no long-term contracts. You can cancel from the billing page and you'll retain access until the end of your current billing period.",
  },
  {
    value: "support",
    question: "What kind of support do you offer?",
    answer:
      "All plans include email support with a 24-hour response time. Pro and Enterprise plans also get priority live chat support during business hours.",
  },
  {
    value: "data",
    question: "What happens to my data if I cancel?",
    answer:
      "Your data stays available for 30 days after cancellation so you can export it or reactivate your account. After that window it's permanently deleted.",
  },
];

export function FaqAccordion() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">
          Frequently asked questions
        </h2>
        <p className="mt-3 text-muted-foreground">
          Can't find the answer you're looking for? Reach out to our team.
        </p>
      </div>

      <Accordion defaultValue={["billing"]}>
        {faqs.map((faq) => (
          <AccordionItem key={faq.value} value={faq.value}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p>{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
`,
};
