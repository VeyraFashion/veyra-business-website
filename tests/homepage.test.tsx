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
      name: /does veyra replace our storefront or app/i,
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/veyra is the intelligence and image layer/i)).toBeVisible();

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

    await user.click(screen.getByRole("button", { name: /copy pilot brief/i }));
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
