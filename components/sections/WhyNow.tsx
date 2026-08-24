import { Reveal } from "@/components/Reveal";

export default function WhyNow() {
  return (
    <section className="wrap section" id="why">
      <Reveal className="whynow">
        <div className="feature-kicker">Why Now</div>
        <h2 className="section-title">Why licensing this now, instead of building it.</h2>
        <blockquote>
          &ldquo;A retailer that starts building this in 2026 ships a demo eighteen months from
          now. A retailer that licenses it ships this quarter.&rdquo;
        </blockquote>
        <p>
          Vision AI can finally understand clothing the way a stylist does — cut, color,
          formality, occasion. Virtual try-on crossed a real quality threshold, delivering
          photorealistic results from a single photo at a cost that&rsquo;s fallen roughly
          sixty-fold in two years. None of that changes whether it&rsquo;s worth your
          engineering team&rsquo;s next two quarters to build this in-house, versus licensing a
          layer that&rsquo;s already built, already priced per use, and already proven out on our
          own consumer app before it ever touched a retailer&rsquo;s traffic.
        </p>
      </Reveal>
    </section>
  );
}
