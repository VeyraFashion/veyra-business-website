import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
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
      productUrl: "https://www.snitch.co.in/products/denim-shirt",
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
      productUrl: "https://www.snitch.co.in/products/straight-jeans",
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
  it("uses the complete experience for any brand with an activated catalog", () => {
    const otherBrandCatalog: Catalog = {
      ...snitchSample,
      brand: "Example Brand",
      note: "Brand-agnostic behavior test",
    };

    render(<StoreDemo brandId="example-brand-id" catalog={otherBrandCatalog} />);

    expect(screen.getByRole("heading", { name: /Example Brand’s catalog/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Complete looks. Already on you/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Want to try specific pieces together/i }))
      .toBeInTheDocument();
    expect(screen.getAllByAltText(
      /Example of one person standing front-facing with their full body visible/i,
    )).toHaveLength(2);
    expect(screen.getByRole("button", { name: /Select Regular Fit Denim Shirt/i }))
      .toBeInTheDocument();
  });

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
    expect(screen.getByRole("heading", { name: /Complete looks. Already on you/i })).toBeInTheDocument();
    expect(screen.getByText(/Upload once. Receive complete looks on you/i)).toBeInTheDocument();
  });

  it("shows a front-facing full-body example before photo upload", () => {
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    const examples = screen.getAllByAltText(
      /Example of one person standing front-facing with their full body visible/i,
    );
    expect(examples).toHaveLength(2);
    examples.forEach((example) => {
      expect(example).toHaveAttribute("src", expect.stringContaining("tryon-photo-example.png"));
    });
    expect(screen.getAllByText("Example photo")).toHaveLength(2);
    expect(screen.getAllByText(/Match this framing: one person, head to toe, facing forward/i))
      .toHaveLength(2);
  });

  it("requires one reusable shopper photo and a conversational brief", async () => {
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    const guidedSection = screen.getByRole("heading", { name: /Complete looks. Already on you/i })
      .closest("section") as HTMLElement;
    const chatInput = screen.getByRole("textbox", { name: /Where are you going/i });
    const photoInput = screen.getByLabelText(/Add your full-body photo/i);
    const submit = screen.getByRole("button", { name: /Create looks on me/i });

    expect(chatInput).toHaveAttribute("maxlength", "600");
    expect(photoInput).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
    expect(submit).toBeDisabled();
    expect(submit.closest(".demo-stylist-action-group")).toHaveAttribute(
      "title",
      "Upload your photo and describe where you are going.",
    );

    await user.click(screen.getByRole("button", { name: /casual first date this weekend/i }));
    expect(chatInput).toHaveValue(
      "I have a casual first date this weekend. I want to look good without feeling overdressed.",
    );
    expect(screen.getByText("Clear text")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear styling brief" }));
    expect(chatInput).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Clear styling brief" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /casual first date this weekend/i }));
    expect(submit).toBeDisabled();
    expect(within(guidedSection).getByText("Upload your photo to continue.")).toBeInTheDocument();

    await user.upload(photoInput, new File(["shopper"], "shopper.jpg", { type: "image/jpeg" }));
    expect(submit).toBeEnabled();
  });

  it("shares the first photo across both experiences and separates them after Clear", async () => {
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    const guidedInput = screen.getByLabelText("Add your full-body photo");
    const specificInput = screen.getByLabelText("Add your photo for selected-piece looks");
    await user.upload(guidedInput, new File(["shared"], "shared.jpg", { type: "image/jpeg" }));

    expect(screen.getAllByAltText("Your selected photo")).toHaveLength(2);
    expect(screen.getAllByText("Remove photo")).toHaveLength(2);
    expect(screen.getAllByText("Shared with both experiences")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Remove photo for selected-piece looks" }));
    expect(screen.getAllByAltText("Your selected photo")).toHaveLength(1);
    expect(screen.getByText("Used only for guided looks")).toBeInTheDocument();

    await user.upload(specificInput, new File(["specific"], "specific.jpg", { type: "image/jpeg" }));
    expect(screen.getAllByAltText("Your selected photo")).toHaveLength(2);
    expect(screen.getByText("Used only for guided looks")).toBeInTheDocument();
    expect(screen.getByText("Used only for selected-piece looks")).toBeInTheDocument();
  });

  it("renders one exact selected-piece image without adding unselected categories", async () => {
    const tryOnRequests: FormData[] = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/tryon")) {
        tryOnRequests.push(init?.body as FormData);
        return Response.json({ job_id: "specific-job", status: "queued" }, { status: 202 });
      }
      if (url.endsWith("/tryon/specific-job")) {
        return Response.json({
          status: "completed",
          result: {
            output_image_base64: "specific-result",
            mime_type: "image/png",
            quality_threshold_met: true,
          },
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    const heading = screen.getByRole("heading", { name: /Want to try specific pieces together/i });
    const specificSection = heading.closest("section") as HTMLElement;
    expect(within(specificSection).queryByRole("textbox", { name: /Where are you going/i }))
      .not.toBeInTheDocument();
    const initialSubmit = within(specificSection).getByRole("button", { name: /Create this look on me/i });
    expect(initialSubmit).toBeDisabled();
    expect(initialSubmit.closest(".demo-stylist-action-group")).toHaveAttribute(
      "title",
      "Upload your photo and select at least one piece.",
    );

    await user.click(screen.getByRole("button", { name: /Select Regular Fit Denim Shirt/i }));
    await user.click(screen.getByRole("button", { name: /Select Washed Straight Fit Jeans/i }));
    expect(within(specificSection).getByText("Upload your photo to continue.")).toBeInTheDocument();
    await user.upload(
      screen.getByLabelText("Add your photo for selected-piece looks"),
      new File(["shopper"], "shopper.jpg", { type: "image/jpeg" }),
    );
    await user.click(within(specificSection).getByRole("button", { name: /Create this look on me/i }));

    const result = await within(specificSection).findByAltText(/Your selected look rendered/i);
    expect(result).toBeInTheDocument();
    expect(within(specificSection).getAllByAltText(/rendered on your uploaded photo/i)).toHaveLength(1);
    expect(tryOnRequests).toHaveLength(1);
    expect(JSON.parse(String(tryOnRequests[0].get("itemIds")))).toEqual([
      "denim-shirt",
      "straight-jeans",
    ]);
    expect(String(tryOnRequests[0].get("prompt"))).toContain(
      "Do not add any unselected garment, layer, overshirt, jacket, footwear, or accessory.",
    );
    expect(String(tryOnRequests[0].get("prompt"))).toContain(
      "If a category was not selected, leave that part of the shopper's original photo unchanged.",
    );
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
    await user.click(screen.getByRole("button", { name: /Create looks on me/i }));

    expect(screen.getByRole("button", { name: /Checking photo and styling/i })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(/composing your looks/i);
    expect(screen.getByRole("status")).toHaveTextContent(/Results take 30–60 seconds/i);
    expect(screen.getByRole("status")).toHaveTextContent(/Keep this page open/i);
  });

  it("sets the same wait-time expectation for selected-piece rendering", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => undefined)));
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    await user.click(screen.getByRole("button", { name: /Select Regular Fit Denim Shirt/i }));
    await user.upload(
      screen.getByLabelText("Add your photo for selected-piece looks"),
      new File(["shopper"], "shopper.jpg", { type: "image/jpeg" }),
    );
    const specificSection = screen.getByRole("heading", { name: /Want to try specific pieces together/i })
      .closest("section") as HTMLElement;
    await user.click(within(specificSection).getByRole("button", { name: /Create this look on me/i }));

    expect(within(specificSection).getByRole("status"))
      .toHaveTextContent(/Results take 30–60 seconds/i);
    expect(within(specificSection).getByRole("status"))
      .toHaveTextContent(/applying only the pieces you selected/i);
  });

  it("carries the styling brief and selected-look execution into image generation", async () => {
    const tryOnPrompts: string[] = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/outfits")) {
        return Response.json({
          photo_assessment: {
            status: "passed",
            suitable_for_try_on: true,
            framing: "full_body",
            pose: "front_facing",
            issues: [],
            guidance: null,
          },
          outfits: [{
            name: "Relaxed gallery look",
            items: [
              { item_id: "denim-shirt", name: "Regular Fit Denim Shirt", category: "shirts", role: "base_top" },
              { item_id: "straight-jeans", name: "Washed Straight Fit Jeans", category: "jeans", role: "bottom" },
            ],
            rationale: "For variety, a French tuck could also work for a different occasion.",
            render_instructions: (
              "Keep the shirt fully untucked over the jeans, with the complete visible lower " +
              "hem outside the waistband and no full, French, half, or side tuck."
            ),
            confidence: 0.94,
          }],
        });
      }
      if (url.endsWith("/tryon")) {
        const form = init?.body as FormData;
        tryOnPrompts.push(String(form.get("prompt")));
        return Response.json({ job_id: "job-1", status: "queued" }, { status: 202 });
      }
      if (url.endsWith("/tryon/job-1")) {
        return Response.json({
          status: "completed",
          result: {
            output_image_base64: "generated-image",
            mime_type: "image/png",
            quality_threshold_met: true,
          },
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    await user.type(
      screen.getByRole("textbox", { name: /Where are you going/i }),
      "Gallery date; wear the shirt untucked",
    );
    await user.upload(
      screen.getByLabelText(/Add your full-body photo/i),
      new File(["shopper"], "shopper.jpg", { type: "image/jpeg" }),
    );
    await user.click(screen.getByRole("button", { name: /Create looks on me/i }));

    await waitFor(() => expect(tryOnPrompts).toHaveLength(1));
    expect(tryOnPrompts[0]).toContain(
      "AUTHORITATIVE SHOPPER REQUEST (highest priority): " +
      "Gallery date; wear the shirt untucked",
    );
    expect(tryOnPrompts[0]).toContain(
      "STATIC SINGLE-FRAME RENDER PLAN (lower priority; ignore any conflict with the shopper): " +
      "Keep the shirt fully untucked over the jeans, with the complete visible lower hem " +
      "outside the waistband and no full, French, half, or side tuck.",
    );
    expect(tryOnPrompts[0]).not.toContain("a French tuck could also work");
    expect(tryOnPrompts[0].indexOf("AUTHORITATIVE SHOPPER REQUEST")).toBeLessThan(
      tryOnPrompts[0].indexOf("STATIC SINGLE-FRAME RENDER PLAN"),
    );
    expect(await screen.findByAltText(/Relaxed gallery look rendered/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buy Regular Fit Denim Shirt" })).toHaveAttribute(
      "href",
      "https://www.snitch.co.in/products/denim-shirt",
    );
    expect(screen.getByRole("link", { name: "Buy Washed Straight Fit Jeans" })).toHaveAttribute(
      "href",
      "https://www.snitch.co.in/products/straight-jeans",
    );
    expect(screen.getByText("Why this works")).toBeInTheDocument();
    expect(screen.getByText("For variety, a French tuck could also work for a different occasion."))
      .toBeInTheDocument();
  });

  it("keeps internal quality-gate language out of a withheld preview", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/outfits")) {
        return Response.json({
          photo_assessment: {
            status: "passed",
            suitable_for_try_on: true,
            framing: "full_body",
            pose: "front_facing",
            issues: [],
            guidance: null,
          },
          outfits: [{
            name: "Strict untucked look",
            items: [
              { item_id: "denim-shirt", name: "Regular Fit Denim Shirt", category: "shirts", role: "base_top" },
              { item_id: "straight-jeans", name: "Washed Straight Fit Jeans", category: "jeans", role: "bottom" },
            ],
            rationale: "Keep the shirt fully untucked over the jeans.",
            render_instructions: "Keep the shirt fully untucked over the jeans.",
            confidence: 0.94,
          }],
        });
      }
      if (url.endsWith("/tryon")) {
        return Response.json({ job_id: "failed-gate-job", status: "queued" }, { status: 202 });
      }
      if (url.endsWith("/tryon/failed-gate-job")) {
        return Response.json({
          status: "completed",
          result: {
            output_image_base64: "must-not-be-displayed",
            mime_type: "image/png",
            quality_threshold_met: false,
          },
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    await user.type(
      screen.getByRole("textbox", { name: /Where are you going/i }),
      "Wear the denim shirt fully untucked",
    );
    await user.upload(
      screen.getByLabelText(/Add your full-body photo/i),
      new File(["shopper"], "shopper.jpg", { type: "image/jpeg" }),
    );
    await user.click(screen.getByRole("button", { name: /Create looks on me/i }));

    expect(await screen.findByText(/We couldn’t finish a clean preview this time/i)).toBeInTheDocument();
    expect(screen.queryByText(/visual quality gate/i)).not.toBeInTheDocument();
    expect(screen.queryByAltText(/Strict untucked look rendered/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Try this look again/i })).toBeInTheDocument();
  });

  it("keeps one garment per wear role while allowing a top and bottom", async () => {
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    const denimShirt = screen.getByRole("button", { name: /Regular Fit Denim Shirt/i });
    const greyShirt = screen.getByRole("button", { name: /Quads Line Grey Shirt/i });
    const jeans = screen.getByRole("button", { name: /Washed Straight Fit Jeans/i });

    await user.click(denimShirt);
    expect(denimShirt).toHaveAttribute("aria-pressed", "true");

    await user.click(greyShirt);
    expect(denimShirt).toHaveAttribute("aria-pressed", "false");
    expect(greyShirt).toHaveAttribute("aria-pressed", "true");

    await user.click(jeans);
    expect(greyShirt).toHaveAttribute("aria-pressed", "true");
    expect(jeans).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText(/Quads Line Grey Shirt \+ Washed Straight Fit Jeans/i)).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Build this look/i })).toHaveAttribute(
      "href",
      "#selected-piece-builder",
    );
    expect(screen.getAllByText("Remove")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: /Clear selection \(2\)/i }));
    expect(greyShirt).toHaveAttribute("aria-pressed", "false");
    expect(jeans).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("link", { name: /Build this look/i })).not.toBeInTheDocument();
  });

  it("replaces separates with a full-body garment and restores separates cleanly", async () => {
    const user = userEvent.setup();
    render(<StoreDemo brandId="88c64009be" catalog={snitchSample} />);

    const shirt = screen.getByRole("button", { name: /Regular Fit Denim Shirt/i });
    const jeans = screen.getByRole("button", { name: /Washed Straight Fit Jeans/i });
    const jumpsuit = screen.getByRole("button", { name: /Utility Jumpsuit/i });

    await user.click(shirt);
    await user.click(jeans);
    expect(shirt).toHaveAttribute("aria-pressed", "true");
    expect(jeans).toHaveAttribute("aria-pressed", "true");

    await user.click(jumpsuit);
    expect(shirt).toHaveAttribute("aria-pressed", "false");
    expect(jeans).toHaveAttribute("aria-pressed", "false");
    expect(jumpsuit).toHaveAttribute("aria-pressed", "true");

    await user.click(shirt);
    expect(jumpsuit).toHaveAttribute("aria-pressed", "false");
    expect(shirt).toHaveAttribute("aria-pressed", "true");
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
