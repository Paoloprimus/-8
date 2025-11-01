"use client";

export default function MinimalHUD({
  elapsedS, distanceM, deltaLastSec, deltaPlanSec
}: { elapsedS: number; distanceM: number; deltaLastSec: number | null; deltaPlanSec: number | null }) {
  return (
    <div className="card mt2">
      <div className="huge mono">{formatDuration(elapsedS)}</div>
      <div className="big mono gray">{(distanceM/1000).toFixed(2)} km</div>

      <div className="row mt">
        <div className="big mono">Ultimo:&nbsp;
          <span className={classBy(deltaLastSec)}>
            {deltaLastSec == null ? "–" : signed(deltaLastSec)}
          </span>
        </div>
      </div>

      <div className="row mt">
        <div className="big mono">Piano:&nbsp;
          <span className={classBy(deltaPlanSec)}>
            {deltaPlanSec == null ? "–" : signed(deltaPlanSec)}
          </span>
        </div>
      </div>
    </div>
  );
}

function signed(s: number) {
  const v = Math.round(s);
  return (v > 0 ? "+" : "") + v + "s";
}
function classBy(v: number | null) {
  if (v == null) return "gray";
  return v < 0 ? "green" : v > 0 ? "red" : "gray";
}
function formatDuration(sec: number) {
  const m = Math.floor(sec/60), s = sec%60;
  return `${m}:${String(s).padStart(2,"0")}`;
}
