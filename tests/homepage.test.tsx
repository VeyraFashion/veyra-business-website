import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import BusinessHome from "@/components/home/BusinessHome";
import DemoShowcase from "@/components/home/DemoShowcase";
import Faq from "@/components/home/Faq";
import RoiCalculator from "@/components/home/RoiCalculator";
import { StoreInputsProvider } from "@/components/home/StoreInputs";

afterEach(cleanup);

describe("homepage interactions", () => {
  it("shows each metric exactly once, grouped by commercial lever", () => {
    const { container } = render(<BusinessHome />);
    const text = container.textContent ?? "";

    // The three levers plus the column that says none of these results are ours.
    expect(screen.getByRole("region", { name: "Conversion" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Basket size" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Returns" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "What we will measure on yours" }),
    ).toBeInTheDocument();

    // Consolidation guard: no metric may appear in more than one place on the page.
    for (const metric of ["+3.5%", "+7.06%", "+39%", "Up to −40%", "−13.1%", "−5.54%"]) {
      const occurrences = text.split(metric).length - 1;
      expect(occurrences, `${metric} should appear exactly once`).toBe(1);
    }

    // Attribution and methodology travel with every figure.
    expect(screen.getByText("DIDI × Faslet")).toBeInTheDocument();
    expect(screen.getByText("Garcia × Faslet")).toBeInTheDocument();
    expect(screen.getByText("Rhone × Stylitics")).toBeInTheDocument();
    expect(screen.getByText("Zalando")).toBeInTheDocument();
    expect(screen.getByText("Controlled A/B")).toBeInTheDocument();
    expect(screen.getByText("Vendor case")).toBeInTheDocument();
    expect(screen.getByText("Retailer pilot")).toBeInTheDocument();
    // Garcia is flagged as adjacent tooling rather than visual try-on evidence.
    expect(screen.getByText("Adjacent category")).toBeInTheDocument();
    expect(screen.getByText(/Size-and-fit tooling rather than visual try-on/i)).toBeInTheDocument();

    expect(screen.getAllByRole("link", { name: /^Source/i })).toHaveLength(4);
  });

  it("never presents third-party outcomes as STYLD's own results", () => {
    const { container } = render(<BusinessHome />);
    const text = container.textContent ?? "";

    // The evidence block states this outright, beside the numbers.
    expect(screen.getByText("None of the numbers to the left are ours.")).toBeInTheDocument();
    expect(
      screen.getByText(/vendor willing to run a control group against ourselves/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Methodology and disclosure/i)).toBeInTheDocument();
    // The cost figures are labelled as arithmetic on the visitor's own inputs.
    expect(screen.getByText(/arithmetic on the inputs shown, not a STYLD result/i)).toBeInTheDocument();
    expect(screen.getByText(/Not a guarantee\s+of STYLD performance/i)).toBeInTheDocument();

    // Guard against the specific unsafe phrasings.
    expect(text).not.toMatch(/STYLD increases conversion/i);
    expect(text).not.toMatch(/STYLD cuts returns by 40/i);
    expect(text).not.toMatch(/STYLD increases AOV by 39/i);
    expect(text).not.toMatch(/guaranteed/i);
  });

  it("routes every primary action to the walkthrough booking", () => {
    const { container } = render(<BusinessHome />);

    // Nav, hero, demo footer, ROI panel, partner card and the closing section.
    expect(container.querySelectorAll('a[href="#book"]').length).toBeGreaterThanOrEqual(5);
    expect(
      screen.getByRole("link", { name: /Book a 20-minute walkthrough/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Send us a product URL/i })).toBeInTheDocument();
  });

  it("does not ship a contact form that silently discards input", () => {
    render(<BusinessHome />);

    const submit = screen.getByRole("button", { name: /Request the walkthrough/i });
    // Disabled until it has a real destination — better than accepting and dropping.
    expect(submit).toBeDisabled();
    expect(screen.getByText(/wire this to a real destination/i)).toBeInTheDocument();
  });

  it("keeps unanswerable questions visibly unanswered rather than fabricated", () => {
    render(<BusinessHome />);

    // Data handling and commercials both depend on facts the codebase doesn't have.
    expect(
      screen.getAllByText(/\[Content required/i).length,
    ).toBeGreaterThanOrEqual(4);
    expect(screen.getByText(/How it goes live\./i)).toBeInTheDocument();
    expect(screen.getByText(/Define the control/i)).toBeInTheDocument();
    // The self-selection warning lives once, in the methodology disclosure.
    expect(screen.getAllByText(/inflates apparent performance/i)).toHaveLength(1);
    expect(
      screen.getByText(/Incremental contribution per eligible session, after returns/i),
    ).toBeInTheDocument();
  });

  it("moves between the four demo tabs by click and keyboard", async () => {
    const user = userEvent.setup();
    render(<DemoShowcase />);

    const tryOn = screen.getByRole("tab", { name: /virtual try-on/i });
    const pdp = screen.getByRole("tab", { name: /product page/i });
    const outfit = screen.getByRole("tab", { name: /complete the outfit/i });

    expect(tryOn).toHaveAttribute("aria-selected", "true");
    // Only the active tab is in the tab order (roving tabindex).
    expect(tryOn).toHaveAttribute("tabindex", "0");
    expect(pdp).toHaveAttribute("tabindex", "-1");

    await user.click(pdp);
    expect(pdp).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByText(/It looks like your product page, because it is your product page/i),
    ).toBeInTheDocument();

    pdp.focus();
    await user.keyboard("{ArrowRight}");
    expect(outfit).toHaveAttribute("aria-selected", "true");
    expect(outfit).toHaveFocus();
    expect(screen.getByText(/Complete the decision/i)).toBeInTheDocument();
  });

  it("opens and closes FAQ answers with an accessible trigger", async () => {
    const user = userEvent.setup();
    render(<Faq />);

    const trigger = screen.getByRole("button", {
      name: /how does styld fit into our storefront or app/i,
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/styld adds an intelligence and image layer/i)).toBeVisible();

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("leads with the current cost of returns and recalculates on scenario change", async () => {
    const user = userEvent.setup();
    render(
      <StoreInputsProvider>
        <RoiCalculator />
      </StoreInputsProvider>,
    );

    // Headline is today's returned revenue: ₹1Cr × 25% = ₹25L. Independent of scenario.
    expect(screen.getByText("₹25.00 L")).toBeInTheDocument();

    // The modelled upside card does move with the scenario.
    expect(screen.getByRole("tab", { name: "Expected" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("₹3.48 L")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Conservative" }));
    expect(screen.getByText("₹1.90 L")).toBeInTheDocument();
    // The cost-of-returns headline must NOT change — it describes today, not a scenario.
    expect(screen.getByText("₹25.00 L")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Strong" }));
    expect(screen.getByText("₹6.29 L")).toBeInTheDocument();
  });

  it("keeps the modelled figures labelled as a scenario, not a guarantee", () => {
    render(
      <StoreInputsProvider>
        <RoiCalculator />
      </StoreInputsProvider>,
    );

    expect(screen.getByText(/Modelled incremental retained revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Not a guarantee\s+of STYLD performance/i)).toBeInTheDocument();
  });

  it("has no automated accessibility violations in the initial homepage state", async () => {
    const { container } = render(<BusinessHome />);
    const results = await axe.run(container);

    await waitFor(() => {
      expect(results.violations, results.violations.map((item) => item.help).join("\n")).toEqual([]);
    });
  });
});
