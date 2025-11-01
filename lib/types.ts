export type Route = {
  id: string;
  name: string;
  distanceM: number;
  baselineRunId?: string;
};

export type Run = {
  id: string;
  routeId: string;
  timestamp: number;     // ms
  durationS?: number;    // on stop
  distanceM?: number;    // on stop
  splits200m: number[];  // cumulati (s)
};

export type Plan = {
  routeId: string;
  baselineDurationS: number;
  targetDurationS: number;
  sessions: number;          // 15
  perSessionDeltaS: number;  // es. 8
  currentSession: number;    // 1..sessions
  totalImprovementS: number; // cumulato finora
};
