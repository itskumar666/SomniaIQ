import type { Metadata } from "next";
import "./globals.css";
import { ThirdwebProvider } from "@/components/ThirdwebProvider";

export const metadata: Metadata = {
  title: "DeFi Decision Maker",
  description: "AI-driven DeFi agent for optimal portfolio management on Somnia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThirdwebProvider>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}