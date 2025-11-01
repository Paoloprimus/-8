"use client";

export default function BigButton({
  label, onClick, color = "green"
}: { label: string; onClick?: () => void; color?: "green"|"red"|"gray" }) {
  const bg = color === "green" ? "#22c55e" : color === "red" ? "#ef4444" : "#374151";
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: "18px 20px", borderRadius: 14,
        background: bg, color: "#000", fontWeight: 800, fontSize: 20, border: "none"
      }}
    >
      {label}
    </button>
  );
}
