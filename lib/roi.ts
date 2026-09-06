/** ROI model for the fashion-commerce calculator.
 *
 *  Pure functions, no React — the arithmetic is the part that has to be right, so it lives
 *  apart from the UI and is unit-tested in tests/roi.test.ts.
 *
 *  Two modelling decisions worth stating plainly, because both are easy to get wrong:
 *
 *  1. **Conversion and AOV lifts are RELATIVE** (a 0.05 conversion lift means 5% more
 *     orders, not +5 percentage points of conversion rate).
 *  2. **The return-rate improvement is ABSOLUTE, in percentage points.** A 25% return rate
 *     improving by 2pp becomes 23% — NOT 25% × (1 − 0.02) = 24.5%. Conflating the two is
 *     the single most common error in this class of model.
 *
 *  Every output is an estimate built from editable scenario assumptions. Nothing here
 *  predicts STYLD's own performance; see EVIDENCE in lib/evidence.ts for what the
 *  assumptions are anchored to.
 */

export interface RoiInputs {
  /** R — monthly online revenue / GMV, in currency units. */
  monthlyRevenue: number;
  /** A — baseline average order value. */
  aov: number;
  /** RR — baseline return rate, 0–1. */
  returnRate: number;
  /** E — share of revenue/traffic eligible for (exposed to) STYLD, 0–1. */
  eligibleShare: number;
  /** GM — gross margin, 0–1. Optional; unlocks contribution figures. */
  grossMargin?: number | null;
  /** HC — average cost of handling one return, in currency units. Optional. */
  returnHandlingCost?: number | null;
  /** F — STYLD monthly fee. Optional; only when genuinely configured, since an ROI
   *  multiple without a real price is a manufactured number. */
  monthlyFee?: number | null;
}

export interface RoiScenario {
  id: "conservative" | "expected" | "strong";
  name: string;
  /** CL — relative conversion lift (0.035 = +3.5% more orders). */
  conversionLift: number;
  /** AL — relative AOV lift on eligible traffic. */
  aovLift: number;
  /** RP — return-rate reduction in percentage POINTS, as a decimal (0.02 = 2pp). */
  returnRateReductionPp: number;
  rationale: string;
}

/** Scenario assumptions informed by published retail benchmarks — deliberately more
 *  conservative than the headline case studies they're anchored to:
 *  - The 3.5–7.06% relative conversion band comes from the controlled DIDI/Garcia VTO tests.
 *  - +39% AOV exists in the Rhone influenced-order case study, so planning at +5/10/20% is
 *    intentionally well below it.
 *  - Return improvements stay small because return methodologies vary materially. */
export const SCENARIOS: RoiScenario[] = [
  {
    id: "conservative",
    name: "Conservative",
    conversionLift: 0.035,
    aovLift: 0.05,
    returnRateReductionPp: 0.01,
    rationale:
      "Anchored to the low end of the published controlled VTO tests (DIDI, +3.5% conversion).",
  },
  {
    id: "expected",
    name: "Expected",
    conversionLift: 0.05,
    aovLift: 0.1,
    returnRateReductionPp: 0.02,
    rationale:
      "Mid-band between the controlled VTO tests, with AOV well below the Rhone influenced-order result.",
  },
  {
    id: "strong",
    name: "Strong",
    conversionLift: 0.07,
    aovLift: 0.2,
    returnRateReductionPp: 0.03,
    rationale:
      "Near the top of the published controlled VTO band (Garcia, +7.06% conversion).",
  },
];

export const DEFAULT_SCENARIO_ID: RoiScenario["id"] = "expected";

/** Defaults chosen to be legible to an Indian D2C / retail buyer. Labelled in the UI as
 *  illustrative assumptions, not benchmarks for the visitor's own store. */
export const DEFAULT_INPUTS: RoiInputs = {
  monthlyRevenue: 10_000_000,
  aov: 2_500,
  returnRate: 0.25,
  eligibleShare: 0.25,
  grossMargin: null,
  returnHandlingCost: null,
  monthlyFee: null,
};

