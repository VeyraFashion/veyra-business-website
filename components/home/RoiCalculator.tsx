"use client";

import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SCENARIOS, formatInrCompact } from "@/lib/roi";
import { useStoreInputs } from "@/components/home/StoreInputs";

/** Slider row with the live value pinned to its right, matching the v2 design.
 *  A range input rather than a text field: it's faster to explore with, works on touch,
 *  and can't be left in a half-typed invalid state. */
function SliderRow({
  label,
  prefix,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  prefix?: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
}) {
  const id = useId();
  return (
    <div className="roi-field">
      <label className="roi-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="roi-field-row">
        {prefix && <span className="roi-field-affix" aria-hidden="true">{prefix}</span>}
        <input
          id={id}
          className="roi-slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="roi-field-value">{display}</span>
      </div>
    </div>
  );
}

export default function RoiCalculator({ bookHref = "#book" }: { bookHref?: string }) {
  const {
    revenue,
    aov,
    returnPct,
    eligiblePct,
    scenario,
    scenarioId,
    results,
    setRevenue,
    setAov,
    setReturnPct,
    setEligiblePct,
    setScenarioId,
  } = useStoreInputs();
  const [advOpen, setAdvOpen] = useState(false);
  const advPanelId = useId();

  return (
    <div className="roi-grid">
      <div className="roi-inputs">
        <h3 className="roi-panel-title">Your store</h3>

        <SliderRow
          label="Monthly online revenue"
          prefix="₹"
          value={revenue}
          display={formatInrCompact(revenue)}
          min={1_000_000}
          max={200_000_000}
          step={1_000_000}
          onChange={setRevenue}
        />
        <SliderRow
          label="Average order value"
          prefix="₹"
          value={aov}
          display={formatInrCompact(aov)}
          min={200}
          max={20_000}
          step={100}
          onChange={setAov}
        />
        <SliderRow
          label="Current return rate"
          value={returnPct}
          display={`${returnPct.toFixed(1).replace(/\.0$/, "")}%`}
          min={0}
          max={60}
          step={0.5}
          onChange={setReturnPct}
        />

        <button
          type="button"
          className="roi-disclosure"
          aria-expanded={advOpen}
          aria-controls={advPanelId}
          onClick={() => setAdvOpen((v) => !v)}
        >
          {advOpen ? "Hide eligible-share input" : "Adjust eligible share (optional)"}
        </button>

        {advOpen && (
          <div className="roi-advanced" id={advPanelId}>
            <SliderRow
              label="Share of revenue eligible for STYLD"
              value={eligiblePct}
              display={`${eligiblePct}%`}
              min={1}
              max={100}
              step={1}
              onChange={setEligiblePct}
            />
            <p className="roi-hint">The slice of traffic or catalogue the experience is live on.</p>
          </div>
        )}

        <div className="roi-scenario">
          <h3 className="roi-panel-title">Scenario</h3>
          <div className="roi-tabs" role="tablist" aria-label="Scenario">
            {SCENARIOS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={option.id === scenarioId}
                className={option.id === scenarioId ? "is-active" : undefined}
                onClick={() => setScenarioId(option.id)}
              >
                {option.name}
              </button>
            ))}
          </div>
          <p className="roi-rationale">{scenario.rationale}</p>
          <dl className="roi-assumptions">
            <div>
              <dt>Conversion lift</dt>
              <dd>+{(scenario.conversionLift * 100).toFixed(1)}% relative</dd>
            </div>
            <div>
              <dt>AOV lift on eligible traffic</dt>
              <dd>+{(scenario.aovLift * 100).toFixed(0)}%</dd>
            </div>
            <div>
              <dt>Return-rate improvement</dt>
              <dd>−{(scenario.returnRateReductionPp * 100).toFixed(1)} pp</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="roi-output" aria-live="polite">
        <div className="roi-headline">
          <span className="roi-headline-label">Currently shipped back every month</span>
          <strong>{formatInrCompact(results.currentReturnedRevenueMonthly)}</strong>
          <span className="roi-headline-note">
            Returned revenue at your current rate. This is the number STYLD is aimed at —
            before any conversion or basket effect.
          </span>
        </div>

        <div className="roi-cards">
          <div className="roi-card">
            <strong className="is-lime">{formatInrCompact(results.incrementalRetainedRevenue)}</strong>
            <span>Modelled incremental retained revenue / month</span>
          </div>
          <div className="roi-card">
            <strong>{formatInrCompact(results.annualIncrementalRetainedRevenue)}</strong>
            <span>Annual retained-revenue upside</span>
          </div>
          <div className="roi-card">
            <strong>+{results.eligibleGmvLiftPct.toFixed(1)}%</strong>
            <span>Eligible GMV lift</span>
          </div>
          <div className="roi-card">
            <strong>{Math.round(results.avoidedReturns).toLocaleString("en-IN")}</strong>
            <span>Fewer returns / month</span>
          </div>
        </div>

        <div className="roi-cta">
          <div>
            <strong>Want this measured instead of modelled?</strong>
            <p>A controlled pilot replaces every assumption here with your own numbers.</p>
          </div>
          <a className="roi-cta-button" href={bookHref}>
            Book a walkthrough <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>

        <p className="roi-disclaimer">
          Editable scenario assumptions informed by published retail evidence. Not a guarantee
          of STYLD performance.
        </p>
      </div>
    </div>
  );
}
