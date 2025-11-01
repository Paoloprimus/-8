import { Plan } from "./types";
import { computePlan } from "./plan";

const K_BASELINE = "baseline_v1";       // { baselineDurationS, splits200m[] }
const K_PLAN     = "plan_v1";           // Plan
const K_LAST     = "last_run_cache_v1"; // { lastRunDurationS, lastRunSplits200m }

function jget<T>(k: string): T | null {
  const v = localStorage.getItem(k);
  return v ? JSON.parse(v) as T : null;
}
function jset(k: string, v: any) {
  localStorage.setItem(k, JSON.stringify(v));
}

/** Prima corsa: salva come baseline. */
export async function saveNewRunAsBaseline(run: { durationS: number; distanceM: number; splits200m: number[] }) {
  jset(K_BASELINE, { baselineDurationS: run.durationS, splits200m: run.splits200m });
  // cache "last run" = baseline per iniziare
  jset(K_LAST, { lastRunDurationS: run.durationS, lastRunSplits200m: run.splits200m });
}

/** Carica baseline (durata + splits). */
export async function loadBaseline(): Promise<{ baselineDurationS: number; splits200m: number[] }|null> {
  return jget(K_BASELINE);
}

/** Wizard semplice: se non c'è plan, chiedi target e crealo. */
export async function startPlanWizardIfNeeded() {
  const plan = jget<Plan>(K_PLAN);
  const base = jget<{ baselineDurationS: number }>(K_BASELINE);
  if (plan || !base) return;

  const mmss = prompt("Tempo obiettivo (MM:SS)? Es. 28:00");
  if (!mmss) return;
  const [m, s] = mmss.split(":").map(n=>parseInt(n,10));
  const target = (m||0)*60 + (s||0);
  const p = computePlan(base.baselineDurationS, target, 15);
  jset(K_PLAN, p);
  alert(`Piano impostato: ${p.sessions} allenamenti, ~${p.perSessionDeltaS}s per volta.`);
}

/** Carica/Salva piano. */
export async function loadPlan(): Promise<Plan | null> { return jget(K_PLAN); }
export async function savePlan(p: Plan) { jset(K_PLAN, p); }

/** Cache dell'ultima corsa (per confronti veloci). */
export async function loadLastRunCache(): Promise<{ lastRunDurationS?: number; lastRunSplits200m?: number[] }> {
  return jget(K_LAST) || {};
}
export async function saveLastRunCache(v: { lastRunDurationS: number; lastRunSplits200m: number[] }) {
  jset(K_LAST, v);
}

/** A fine corsa: salva ultima corsa e aggiorna piano (progressivi). */
export async function saveCompletedRun(run: { durationS: number; distanceM: number; splits200m: number[] }) {
  jset(K_LAST, { lastRunDurationS: run.durationS, lastRunSplits200m: run.splits200m });
}

/** Incrementa sessione del piano e aggiorna miglioramento totale. */
export async function bumpPlanAfterRun(currentDurationS: number) {
  const p = jget<Plan>(K_PLAN);
  const base = jget<{ baselineDurationS: number }>(K_BASELINE);
  if (!p || !base) return;
  const improvement = base.baselineDurationS - currentDurationS; // negativo = peggio
  p.totalImprovementS = (p.totalImprovementS || 0) + improvement;
  p.currentSession = Math.min(p.sessions, p.currentSession + 1);
  jset(K_PLAN, p);
}
