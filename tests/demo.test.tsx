import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import StoreDemo from "@/components/demo/StoreDemo";
import type { Catalog } from "@/lib/catalog";

afterEach(cleanup);

const snitchSample: Catalog = {
  brand: "SNITCH",
  note: "Focused route test catalog",
  items: [
    {
      id: "denim-shirt",
      name: "Regular Fit Denim Shirt",
      price_inr: 1499,
      category: "shirts",
      role: "base_top",
      colors: ["blue"],
      tags: ["casual"],
      image: "/products/snitch/shirt-denim-regular-fit.png",
    },
    {
      id: "grey-shirt",
      name: "Quads Line Grey Shirt",
      price_inr: 999,
      category: "shirts",
      role: "base_top",
      colors: ["grey"],
      tags: ["casual"],
      image: "/products/snitch/shirt-quads-line-grey.png",
    },
    {
      id: "straight-jeans",
      name: "Washed Straight Fit Jeans",
      price_inr: 1999,
      category: "jeans",
      role: "bottom",
      colors: ["blue"],
      tags: ["casual"],
      image: "/products/snitch/jeans-washed-straight-fit.png",
    },
    {
      id: "utility-jumpsuit",
      name: "Utility Jumpsuit",
      price_inr: 2499,
      category: "jumpsuits",
      role: "full_body",
      colors: ["black"],
      tags: ["evening"],
      image: "/products/snitch/shirt-quads-line-grey.png",
    },
  ],
};

describe("private brand demo", () => {
  it("renders a live catalog journey and links back to the public pilot", () => {
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    expect(screen.getByRole("heading", { name: /SNITCH’s catalog/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Regular Fit Denim Shirt/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Washed Straight Fit Jeans/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Plan a pilot/i })).toHaveAttribute("href", "/#pilot");
    expect(screen.getByRole("heading", { name: /Turn products into a considered look/i })).toBeInTheDocument();
    expect(screen.getByText(/Veyra compares compatible combinations/i)).toBeInTheDocument();
  });

  it("keeps one garment per wear role while allowing a top and bottom", async () => {
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    const denimShirt = screen.getByRole("button", { name: /Regular Fit Denim Shirt/i });
    const greyShirt = screen.getByRole("button", { name: /Quads Line Grey Shirt/i });
    const jeans = screen.getByRole("button", { name: /Washed Straight Fit Jeans/i });

    await user.click(denimShirt);
    expect(denimShirt).toHaveClass("selected");
    expect(denimShirt).toHaveAttribute("aria-pressed", "true");

    await user.click(greyShirt);
    expect(denimShirt).not.toHaveClass("selected");
    expect(greyShirt).toHaveClass("selected");

    await user.click(jeans);
    expect(greyShirt).toHaveClass("selected");
    expect(jeans).toHaveClass("selected");
    expect(screen.getByText("Quads Line Grey Shirt", { selector: ".demo-selected-chip" })).toBeInTheDocument();
    expect(screen.getByText("Washed Straight Fit Jeans", { selector: ".demo-selected-chip" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue to try-on/i })).toBeInTheDocument();
  });

  it("replaces separates with a full-body garment and restores separates cleanly", async () => {
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    const shirt = screen.getByRole("button", { name: /Regular Fit Denim Shirt/i });
    const jeans = screen.getByRole("button", { name: /Washed Straight Fit Jeans/i });
    const jumpsuit = screen.getByRole("button", { name: /Utility Jumpsuit/i });

    await user.click(shirt);
    await user.click(jeans);
    expect(shirt).toHaveClass("selected");
    expect(jeans).toHaveClass("selected");

    await user.click(jumpsuit);
    expect(shirt).not.toHaveClass("selected");
    expect(jeans).not.toHaveClass("selected");
    expect(jumpsuit).toHaveClass("selected");

    await user.click(shirt);
    expect(jumpsuit).not.toHaveClass("selected");
    expect(shirt).toHaveClass("selected");
  });

  it("shows a useful activation path for brands awaiting catalog images", () => {
    render(
      <StoreDemo
        brandId="a952ff1c54"
        catalog={{ brand: "Blissclub", note: "Catalog pending", items: [] }}
      />,
    );

    expect(screen.getByRole("heading", { name: /Catalog coming soon for Blissclub/i })).toBeInTheDocument();
    expect(screen.getByText(/activate product selection, AI outfit ranking, and virtual try-on/i)).toBeInTheDocument();
  });

  it("has no automated accessibility violations in the initial catalog state", async () => {
    const { container } = render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);
    const results = await axe.run(container);

    await waitFor(() => {
      expect(results.violations, results.violations.map((item) => item.help).join("\n")).toEqual([]);
    });
  });
});
