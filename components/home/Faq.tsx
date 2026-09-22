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
 *  depend on facts this codebase doesn't have. Each one says plainly that the answer comes
 *  in writing and lists what it will contain — honest, but still a promise someone has to
 *  keep. Whoever owns the site should replace both with the real region, retention window,
 *  sub-processor list and commercial terms, then drop the `pending` flag. */
const questions = [
  {
    question: "How does STYLD fit into our storefront or app?",
    answer:
      "It sits behind the storefront you already have. Your team calls our API from a page that already exists — a product page, the cart, or a single category — and the shopper never leaves your interface. Product pages, checkout, logins and analytics stay exactly as they are, so there is nothing to re-platform.",
  },
  {
    question: "What does a shopper need to upload?",
    answer:
      "One full-body photo. They upload it once and it becomes a reusable avatar, so every try-on after that is a single tap. The photo is checked before anything is generated: if it is cropped, taken at a sharp angle, partly obstructed, or has more than one person in it, the shopper is asked to retake it rather than handed a poor result.",
  },
  {
    question: "Can a shopper try on a full outfit, or only one item?",
    answer:
      "A full outfit. A top, a bottom or a single full-body piece such as a dress, an outerwear layer, and footwear. Every garment carries a role, and the combination is checked against those roles before the image job starts — so two items can never compete for the same layer.",
  },
  {
    question: "What should the first pilot measure?",
    answer:
      "Agree one primary metric before launch and treat the rest as secondary reporting. Pick from try-on activation, add-to-cart, conversion, contribution margin, or return rate. Published retailer studies tell you what is plausible; only your own catalogue and traffic produce the number a buying committee can actually decide on.",
  },
  {
    question: "Where are shopper images processed, and how long are they kept?",
    answer:
      "You get this in writing before a pilot begins, because it belongs in your contract rather than on a marketing page. It covers the processing region, how long a shopper's images and avatar are retained, the full sub-processor list, how a deletion request is handled and how quickly, and the consent wording shown on the shopper-facing surface. Ask for it on the walkthrough and it comes back as a document your legal and security teams can review.",
    pending: true,
  },
  {
    question: "What does it cost, and what happens if we stop?",
    answer:
      "We quote per pilot instead of publishing a list price, because the number depends on your catalogue size and render volume. The shape we propose: a fixed pilot fee, then usage-based pricing per render or per session, with no platform minimum. If you stop, the surface is removed from your storefront and shopper data is deleted on request — no exit period to serve out.",
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
