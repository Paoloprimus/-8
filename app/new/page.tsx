"use client";

import { useEffect, useRef, useState } from "react";
import BigButton from "../../components/BigButton";
import MinimalHUD from "../../components/MinimalHUD";
import { saveNewRunAsBaseline, startPlanWizardIfNeeded } from "../../lib/storage";
import { haversineMeters } from "../../lib/haversine";
import { speak } from "../../lib/tts";

/**
 * Registra la PRIMA corsa su nuovo percorso.
 * Salva: durata, distanza e splits 200m come baseline.
 */
export default function NewRoutePage() {
  const [phase, setPhase] = useState<"idle"|"tracking">("idle");
  const [startTs, setStartTs] = useState<number | null>(null);
  const [elapsedS, setElapsedS] = useState(0);
  const [distanceM, setDistanceM] = useState(0);
  const [splits, setSplits] = useState<number[]>([]);
  const lastPoint = useRef<GeolocationPosition | null>(null);
  const nextSplitIdx = useRef(0);
  const tick = useRef<number | null>(null);

  // timer per aggiornare il tempo ogni secondo
  useEffect(() => {
    if (phase === "tracking" && startTs && tick.current === null) {
      tick.current = window.setInterval(() => {
        setElapsedS(Math.round((Date.now() - startTs) / 1000));
      }, 1000) as unknown as number;
    }
    return () => { if (tick.current) { clearInterval(tick.current); tick.current = null; } };
  }, [phase, startTs]);

  async function start() {
    setPhase("tracking");
    setStartTs(Date.now());
    speak("Tracciamento avviato.");
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
            setSplits((s) => {
              const nextS = [...s];
              nextS[idx - 1] = Math.round((Date.now() - (startTs ?? Date.now())) / 1000);
              return nextS;
            });
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
    const result = {
      durationS: elapsedS,
      distanceM: Math.round(distanceM),
      splits200m: splits
    };
    await saveNewRunAsBaseline(result);
    speak("Corsa salvata come riferimento. Imposta il tuo obiettivo.");
    await startPlanWizardIfNeeded();
    window.location.href = "/route";
  }

  return (
    <main>
      <h2 className="big">Nuovo percorso</h2>
      {phase === "idle" && (
        <>
          <p className="mt gray">GPS pronto. Premi Avvia quando inizi a correre.</p>
          <div className="mt2"><BigButton color="green" label="Avvia" onClick={start} /></div>
        </>
      )}
      {phase === "tracking" && (
        <>
          <MinimalHUD elapsedS={elapsedS} distanceM={distanceM} deltaLastSec={null} deltaPlanSec={null} />
          <div className="mt2"><BigButton color="red" label="Fine" onClick={stop} /></div>
        </>
      )}
    </main>
  );
}
