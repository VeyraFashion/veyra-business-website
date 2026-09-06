import type { Metadata } from "next";
import "./fonts.css";
import "./tailwind.css";
import "./theme.css";
import "./home.css";
import "./demo.css";
import SmoothScroll from "@/components/SmoothScroll";
import CardSpotlight from "@/components/CardSpotlight";
import DemoReturnChip from "@/components/DemoReturnChip";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

const DESCRIPTION =
  "STYLD adds virtual try-on and complete-look AI styling to fashion storefronts. Help shoppers buy with more confidence and measure impact across conversion, AOV and returns.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "STYLD",
  title: "STYLD — Virtual Try-On & AI Styling for Fashion E-commerce",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "STYLD — Virtual Try-On & AI Styling for Fashion E-commerce",
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STYLD — Virtual Try-On & AI Styling for Fashion E-commerce",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SmoothScroll />
        <CardSpotlight />
        <DemoReturnChip />
        {children}
      </body>
    </html>
  );
}
