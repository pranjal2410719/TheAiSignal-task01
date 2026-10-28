import { describe, expect, it } from "vitest";
import { estimateMonthlyCost, parseModelSelection } from "@/lib/comparison";

describe("parseModelSelection", () => {
  const validIds = ["alpha", "beta", "gamma", "delta", "epsilon"];
  const defaults = ["alpha", "beta"];

  it("uses defaults only when the models parameter is absent", () => {
    expect(parseModelSelection("", validIds, defaults)).toEqual(defaults);
  });

  it("keeps an explicitly empty selection empty", () => {
    expect(parseModelSelection("?models=", validIds, defaults)).toEqual([]);
  });

  it("ignores unknown IDs, removes duplicates, and caps selection size", () => {
    expect(parseModelSelection("?models=alpha,unknown,alpha,beta,gamma,delta", validIds, defaults, 3))
      .toEqual(["alpha", "beta", "gamma"]);
  });
});

describe("estimateMonthlyCost", () => {
  it("uses per-million input and output rates", () => {
    expect(estimateMonthlyCost(5_000_000, 1_000_000, 0.33, 1.32)).toBeCloseTo(2.97);
  });

  it("returns zero for zero token usage", () => {
    expect(estimateMonthlyCost(0, 0, 3, 15)).toBe(0);
  });
});
