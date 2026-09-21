export function speakEnglish(text: string) {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = "en-US"
  utter.rate = 0.92
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utter)
}
