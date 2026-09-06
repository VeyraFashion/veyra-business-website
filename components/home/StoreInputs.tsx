"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_INPUTS,
  DEFAULT_SCENARIO_ID,
  SCENARIOS,
  calculateRoi,
  type RoiResults,
  type RoiScenario,
} from "@/lib/roi";

/** Shared store-economics state.
 *
 *  The "cost of uncertainty" card near the top of the page and the ROI calculator further
 *  down are the same model viewed twice: the first shows what returns cost today, the
 *  second what a scenario could recover. They sit in different sections, so the state is
 *  lifted to a provider rather than duplicated — a visitor who adjusts the sliders below
 *  sees the cost figure above update to match, and the two can never disagree. */

interface StoreInputsValue {
  revenue: number;
  aov: number;
  /** Return rate as a percentage number (25 = 25%), which is how the slider reads it. */
  returnPct: number;
  /** Eligible share as a percentage number. */
  eligiblePct: number;
  scenario: RoiScenario;
  scenarioId: RoiScenario["id"];
  results: RoiResults;
  setRevenue: (value: number) => void;
  setAov: (value: number) => void;
  setReturnPct: (value: number) => void;
  setEligiblePct: (value: number) => void;
  setScenarioId: (value: RoiScenario["id"]) => void;
}

const StoreInputsContext = createContext<StoreInputsValue | null>(null);

export function StoreInputsProvider({ children }: { children: ReactNode }) {
  const [revenue, setRevenue] = useState(DEFAULT_INPUTS.monthlyRevenue);
  const [aov, setAov] = useState(DEFAULT_INPUTS.aov);
  const [returnPct, setReturnPct] = useState(DEFAULT_INPUTS.returnRate * 100);
  const [eligiblePct, setEligiblePct] = useState(DEFAULT_INPUTS.eligibleShare * 100);
  const [scenarioId, setScenarioId] = useState<RoiScenario["id"]>(DEFAULT_SCENARIO_ID);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[1];

  const results = useMemo(
    () =>
      calculateRoi(
        {
          monthlyRevenue: revenue,
          aov,
          returnRate: returnPct / 100,
          eligibleShare: eligiblePct / 100,
        },
        scenario,
      ),
    [revenue, aov, returnPct, eligiblePct, scenario],
  );

  const value = useMemo(
    () => ({
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
    }),
    [revenue, aov, returnPct, eligiblePct, scenario, scenarioId, results],
  );

  return <StoreInputsContext.Provider value={value}>{children}</StoreInputsContext.Provider>;
}

export function useStoreInputs(): StoreInputsValue {
  const value = useContext(StoreInputsContext);
  if (!value) throw new Error("useStoreInputs must be used inside <StoreInputsProvider>");
  return value;
}
