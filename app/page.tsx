"use client";

import Link from "next/link";
import BigButton from "../components/BigButton";

export default function Home() {
  return (
    <main>
      <h1 className="huge">-8</h1>
      <h1 className="huge">ottodimeno</h1>
      <p className="center gray mt">UI ultra-minimale. GPS in primo piano. Salvataggi locali.</p>

      <div className="row mt2" style={{ flexDirection: "column", gap: 16 }}>
        <Link href="/route"><BigButton color="green" label="Solito percorso" /></Link>
        <Link href="/new"><BigButton color="gray" label="Nuovo percorso" /></Link>
      </div>

      <p className="footer">Suggerimento: usa HTTPS (Vercel) per sbloccare il GPS.</p>
    </main>
  );
}
