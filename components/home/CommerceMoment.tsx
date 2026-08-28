"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useState } from "react";

const moments = [
  {
    id: "pdp",
    label: "Product page",
    eyebrow: "Build confidence early",
    title: "See the product on a familiar body.",
    body: "The try-on action sits beside the purchase decision, directly inside the familiar product experience.",
    action: "Try this shirt on",
    image: "/products/snitch/shirt-quads-line-grey.png",
    product: "Quads Line Shirt",
    meta: "Relaxed fit · grey",
  },
  {
    id: "cart",
    label: "Cart",
    eyebrow: "Complete the decision",
    title: "Show what turns one item into an outfit.",
    body: "Rank complementary pieces that are actually available, then explain why the combination works.",
    action: "Complete this look",
    image: "/products/snitch/jeans-washed-straight-fit.png",
    product: "Washed Straight Jeans",
    meta: "Selected by shopper",
  },
  {
    id: "after",
    label: "After purchase",
    eyebrow: "Extend the relationship",
    title: "Give the purchase more than one first wear.",
    body: "Use the weather, occasion, and wardrobe context to turn an order into useful styling follow-up.",
    action: "Style it three ways",
    image: "/products/snitch/shirt-denim-regular-fit.png",
    product: "Denim Regular Shirt",
    meta: "Delivered yesterday",
  },
] as const;

export default function CommerceMoment() {
  const [activeId, setActiveId] = useState<(typeof moments)[number]["id"]>("pdp");
  const active = moments.find((moment) => moment.id === activeId) ?? moments[0];

  return (
    <div className="home-moment">
      <div className="home-moment-tabs" role="tablist" aria-label="Commerce touchpoint">
        {moments.map((moment, index) => (
          <button
            key={moment.id}
            type="button"
            role="tab"
            aria-selected={moment.id === activeId}
            aria-controls="commerce-moment-panel"
            id={`commerce-moment-${moment.id}`}
            tabIndex={moment.id === activeId ? 0 : -1}
            className={moment.id === activeId ? "is-active" : undefined}
            onClick={() => setActiveId(moment.id)}
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              const direction = event.key === "ArrowRight" ? 1 : -1;
              const next = (index + direction + moments.length) % moments.length;
              setActiveId(moments[next].id);
              document.getElementById(`commerce-moment-${moments[next].id}`)?.focus();
            }}
          >
            <span>0{index + 1}</span>{moment.label}
          </button>
        ))}
      </div>

      <div
        className="home-moment-panel"
        id="commerce-moment-panel"
        role="tabpanel"
        aria-labelledby={`commerce-moment-${active.id}`}
      >
          <motion.div
            className="home-moment-copy"
            key={`${active.id}-copy`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <p className="home-overline">{active.eyebrow}</p>
            <h3>{active.title}</h3>
            <p>{active.body}</p>
            <div className="home-moment-assurance"><Check size={16} aria-hidden="true" /> Powered by Veyra, presented as your brand</div>
          </motion.div>

          <motion.div
            className="home-moment-ui"
            key={`${active.id}-ui`}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
          >
            <div className="home-moment-storebar"><span>NOON / FORM</span><span>Bag 01</span></div>
            <div className="home-moment-product">
              <div className="home-moment-image">
                <Image src={active.image} alt="" fill sizes="(max-width: 760px) 70vw, 300px" />
              </div>
              <div className="home-moment-product-copy">
                <span className="home-moment-status">{active.meta}</span>
                <h4>{active.product}</h4>
                <p>Product detail stays exactly where the shopper expects it.</p>
                <span className="home-moment-action" aria-hidden="true">
                  <Sparkles size={17} aria-hidden="true" /> {active.action} <ArrowRight size={17} aria-hidden="true" />
                </span>
              </div>
            </div>
          </motion.div>
      </div>
    </div>
  );
}
