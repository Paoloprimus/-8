"use client";

import { useEffect, useRef, useState } from "react";
import BigButton from "@/components/BigButton";
import MinimalHUD from "@/components/MinimalHUD";
import { loadBaseline, loadPlan, loadLastRunCache, saveCompletedRun, bumpPlanAfterRun } from "@/lib/storage";
import { haversineMeters } from "@/lib/haversine";
import { speak } from "@/lib/tts";
import { Plan } from "@/lib/types";

/**
 * Confronta contro: ultima corsa e piano globale.
 * Mostra SOLO 2 numeri: ΔUltimo e ΔPiano (negativi = meglio).
 */
export default function RoutePage() {
  const [ready, setReady] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [baselineS, setBaselineS] = useState<number | null>(null);
  const [lastSplits, setLastSplits] = useState<number[] | undefined>(undefined);

  // stato corsa
  const [phase, setPhase] = useState<"idle"|"tracking">("idle");
  const [startTs, setStartTs] = useState<number | null>(null);
  const [elapsedS, setElapsedS] = useState(0);
  const [distanceM, setDistanceM] = useState(0);
  const [splits, setSplits] = useState<number[]>([]);
  const [deltaLast, setDeltaLast] = useState<number | null>(null);
  const [deltaPlan, setDeltaPlan] = useState<number | null>(null);

  const lastPoint = useRef<GeolocationPosition | null>(null);
  const nextSplitIdx = useRef(0);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      const base = await loadBaseline();
      const p = await loadPlan();
      const last = await loadLastRunCache();
      setBaselineS(base?.baselineDurationS ?? null);
      setPlan(p);
      setLastSplits(last.lastRunSplits200m);
      setReady(true);
    })();
  }, []);

  // timer tempo
  useEffect(() => {
    if (phase === "tracking" && startTs && tick.current === null) {
      tick.current = window.setInterval(() => {
        const nowS = Math.round((Date.now() - startTs) / 1000);
        setElapsedS(nowS);
        // aggiorna ΔPiano in tempo reale (stima sul tempo totale corrente)
        if (plan && baselineS != null) {
          const expectedGain = plan.perSessionDeltaS * (plan.currentSession - 1);
          const overBaseline = nowS - baselineS;
          setDeltaPlan(Math.round(overBaseline + expectedGain));
        }
      }, 1000) as unknown as number;
    }
    return () => { if (tick.current) { clearInterval(tick.current); tick.current = null; } };
  }, [phase, startTs, plan, baselineS]);

  async function start() {
    if (!ready) return;
    setPhase("tracking");
    setStartTs(Date.now());
    speak("Via. Confronto attivo.");
    if (!navigator.geolocation) { alert("Geolocalizzazione non supportata."); return; }

    navigator.geolocation.watchPosition(
      (pos) => {
        const prev = lastPoint.current;
        lastPoint.current = pos;
        if (!prev) return;

        const d = haversineMeters(
          { lat: prev.coords.latitude, lon: prev.coords.longitude },
          { lat: pos.coords.latitude,  lon: pos.coords.longitude }
        );
        if (d < 3) return;

        setDistanceM((curr) => {
          const next = curr + d;
          const idx = Math.floor(next / 200);
          if (idx > nextSplitIdx.current) {
            nextSplitIdx.current = idx;
            const splitT = Math.round((Date.now() - (startTs ?? Date.now())) / 1000);
            setSplits((s) => {
              const ns = [...s];
              ns[idx - 1] = splitT;
              return ns;
            });

            // ΔUltimo su split corrente
            if (lastSplits && lastSplits[idx - 1] != null) {
              const dLast = splitT - lastSplits[idx - 1];
              setDeltaLast(Math.round(dLast));
              speak(
                `Avanti di ${formatSigned(-dLast)} sull'ultima. ` +
                (deltaPlan != null ? `${formatSigned(-deltaPlan)} sul programma.` : "")
              );
            }
          }
          return next;
        });
      },
      (err) => { console.error(err); alert("Errore GPS: " + err.message); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
  }

  async function stop() {
    if (!startTs) return;
    const run = {
      durationS: elapsedS,
      distanceM: Math.round(distanceM),
      splits200m: splits
    };
    await saveCompletedRun(run);
    speak("Allenamento salvato.");
    if (plan) await bumpPlanAfterRun(elapsedS);
    window.location.href = "/";
  }

  if (!ready) return <p>Carico…</p>;

  return (
    <main>
      <h2 className="big">Solito percorso</h2>

      {phase === "idle" && (
        <>
          <p className="mt gray">Confronto con ultima corsa e piano attivo.</p>
          <div className="mt2"><BigButton color="green" label="Avvia" onClick={start} /></div>
        </>
      )}

      {phase === "tracking" && (
        <>
          <MinimalHUD
            elapsedS={elapsedS}
            distanceM={distanceM}
            deltaLastSec={deltaLast}
            deltaPlanSec={deltaPlan}
          />
          <div className="mt2"><BigButton color="red" label="Fine" onClick={stop} /></div>
        </>
      )}
    </main>
  );
}

function formatSigned(n: number) {
  const s = Math.abs(Math.round(n));
  return (n >= 0 ? `${s} secondi dietro` : `${s} secondi avanti`);
}
