export function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "it-IT";
    u.rate = 1.0;
    u.pitch = 1.0;
    synth.cancel(); // evita coda lunga
    synth.speak(u);
  } catch {
    /* silenzioso */
  }
}
