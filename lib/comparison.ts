export function parseModelSelection(
  search: string,
  validModelIds: readonly string[],
  defaultModelIds: readonly string[],
  maxSelected = 4,
): string[] {
  const params = new URLSearchParams(search);
  if (!params.has("models")) return [...defaultModelIds].slice(0, maxSelected);
  const valid = new Set(validModelIds);
  return [...new Set((params.get("models") ?? "").split(",").filter((id) => valid.has(id)))].slice(0, maxSelected);
}

export function estimateMonthlyCost(
  inputTokens: number,
  outputTokens: number,
  inputPricePerMillion: number,
  outputPricePerMillion: number,
): number {
  return (inputTokens / 1_000_000) * inputPricePerMillion
    + (outputTokens / 1_000_000) * outputPricePerMillion;
}
