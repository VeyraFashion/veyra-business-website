import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import BusinessHome from "@/components/home/BusinessHome";
import CommerceMoment from "@/components/home/CommerceMoment";
import Faq from "@/components/home/Faq";
import PilotChecklist from "@/components/home/PilotChecklist";

afterEach(cleanup);

describe("homepage interactions", () => {
  it("shows current virtual fitting room evidence with its pilot scope", () => {
    render(<BusinessHome />);

    expect(screen.getByText("From pilot signal to retail scale.")).toBeInTheDocument();
    expect(screen.getByText("Up to 40%")).toBeInTheDocument();
    expect(screen.getByText(/fewer returns in recent Virtual Fitting Room pilots/i)).toBeInTheDocument();
    expect(screen.getByText("Scaling to millions of customers")).toBeInTheDocument();
    expect(screen.getByText(/retailer-reported pilot result/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View pilot result/i })).toHaveAttribute(
      "href",
      "https://corporate.zalando.com/en/technology/how-zalando-uses-technology-help-customers-find-right-size",
    );
    expect(screen.getByRole("link", { name: /View scale update/i })).toHaveAttribute(
      "href",
      "https://corporate.zalando.com/en/fashion/tracking-future-why-zalando-uniquely-placed-lead-next-era-retail",
    );
    expect(screen.queryByText(/Zalando SizeFlags/i)).not.toBeInTheDocument();
    expect(screen.queryByText("−3.8%")).not.toBeInTheDocument();
  });

  it("renders branded primary actions with legible text", () => {
    const { container } = render(<BusinessHome />);
    const primaryLinks = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a[data-slot="button"][href="#pilot"]'),
    );

    expect(primaryLinks).toHaveLength(2);
    for (const link of primaryLinks) {
      expect(link).toHaveAttribute("data-slot", "button");
      expect(link).toHaveAttribute("data-variant", "primary");
      expect(link).toHaveClass("bg-styld-cobalt", "text-white!");
    }
  });

  it("changes the commerce story by click and keyboard", async () => {
    const user = userEvent.setup();
    render(<CommerceMoment />);

    const productTab = screen.getByRole("tab", { name: /product page/i });
    const cartTab = screen.getByRole("tab", { name: /cart/i });
    const afterPurchaseTab = screen.getByRole("tab", { name: /after purchase/i });

    expect(productTab).toHaveAttribute("aria-selected", "true");
    await user.click(cartTab);
    expect(cartTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Show what turns one item into an outfit.")).toBeInTheDocument();

    cartTab.focus();
    await user.keyboard("{ArrowRight}");
    expect(afterPurchaseTab).toHaveAttribute("aria-selected", "true");
    expect(afterPurchaseTab).toHaveFocus();
    expect(screen.getByText("Give the purchase more than one first wear.")).toBeInTheDocument();
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

  it("copies a useful pilot brief and confirms success", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<PilotChecklist />);

    const copyButton = screen.getByRole("button", { name: /copy pilot brief/i });
    expect(copyButton).toHaveAttribute("data-variant", "inverse");
    expect(copyButton).toHaveClass("text-styld-foreground!");
    await user.click(copyButton);
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0][0]).toContain("Customer moment:");
    expect(await screen.findByRole("button", { name: /pilot brief copied/i })).toBeVisible();
  });

  it("has no automated accessibility violations in the initial homepage state", async () => {
    const { container } = render(<BusinessHome />);
    const results = await axe.run(container);

    await waitFor(() => {
      expect(results.violations, results.violations.map((item) => item.help).join("\n")).toEqual([]);
    });
  });
});
