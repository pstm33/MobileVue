export function normalizeAppLocale(locale, availableLocales = []) {
  const currentLocale = String(locale || "en");
  const aliasMap = {
    "en-us": "en",
    "en-gb": "en",
    "ru-ru": "ru",
    "ru_ru": "ru",
    tm: "tk",
    "tk-tm": "tk",
    "tk_tm": "tk",
    turkmen: "tk",
  };

  const normalized = aliasMap[currentLocale.toLowerCase()] || currentLocale;
  if (availableLocales.includes(normalized)) {
    return normalized;
  }

  const baseLocale = normalized.split(/[-_]/)[0];
  if (availableLocales.includes(baseLocale)) {
    return baseLocale;
  }

  return "en";
}
