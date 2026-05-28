<template>
  <section class="onboarding-page page min-h-[calc(100vh-36px)] justify-between fade-up">
    <div class="onboarding-topbar relative flex items-center justify-between gap-3">
      <img class="brand-logo" src="/tagam-logo.svg" alt="TAGAM" />
      <div class="flex items-center gap-2">
        <button
          class="theme-icon-button relative hover:border-emerald-300"
          type="button"
          :aria-label="copy.language"
          @click="cycleLanguage"
        >
          <Languages :size="19" />
          <span class="absolute -bottom-1 -right-1 rounded-full bg-emerald-300 px-1.5 py-0.5 text-[9px] font-black leading-none text-black shadow-lg">
            {{ app.language.toUpperCase() }}
          </span>
          <span class="sr-only">{{ copy.language }}</span>
        </button>
        <button
          class="theme-icon-button hover:border-cyan-300"
          type="button"
          :aria-label="app.theme === 'dark' ? copy.lightTheme : copy.darkTheme"
          @click="app.toggleTheme"
        >
          <Sun v-if="app.theme === 'dark'" :size="19" />
          <Moon v-else :size="19" />
        </button>
      </div>

      <div v-if="active.kind === 'settings'" class="onboarding-header-hints pointer-events-none absolute right-0 top-[calc(100%+8px)] z-20 flex gap-2">
        <div class="onboarding-header-hint">
          <span>{{ copy.languageHint }}</span>
          <ArrowUpRight :size="16" />
        </div>
        <div class="onboarding-header-hint">
          <span>{{ copy.themeHint }}</span>
          <ArrowUpRight :size="16" />
        </div>
      </div>
    </div>

    <div class="grid gap-6">
      <div class="onboarding-frame relative overflow-hidden rounded-[8px] border border-white/10 bg-white/5 p-3">
        <div class="onboarding-art flex items-center justify-center rounded-[8px] bg-[radial-gradient(circle_at_50%_18%,rgba(52,211,153,0.22),transparent_42%),linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))] px-3 py-4">
          <div v-if="active.kind === 'settings'" class="settings-art-simple grid w-full max-w-[360px] place-items-center px-5 text-center">
            <div class="settings-headline">
              <p>Programmany özüňize görä sazlaň</p>
              <p>Настрой приложение под себя</p>
              <p>Set up the app your way</p>
            </div>
          </div>
          <img v-else class="onboarding-image max-h-[230px] w-full max-w-[410px] object-contain drop-shadow-[0_28px_45px_rgba(0,0,0,0.35)]" :src="active.image" :alt="active.title" />
        </div>
        <div class="onboarding-copy mt-3 rounded-[8px] border border-white/10 bg-black/72 p-5 text-white shadow-2xl backdrop-blur-xl">
          <p class="m-0 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
            {{ active.kicker }}
          </p>
          <h1 class="onboarding-title m-0 mt-3 text-3xl font-black leading-[1.08] text-white sm:text-4xl">{{ active.title }}</h1>
          <p class="onboarding-text m-0 mt-4 text-sm leading-6 text-white/82">{{ active.text }}</p>
        </div>
      </div>

      <div class="flex justify-center gap-2">
        <button
          v-for="(_, index) in slides"
          :key="index"
          class="h-2.5 rounded-full transition-all"
          :class="index === activeIndex ? 'w-9 bg-emerald-300' : 'w-2.5 bg-white/20'"
          type="button"
          :aria-label="`Slide ${index + 1}`"
          @click="activeIndex = index"
        />
      </div>
    </div>

    <div class="grid gap-3">
      <button class="primary-button w-full" type="button" @click="next">
        {{ activeIndex === slides.length - 1 ? copy.continue : copy.next }}
        <ArrowRight :size="18" />
      </button>
      <p class="onboarding-note muted m-0 text-center text-xs">
        {{ copy.note }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowRight, ArrowUpRight, Languages, Moon, Sun } from "@lucide/vue";
import { useAppStore } from "src/stores/app";
import { useSessionStore } from "src/stores/session";

const router = useRouter();
const app = useAppStore();
const session = useSessionStore();
const activeIndex = ref(0);

