import type { Metadata } from "next";
import "./fonts.css";
import "./tailwind.css";
import "./theme.css";
import "./home.css";
import SmoothScroll from "@/components/SmoothScroll";
import CardSpotlight from "@/components/CardSpotlight";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Veyra for Business",
  title: "Veyra for Business",
  description:
    "Give fashion shoppers a high-fidelity way to see themselves in products, build complete looks, and buy with more confidence — inside the storefront you already run.",
  openGraph: {
    title: "Veyra for Business — Make ‘Will this suit me?’ answerable",
    description:
      "Virtual try-on, outfit intelligence, and catalog-ready imagery for fashion retailers.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veyra for Business — Make ‘Will this suit me?’ answerable",
    description:
      "Virtual try-on, outfit intelligence, and catalog-ready imagery for fashion retailers.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll />
        <CardSpotlight />
        {children}
      </body>
    </html>
  );
}
