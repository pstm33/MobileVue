//import { boot } from "quasar/wrappers";
//import { createI18n } from "vue-i18n";
//import messages from "src/i18n";

//export default boot(({ app }) => {
//  const i18n = createI18n({
//    locale: "en",
//    fallbackLocale: "en",
//    globalInjection: true,
//    messages,
//  });

// Set i18n instance on app
//app.use(i18n);
//});

import { boot } from "quasar/wrappers";
import { createI18n } from "vue-i18n";
import messages from "src/i18n";
import { LocalStorage } from "quasar";

export default boot(({ app }) => {
  // Проверяем сохраненный язык, по умолчанию ставим 'en'
  const savedLocale = LocalStorage.getItem("app_language") || "en";

  const i18n = createI18n({
    locale: savedLocale,
    fallbackLocale: "en",
    globalInjection: true,
    messages,
  });

  app.use(i18n);
});
