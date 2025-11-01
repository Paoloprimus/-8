import { Plan } from "./types";

export function computePlan(baselineS: number, targetS: number, sessions = 15): Plan {
  const delta = baselineS - targetS; // s da togliere
  const per = Math.max(1, Math.round(delta / sessions)); // ~8s/allenamento
  return {
    routeId: "solo",
    baselineDurationS: baselineS,
    targetDurationS: targetS,
    sessions,
    perSessionDeltaS: per,
    currentSession: 1,
    totalImprovementS: 0
  };
}
