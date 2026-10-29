"use client";

import { ModelComparison } from "@/components/model-comparison";

export default function PlaygroundPage() {
  return <ModelComparison basePath="/playground" initialLaunched={true} initialView="playground" />;
}
