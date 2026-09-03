"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/** The two final entries are deliberately unanswered.
 *
 *  Data handling and commercials are the questions most likely to stall a deal, and both
 *  depend on facts this codebase doesn't have. An honest "[content required]" is safer than
 *  invented policy or pricing — and it tells whoever owns the site exactly what to supply. */
const questions = [
  {
    question: "How does STYLD fit into our storefront or app?",
    answer:
      "STYLD adds an intelligence and image layer behind your experience. Your team can use the API directly or begin with a focused surface while keeping your existing product pages, cart, identity and analytics in place.",
  },
  {
    question: "What does a shopper need to upload?",
    answer:
      "A single suitable full-body photo, capped at 8 MB. It creates a reusable avatar for future try-ons, and the interface explains what is needed and how the image is used. Cropped, angled, obstructed or multi-person photos get retake guidance before any generation begins.",
  },
  {
    question: "Can a shopper try multiple garments together?",
    answer:
      "Yes — a base top, a bottom or full-body garment, an outerwear layer and footwear. Each combination is validated against garment-role rules before the image job starts.",
  },
  {
    question: "How do you keep generated images trustworthy?",
    answer:
      "Source analysis, garment-role checks, constrained generation, then a second visual review for colour, pattern, logo, texture, construction and framing. Review notes travel with every result.",
  },
  {
    question: "What should the first pilot measure?",
    answer:
      "Choose one primary behaviour before launch: try-on activation, add-to-cart, conversion, contribution margin or return behaviour. Published studies give context; your own catalogue and traffic give the decision-ready number.",
  },
  {
    question: "Where are shopper images processed and how long are they kept?",
    answer:
      "[Content required — do not fabricate] processing region, retention window, sub-processor list, deletion-on-request process, and the consent copy you supply for the shopper-facing surface.",
    pending: true,
  },
  {
    question: "What does it cost, and what happens if we stop?",
    answer:
      "[Content required — do not fabricate] commercial shape and exit terms. Recommended shape once agreed: pilot fee, then per-render or per-session, no platform minimum; on exit the surface is removed and data deleted on request.",
    pending: true,
  },
] as const;

export default function Faq() {
  return (
    <Accordion className="home-faq" type="single" collapsible>
      {questions.map((item, index) => (
        <AccordionItem className="home-faq-item" value={`item-${index}`} key={item.question}>
          <AccordionTrigger className="home-faq-trigger">
            <span>
              <span
                className={
                  "pending" in item && item.pending
                    ? "home-faq-number is-pending"
                    : "home-faq-number"
                }
              >
                0{index + 1}
              </span>
              {item.question}
            </span>
          </AccordionTrigger>
          <AccordionContent className="home-faq-content">
            <div>{item.answer}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
