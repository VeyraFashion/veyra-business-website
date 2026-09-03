import { describe, expect, it } from "vitest";
import {
  DEFAULT_INPUTS,
  SCENARIOS,
  calculateRoi,
  formatInrCompact,
  type RoiScenario,
} from "@/lib/roi";

const expected = SCENARIOS.find((s) => s.id === "expected") as RoiScenario;
const conservative = SCENARIOS.find((s) => s.id === "conservative") as RoiScenario;

describe("ROI model", () => {
  it("reproduces the documented worked example end to end", () => {
    // ₹1Cr revenue, ₹2,500 AOV, 25% returns, 25% eligible, Expected scenario
    // (+5% conversion, +10% AOV, −2pp returns).
    const r = calculateRoi(DEFAULT_INPUTS, expected);

    expect(r.baselineEligibleGmv).toBe(2_500_000);
    expect(r.baselineOrders).toBe(1_000);
    expect(r.newOrders).toBeCloseTo(1_050, 6);
    expect(r.newAov).toBeCloseTo(2_750, 6);
    expect(r.newEligibleGmv).toBeCloseTo(2_887_500, 4);
    expect(r.incrementalGrossGmv).toBeCloseTo(387_500, 4);

    expect(r.baselineRetainedRevenue).toBeCloseTo(1_875_000, 4);
    expect(r.newRetainedRevenue).toBeCloseTo(2_223_375, 4);
    expect(r.incrementalRetainedRevenue).toBeCloseTo(348_375, 4);
    expect(r.annualIncrementalRetainedRevenue).toBeCloseTo(4_180_500, 3);
  });

  it("treats the return-rate improvement as percentage points, not a relative change", () => {
    // The classic error: 25% × (1 − 0.02) = 24.5%. Correct is 25% − 2pp = 23%.
    const r = calculateRoi(DEFAULT_INPUTS, expected);
    expect(r.newReturnRate).toBeCloseTo(0.23, 10);
    expect(r.newReturnRate).not.toBeCloseTo(0.245, 4);
  });

  it("treats conversion and AOV lifts as relative, not percentage points", () => {
    const r = calculateRoi(DEFAULT_INPUTS, expected);
    // 1,000 baseline orders at +5% relative = 1,050, not 1,000 + 5 = 1,005.
    expect(r.newOrders).toBeCloseTo(1_000 * 1.05, 6);
    expect(r.newAov).toBeCloseTo(2_500 * 1.1, 6);
  });

  it("floors the new return rate at zero rather than going negative", () => {
    const r = calculateRoi(
      { ...DEFAULT_INPUTS, returnRate: 0.01 },
      { ...expected, returnRateReductionPp: 0.05 },
    );
    expect(r.newReturnRate).toBe(0);
    expect(r.avoidedReturns).toBeGreaterThan(0);
  });

  it("scales monotonically across the three published scenarios", () => {
    const c = calculateRoi(DEFAULT_INPUTS, conservative).incrementalRetainedRevenue;
    const e = calculateRoi(DEFAULT_INPUTS, expected).incrementalRetainedRevenue;
    const s = calculateRoi(
      DEFAULT_INPUTS,
      SCENARIOS.find((x) => x.id === "strong") as RoiScenario,
    ).incrementalRetainedRevenue;
    expect(c).toBeLessThan(e);
    expect(e).toBeLessThan(s);
  });

  it("withholds contribution, net value and ROI multiple until their inputs are supplied", () => {
    const bare = calculateRoi(DEFAULT_INPUTS, expected);
    expect(bare.monthlyReturnHandlingSavings).toBeNull();
    expect(bare.incrementalContributionBeforeFee).toBeNull();
    expect(bare.netMonthlyValue).toBeNull();
    expect(bare.roiMultiple).toBeNull();

    // A fee alone must NOT manufacture an ROI multiple without a margin to value against.
    const feeOnly = calculateRoi({ ...DEFAULT_INPUTS, monthlyFee: 50_000 }, expected);
    expect(feeOnly.roiMultiple).toBeNull();
    expect(feeOnly.netMonthlyValue).toBeNull();
  });

  it("computes contribution and ROI once margin, handling cost and fee are all known", () => {
    const r = calculateRoi(
      {
        ...DEFAULT_INPUTS,
        grossMargin: 0.55,
        returnHandlingCost: 250,
        monthlyFee: 50_000,
      },
      expected,
    );

    // avoidedReturns = newOrders × (RR − newRR) = 1,050 × 0.02 = 21
    expect(r.avoidedReturns).toBeCloseTo(21, 6);
    expect(r.monthlyReturnHandlingSavings).toBeCloseTo(21 * 250, 4);

    const contribution = 348_375 * 0.55 + 5_250;
    expect(r.incrementalContributionBeforeFee).toBeCloseTo(contribution, 3);
    expect(r.netMonthlyValue).toBeCloseTo(contribution - 50_000, 3);
    expect(r.annualIncrementalValue).toBeCloseTo(contribution * 12, 2);
    expect(r.roiMultiple).toBeCloseTo((contribution * 12) / (50_000 * 12), 6);
  });

  it("survives degenerate inputs without producing Infinity or NaN", () => {
    const zeroAov = calculateRoi({ ...DEFAULT_INPUTS, aov: 0 }, expected);
    expect(Number.isFinite(zeroAov.incrementalRetainedRevenue)).toBe(true);
    expect(zeroAov.baselineOrders).toBe(0);

    const empty = calculateRoi(
      { monthlyRevenue: 0, aov: 0, returnRate: 0, eligibleShare: 0 },
      expected,
    );
    expect(empty.incrementalRetainedRevenue).toBe(0);
    expect(empty.eligibleGmvLiftPct).toBe(0);

    const nonsense = calculateRoi(
      { monthlyRevenue: Number.NaN, aov: Number.NaN, returnRate: 5, eligibleShare: -3 },
      expected,
    );
    expect(Number.isFinite(nonsense.incrementalRetainedRevenue)).toBe(true);
  });

  it("formats headline figures in lakh/crore shorthand", () => {
    expect(formatInrCompact(348_375)).toBe("₹3.48 L");
    expect(formatInrCompact(4_180_500)).toBe("₹41.80 L");
    expect(formatInrCompact(12_500_000)).toBe("₹1.25 Cr");
    expect(formatInrCompact(0)).toBe("₹0");
  });
});
