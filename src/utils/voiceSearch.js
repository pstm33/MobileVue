const voiceLocaleMap = {
  ru: "ru-RU",
  tk: "tk-TM",
  en: "en-US",
};

export function getVoiceLocale(locale) {
  const normalized = String(locale || "en").toLowerCase().split(/[-_]/)[0];
  return voiceLocaleMap[normalized] || voiceLocaleMap.en;
}

export function isVoiceSearchSupported() {
  if (typeof window === "undefined") {
    return false;
  }
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function listenVoiceSearch({ locale = "en", onStart, onEnd } = {}) {
  return new Promise((resolve, reject) => {
    if (!isVoiceSearchSupported()) {
      reject(new Error("voice_not_supported"));
      return;
    }

    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = getVoiceLocale(locale);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      if (typeof onStart === "function") {
        onStart();
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (transcript) {
        resolve(transcript);
      } else {
        reject(new Error("voice_no_result"));
      }
    };

    recognition.onerror = (event) => {
      reject(new Error(event.error || "voice_error"));
    };

    recognition.onend = () => {
      if (typeof onEnd === "function") {
        onEnd();
      }
    };

    recognition.start();
  });
}