const languages = [
  { code: "tk", label: "Tkm" },
  { code: "ru", label: "Рус" },
  { code: "en", label: "Eng" },
];

const translations = {
  ru: {
    skip: "Пропустить",
    language: "Сменить язык",
    darkTheme: "Темная тема",
    lightTheme: "Светлая тема",
    languageHint: "Язык",
    themeHint: "Тема",
    darkShort: "Темная",
    lightShort: "Светлая",
    next: "Дальше",
    continue: "Продолжить",
    note: "После этого выберем локацию и покажем рестораны именно из доступной зоны доставки.",
    slides: [
      {
        kind: "settings",
        kicker: "Старт",
        title: "Настрой приложение под себя",
        text: "Сверху можно выбрать язык и светлую или темную тему. Настройки всегда можно изменить позже.",
      },
      {
        kicker: "Discover",
        title: "Откройте места рядом с вами",
        text: "Находите лучшие рестораны поблизости. Удобный интерфейс помогает быстро изучить варианты, открыть новые любимые места и наслаждаться вкусным путешествием.",
        image: "/onboarding-places.png",
      },
      {
        kicker: "Customize",
        title: "Заказывайте блюда под себя",
        text: "Выбирайте любимые блюда или собирайте свой вариант из доступных размеров, добавок и свежих ингредиентов.",
        image: "/onboarding-order.png",
      },
      {
        kicker: "Delivery",
        title: "Быстрая доставка",
        text: "Получайте вкусную еду прямо к двери без лишнего ожидания. После выбора адреса приложение покажет доступные рестораны и реальные варианты доставки.",
        image: "/onboarding-delivery.png",
      },
    ],
  },
  tk: {
    skip: "Geç",
    language: "Dili çalyş",
    darkTheme: "Garaňky tema",
    lightTheme: "Ýagty tema",
    languageHint: "Dil",
    themeHint: "Tema",
    darkShort: "Garaňky",
    lightShort: "Ýagty",
    next: "Indiki",
    continue: "Dowam et",
    note: "Soňra eltip berilýän zolakdaky hakyky restoranlary görkezmek üçin ýerleşýän ýeriňizi saýlarys.",
    slides: [
      {
        kind: "settings",
        kicker: "Başlangyç",
        title: "Programmany özüňize görä sazlaň",
        text: "Ýokarda dili we ýagty ýa-da garaňky temany saýlap bilersiňiz. Sazlamalary soň hem üýtgedip bolýar.",
      },
      {
        kicker: "Discover",
        title: "Ýakynyňyzdaky ýerleri açyň",
        text: "Töweregiňizdäki iň gowy restoranlary tapyň. Amatly interfeýs dürli tagamlary çalt gözden geçirmäge kömek edýär.",
        image: "/onboarding-places.png",
      },
      {
        kicker: "Customize",
        title: "Tagamlary öz islegiňize görä sargyt ediň",
        text: "Halaýan tagamlaryňyzy saýlaň ýa-da ölçegler, goşundylar we elýeterli wariantlar bilen öz sargydyňyzy düzüň.",
        image: "/onboarding-order.png",
      },
      {
        kicker: "Delivery",
        title: "Çalt eltip bermek",
        text: "Lezzetli naharlar gapyňyza çalt gelsin. Salgy saýlanandan soň programma hakyky eltip beriş mümkinçiliklerini görkezer.",
        image: "/onboarding-delivery.png",
      },
    ],
  },
  en: {
    skip: "Skip",
    language: "Change language",
    darkTheme: "Dark theme",
    lightTheme: "Light theme",
    languageHint: "Language",
    themeHint: "Theme",
    darkShort: "Dark",
    lightShort: "Light",
    next: "Next",
    continue: "Continue",
    note: "Next we will choose your location and show restaurants from the active delivery zone.",
    slides: [
      {
        kind: "settings",
        kicker: "Start",
        title: "Set up the app your way",
        text: "Use the icons above to choose language and light or dark theme. You can change these settings later.",
      },
      {
        kicker: "Discover",
        title: "Discover places near you",
        text: "Find the best restaurants nearby. The app helps you explore dining options quickly and discover new favorites.",
        image: "/onboarding-places.png",
      },
      {
        kicker: "Customize",
        title: "Order customized items",
        text: "Choose your favorite dishes or build your own order with available sizes, add-ons and fresh ingredients.",
        image: "/onboarding-order.png",
      },
      {
        kicker: "Delivery",
        title: "Faster delivery",
        text: "Enjoy meals delivered straight to your doorstep. After location selection, Tagam shows real restaurants and delivery options.",
        image: "/onboarding-delivery.png",
      },
    ],
  },
};

