"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const questions = [
  {
    question: "How does STYLD fit into our storefront or app?",
    answer:
      "STYLD adds an intelligence and image layer behind your experience. Your team can use the API directly or begin with a focused surface while keeping your existing product pages, cart, identity, and analytics in place.",
  },
  {
    question: "What does a shopper need to upload?",
    answer:
      "A shopper can start with a single suitable photo. That photo creates a reusable avatar for future try-ons. The interface clearly explains what is needed and how the image will be used.",
  },
  {
    question: "Can a shopper try multiple garments together?",
    answer:
      "Yes. STYLD supports a base top, a bottom or full-body garment, an outerwear layer, and footwear. It validates each combination before starting the image generation job.",
  },
  {
    question: "How do you keep generated images trustworthy?",
    answer:
      "The workflow includes source analysis, garment-role checks, constrained generation, and a second visual review for color, pattern, logo, texture, construction, and framing. Clear review notes help teams assess every result confidently.",
  },
  {
    question: "What should the first pilot measure?",
    answer:
      "Choose one primary behavior before launch: try-on activation, add-to-cart, conversion, contribution margin, or return behavior. Published retail studies provide useful context, while your own catalog and traffic establish the decision-ready measure.",
  },
] as const;

export default function Faq() {
  return (
    <Accordion className="home-faq" type="single" collapsible>
      {questions.map((item, index) => (
        <AccordionItem className="home-faq-item" value={`item-${index}`} key={item.question}>
          <AccordionTrigger className="home-faq-trigger">
            <span><span className="home-faq-number">0{index + 1}</span>{item.question}</span>
          </AccordionTrigger>
          <AccordionContent className="home-faq-content">
            <div>{item.answer}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
