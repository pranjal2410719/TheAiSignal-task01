import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The AI Signal — AI Model Workspace & Benchmarks",
  description: "Discover and compare AI models, estimate costs, and test prompts in the AI playground. Developed by Pranjal Yadav.",
  authors: [{ name: "Pranjal Yadav", url: "https://github.com/pranjal2410719" }],
  creator: "Pranjal Yadav",
  publisher: "Pranjal Yadav",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
