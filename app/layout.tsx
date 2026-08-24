import type { Metadata } from "next";
import "./fonts.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "Veyra for Retail — Try-on and styling AI, licensed",
  description:
    "Garment analysis, virtual try-on, reusable avatars, and outfit ranking, licensed as an API you drop into your own storefront. Built for a pilot, not a year of procurement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
