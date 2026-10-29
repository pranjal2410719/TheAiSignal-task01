import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The AI Signal — AI Model Workspace",
  description: "Discover and compare AI models, estimate costs, and test prompts in the AI playground.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
