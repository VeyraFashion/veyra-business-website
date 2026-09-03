"use client";

import { formatInrCompact } from "@/lib/roi";
import { useStoreInputs } from "@/components/home/StoreInputs";

/** The problem, in the visitor's own numbers.
 *
 *  Reads the shared store inputs, so it reflects whatever the calculator further down the
 *  page is set to. Deliberately arithmetic on the visitor's figures and labelled as such —
 *  it is not a claim about what STYLD recovers. */
export default function CostOfUncertainty() {
  const { revenue, returnPct, results } = useStoreInputs();

  return (
    <div className="cost-card">
      <div className="cost-row">
        <span>Monthly online revenue</span>
        <strong>{formatInrCompact(revenue)}</strong>
      </div>
      <div className="cost-row">
        <span>Your return rate</span>
        <strong>{returnPct.toFixed(1).replace(/\.0$/, "")}%</strong>
      </div>
      <div className="cost-row cost-row-headline">
        <span>Shipped back every month</span>
        <strong>{formatInrCompact(results.currentReturnedRevenueMonthly)}</strong>
      </div>
      <div className="cost-row cost-row-last">
        <span>Over a year</span>
        <strong>{formatInrCompact(results.currentReturnedRevenueAnnual)}</strong>
      </div>
    </div>
  );
}
