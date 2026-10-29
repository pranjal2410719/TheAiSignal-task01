import { ModelComparison } from "@/components/model-comparison";

export default function HomePage() {
  return <ModelComparison basePath="/compare" initialLaunched={false} />;
}
