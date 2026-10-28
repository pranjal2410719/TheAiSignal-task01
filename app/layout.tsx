import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The AI Signal — Model Comparison",
  description: "Compare AI model capabilities, sample pricing, and estimated monthly API costs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