const copy = computed(() => translations[app.language] || translations.ru);
const slides = computed(() => copy.value.slides);
const active = computed(() => slides.value[activeIndex.value]);

const cycleLanguage = () => {
  const index = languages.findIndex((language) => language.code === app.language);
  const nextLanguage = languages[(index + 1) % languages.length] || languages[0];
  app.setLanguage(nextLanguage.code);
};

const finish = () => {
  session.completeIntro();
  router.replace(session.hasCoordinates ? "/home" : "/location");
};

const next = () => {
  if (activeIndex.value < slides.value.length - 1) {
    activeIndex.value += 1;
    return;
  }
  finish();
};
</script>

<style scoped>
.onboarding-header-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.72);
  padding: 6px 8px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
  box-shadow: 0 14px 26px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(14px);
  animation: hint-pulse 1.05s ease-in-out infinite;
}

.onboarding-header-hint:nth-child(2) {
  animation-delay: 0.18s;
}

.onboarding-header-hint svg {
  color: var(--app-accent);
  transform: translateY(-1px);
  animation: arrow-nudge 1.05s ease-in-out infinite;
}

.settings-art-simple {
  min-height: 240px;
  padding-top: 52px;
}

.settings-headline {
  display: grid;
  gap: 12px;
  width: 100%;
}

.settings-headline p {
  margin: 0;
  font-size: clamp(22px, 7vw, 34px);
  font-weight: 1000;
  line-height: 1.05;
  text-shadow: 0 16px 32px rgba(0, 0, 0, 0.34);
}

.settings-headline p:nth-child(1) {
  color: #1fd17a;
}

.settings-headline p:nth-child(2) {
  color: #ffffff;
  font-size: clamp(18px, 5.5vw, 28px);
}

.settings-headline p:nth-child(3) {
  color: rgba(255, 255, 255, 0.68);
  font-size: clamp(17px, 5vw, 26px);
}

@keyframes hint-pulse {
  0%,
  100% {
    transform: translateY(0);
    box-shadow: 0 14px 26px rgba(0, 0, 0, 0.24);
  }

  50% {
    transform: translateY(-3px);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--app-accent) 22%, transparent), 0 18px 30px rgba(0, 0, 0, 0.28);
  }
}

@keyframes arrow-nudge {
  0%,
  100% {
    transform: translate(0, -1px);
  }

  50% {
    transform: translate(3px, -4px);
  }
}

@media (max-width: 560px), (hover: none) and (pointer: coarse) {
  .onboarding-page {
    min-height: calc(100dvh - var(--native-top) - var(--safe-bottom) - 30px);
  }

  .onboarding-frame {
    min-height: 0;
  }

  .onboarding-art {
    min-height: 176px;
    padding: 10px 12px;
  }

  .onboarding-image {
    max-height: 180px;
  }

  .onboarding-copy {
    margin-top: 10px;
    padding: 14px;
  }

  .onboarding-title {
    font-size: 21px !important;
    line-height: 1.08 !important;
  }

  .onboarding-text {
    margin-top: 10px;
    font-size: 12px !important;
    line-height: 1.38 !important;
  }

  .onboarding-note {
    padding-inline: 8px;
  }

  .onboarding-header-hints {
    top: calc(100% + 6px);
  }

  .onboarding-header-hint {
    padding: 5px 7px;
    font-size: 9px;
  }

  .settings-art-simple {
    min-height: 210px;
    padding-top: 46px;
  }

  .settings-headline {
    gap: 9px;
  }
}
</style>
