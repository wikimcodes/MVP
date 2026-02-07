import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payma - Healthcare Financing",
  description: "UAE Healthcare Financing Pre-Eligibility Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
