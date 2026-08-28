import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  ],
};

describe("private brand demo", () => {
  it("renders a live catalog journey and links back to the public pilot", () => {
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    expect(screen.getByRole("heading", { name: /SNITCH’s catalog/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Regular Fit Denim Shirt/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Washed Straight Fit Jeans/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Plan a pilot/i })).toHaveAttribute("href", "/#pilot");
    expect(screen.getByText(/Automatically ranks the strongest combinations/i)).toBeInTheDocument();
  });

  it("keeps one garment per wear role while allowing a top and bottom", async () => {
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    const denimShirt = screen.getByRole("button", { name: /Regular Fit Denim Shirt/i });
    const greyShirt = screen.getByRole("button", { name: /Quads Line Grey Shirt/i });
    const jeans = screen.getByRole("button", { name: /Washed Straight Fit Jeans/i });

    await user.click(denimShirt);
    expect(denimShirt).toHaveClass("selected");

    await user.click(greyShirt);
    expect(denimShirt).not.toHaveClass("selected");
    expect(greyShirt).toHaveClass("selected");

    await user.click(jeans);
    expect(greyShirt).toHaveClass("selected");
    expect(jeans).toHaveClass("selected");
    expect(screen.getByText("Quads Line Grey Shirt", { selector: ".selected-chip" })).toBeInTheDocument();
    expect(screen.getByText("Washed Straight Fit Jeans", { selector: ".selected-chip" })).toBeInTheDocument();
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
});