export interface RoiResults {
  /** Revenue shipped back every month at the current return rate, across all revenue —
   *  this is the problem as it stands today, not an eligible-slice figure. */
  currentReturnedRevenueMonthly: number;
  currentReturnedRevenueAnnual: number;
  baselineEligibleGmv: number;
  baselineOrders: number;
  newOrders: number;
  newAov: number;
  newEligibleGmv: number;
  incrementalGrossGmv: number;
  /** Percentage change in eligible GMV, as a percentage number (e.g. 15.5 for +15.5%). */
  eligibleGmvLiftPct: number;
  newReturnRate: number;
  baselineRetainedRevenue: number;
  newRetainedRevenue: number;
  /** The headline executive figure. */
  incrementalRetainedRevenue: number;
  annualIncrementalRetainedRevenue: number;
  /** Orders that would have been returned at the baseline rate but aren't at the new rate. */
  avoidedReturns: number;
  /** Null unless a return-handling cost was supplied. */
  monthlyReturnHandlingSavings: number | null;
  /** Null unless a gross margin was supplied. */
  incrementalContributionBeforeFee: number | null;
  /** Null unless both margin and fee were supplied. */
  netMonthlyValue: number | null;
  annualIncrementalValue: number | null;
  /** Null unless a real fee is configured — never manufactured. */
  roiMultiple: number | null;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function calculateRoi(inputs: RoiInputs, scenario: RoiScenario): RoiResults {
  const revenue = Math.max(0, safeNumber(inputs.monthlyRevenue));
  const aov = Math.max(0, safeNumber(inputs.aov));
  const returnRate = clamp01(inputs.returnRate);
  const eligibleShare = clamp01(inputs.eligibleShare);

  const conversionLift = Math.max(0, safeNumber(scenario.conversionLift));
  const aovLift = Math.max(0, safeNumber(scenario.aovLift));
  const returnReductionPp = clamp01(scenario.returnRateReductionPp);

  const baselineEligibleGmv = revenue * eligibleShare;
  // Guard the divide: an AOV of 0 means order counts are undefined, not infinite.
  const baselineOrders = aov > 0 ? baselineEligibleGmv / aov : 0;

  const newOrders = baselineOrders * (1 + conversionLift);
  const newAov = aov * (1 + aovLift);
  const newEligibleGmv = newOrders * newAov;
  const incrementalGrossGmv = newEligibleGmv - baselineEligibleGmv;
  const eligibleGmvLiftPct =
    baselineEligibleGmv > 0 ? (incrementalGrossGmv / baselineEligibleGmv) * 100 : 0;

  // Absolute percentage-point reduction, floored at zero.
  const newReturnRate = Math.max(0, returnRate - returnReductionPp);

  const baselineRetainedRevenue = baselineEligibleGmv * (1 - returnRate);
  const newRetainedRevenue = newEligibleGmv * (1 - newReturnRate);
  const incrementalRetainedRevenue = newRetainedRevenue - baselineRetainedRevenue;

  // Isolates the operational saving from the lower rate, on the new order volume.
  const avoidedReturns = newOrders * (returnRate - newReturnRate);

  const handlingCost =
    inputs.returnHandlingCost != null && Number.isFinite(inputs.returnHandlingCost)
      ? Math.max(0, inputs.returnHandlingCost)
      : null;
  const monthlyReturnHandlingSavings =
    handlingCost != null ? avoidedReturns * handlingCost : null;

  const grossMargin =
    inputs.grossMargin != null && Number.isFinite(inputs.grossMargin)
      ? clamp01(inputs.grossMargin)
      : null;

  const incrementalContributionBeforeFee =
    grossMargin != null
      ? incrementalRetainedRevenue * grossMargin + (monthlyReturnHandlingSavings ?? 0)
      : null;

  const fee =
    inputs.monthlyFee != null && Number.isFinite(inputs.monthlyFee) && inputs.monthlyFee > 0
      ? inputs.monthlyFee
      : null;

  const netMonthlyValue =
    incrementalContributionBeforeFee != null && fee != null
      ? incrementalContributionBeforeFee - fee
      : null;

  const annualIncrementalValue =
    incrementalContributionBeforeFee != null ? incrementalContributionBeforeFee * 12 : null;

  const roiMultiple =
    annualIncrementalValue != null && fee != null && fee > 0
      ? annualIncrementalValue / (fee * 12)
      : null;

  return {
    currentReturnedRevenueMonthly: revenue * returnRate,
    currentReturnedRevenueAnnual: revenue * returnRate * 12,
    baselineEligibleGmv,
    baselineOrders,
    newOrders,
    newAov,
    newEligibleGmv,
    incrementalGrossGmv,
    eligibleGmvLiftPct,
    newReturnRate,
    baselineRetainedRevenue,
    newRetainedRevenue,
    incrementalRetainedRevenue,
    annualIncrementalRetainedRevenue: incrementalRetainedRevenue * 12,
    avoidedReturns,
    monthlyReturnHandlingSavings,
    incrementalContributionBeforeFee,
    netMonthlyValue,
    annualIncrementalValue,
    roiMultiple,
  };
}

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Full precision, Indian digit grouping: ₹1,00,00,000. */
export function formatInr(value: number): string {
  return INR.format(Math.round(safeNumber(value)));
}

/** Lakh/crore shorthand for headline figures, which is how an Indian buyer reads these
 *  numbers — ₹3.48 L rather than ₹3,48,375. */
export function formatInrCompact(value: number): string {
  const n = safeNumber(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(2)} Cr`;
  if (abs >= 100_000) return `${sign}₹${(abs / 100_000).toFixed(2)} L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  return `${sign}₹${Math.round(abs)}`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${safeNumber(value) >= 0 ? "+" : "−"}${Math.abs(safeNumber(value)).toFixed(digits)}%`;
}

/** For analytics: bucket commercially sensitive figures instead of sending raw values. */
export function revenueBand(monthlyRevenue: number): string {
  const r = safeNumber(monthlyRevenue);
  if (r < 1_000_000) return "<10L";
  if (r < 5_000_000) return "10L-50L";
  if (r < 10_000_000) return "50L-1Cr";
  if (r < 50_000_000) return "1Cr-5Cr";
  return ">5Cr";
}
