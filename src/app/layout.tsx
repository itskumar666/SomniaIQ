import type { Metadata } from "next";
import "./globals.css";
import { ThirdwebProvider } from "@/components/ThirdwebProvider";

export const metadata: Metadata = {
  title: "SomniaIQ - AI DeFi Portfolio Manager",
  description: "AI-powered DeFi portfolio manager on Somnia blockchain with intelligent market analysis and automated rebalancing",
  keywords: "DeFi, AI, Somnia, Portfolio Management, Blockchain, Cryptocurrency",
  authors: [{ name: "SomniaIQ Team" }],
  openGraph: {
    title: "SomniaIQ - AI DeFi Portfolio Manager",
    description: "Intelligent DeFi portfolio management powered by AI on Somnia blockchain",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased dark:bg-gray-900 dark:text-white">
        <ThirdwebProvider>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}