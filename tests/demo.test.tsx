import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import StoreDemo from "@/components/demo/StoreDemo";
import type { Catalog } from "@/lib/catalog";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

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
      imageDiskPath: "/tmp/not-used-in-tests/shirt-denim-regular-fit.png",
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
      imageDiskPath: "/tmp/not-used-in-tests/shirt-quads-line-grey.png",
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
      imageDiskPath: "/tmp/not-used-in-tests/jeans-washed-straight-fit.png",
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
      imageDiskPath: "/tmp/not-used-in-tests/shirt-quads-line-grey.png",
    },
  ],
};

describe("private brand demo", () => {
  it("ships critical demo content visible before client hydration", () => {
    const html = renderToStaticMarkup(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    expect(html).toContain("See SNITCH");
    expect(html).toContain("Regular Fit Denim Shirt");
    expect(html).not.toMatch(/opacity:\s*0/);
  });

  it("renders a live catalog journey and links back to the public pilot", () => {
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    expect(screen.getByRole("heading", { name: /SNITCH’s catalog/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Regular Fit Denim Shirt/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Washed Straight Fit Jeans/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Plan a pilot/i })).toHaveAttribute("href", "/#pilot");
    expect(screen.getByRole("heading", { name: /Three looks. Already on you/i })).toBeInTheDocument();
    expect(screen.getByText(/Upload once. Receive three complete looks on you/i)).toBeInTheDocument();
  });

  it("requires one reusable shopper photo and a conversational brief", async () => {
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    const chatInput = screen.getByRole("textbox", { name: /Where are you going/i });
    const photoInput = screen.getByLabelText(/Add your full-body photo/i);
    const submit = screen.getByRole("button", { name: /Create 3 looks on me/i });

    expect(chatInput).toHaveAttribute("maxlength", "600");
    expect(photoInput).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /first date at an art gallery/i }));
    expect(chatInput).toHaveValue("A first date at an art gallery, polished but relaxed");
    expect(submit).toBeDisabled();

    await user.upload(photoInput, new File(["shopper"], "shopper.jpg", { type: "image/jpeg" }));
    expect(submit).toBeEnabled();
  });

  it("shows immediate progress after the shopper starts the three-look journey", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => undefined)));
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    await user.type(
      screen.getByRole("textbox", { name: /Where are you going/i }),
      "Dinner by the sea at sunset",
    );
    await user.upload(
      screen.getByLabelText(/Add your full-body photo/i),
      new File(["shopper"], "shopper.jpg", { type: "image/jpeg" }),
    );
    await user.click(screen.getByRole("button", { name: /Create 3 looks on me/i }));

    expect(screen.getByRole("button", { name: /Checking photo and styling/i })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(/composing three looks/i);
    expect(screen.getByRole("status")).toHaveTextContent(/Please keep this page open/i);
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
    expect(screen.getAllByText(/Quads Line Grey Shirt \+ Washed Straight Fit Jeans/i)).toHaveLength(2);
    expect(screen.getByRole("button", { name: /Build 3 looks with these/i })).toBeInTheDocument();
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
