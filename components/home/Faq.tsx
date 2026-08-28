"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

const questions = [
  {
    question: "Does Veyra replace our storefront or app?",
    answer:
      "No. Veyra is the intelligence and image layer behind the experience. Your team can use the API directly or begin with a focused surface while keeping your existing product pages, cart, identity, and analytics.",
  },
  {
    question: "What does a shopper need to upload?",
    answer:
      "A shopper can start with a single suitable photo. A reusable avatar can then support later try-ons without asking for the same upload every time. The interface should always explain what is needed and how the image will be used.",
  },
  {
    question: "Can a shopper try multiple garments together?",
    answer:
      "Yes, when the layers are compatible. A base top and jacket can work together; two shirts or duplicate footwear cannot. Veyra validates garment roles before starting the image generation job.",
  },
  {
    question: "How do you keep generated images trustworthy?",
    answer:
      "The workflow includes source analysis, garment-role checks, constrained generation, and a second visual review for color, pattern, logo, texture, construction, and framing. The response exposes warnings instead of hiding uncertainty.",
  },
  {
    question: "What should the first pilot measure?",
    answer:
      "Choose one primary behavior before launch: try-on activation, add-to-cart, conversion, contribution margin, or return behavior. Published retail studies are useful context, but the decision should be based on your own catalog and traffic.",
  },
] as const;

export default function Faq() {
  return (
    <Accordion.Root className="home-faq" type="single" collapsible>
      {questions.map((item, index) => (
        <Accordion.Item className="home-faq-item" value={`item-${index}`} key={item.question}>
          <Accordion.Header>
            <Accordion.Trigger className="home-faq-trigger">
              <span><span className="home-faq-number">0{index + 1}</span>{item.question}</span>
              <ChevronDown className="home-faq-chevron" size={19} aria-hidden="true" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="home-faq-content">
            <div>{item.answer}</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
