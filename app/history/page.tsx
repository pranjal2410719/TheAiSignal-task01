"use client";

import { ModelComparison } from "@/components/model-comparison";

export default function HistoryPage() {
  return <ModelComparison basePath="/history" initialLaunched={true} initialView="history" />;
}
