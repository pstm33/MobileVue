<template>
  <section class="onboarding-page page min-h-[calc(100vh-36px)] justify-between fade-up">
    <div class="flex items-center justify-between gap-3">
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
    </div>

    <div class="grid gap-6">
      <div class="onboarding-frame relative min-h-[560px] overflow-hidden rounded-[8px] border border-white/10 bg-white/5">
        <div class="onboarding-art absolute inset-x-0 top-0 flex h-[70%] -translate-y-8 items-start justify-center bg-[radial-gradient(circle_at_50%_18%,rgba(52,211,153,0.22),transparent_42%),linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))] p-1 sm:p-4">
          <img class="onboarding-image h-[118%] w-[118%] max-w-none object-contain drop-shadow-[0_28px_45px_rgba(0,0,0,0.35)]" :src="active.image" :alt="active.title" />
        </div>
        <div class="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div class="onboarding-copy absolute inset-x-4 bottom-4 rounded-[8px] border border-white/10 bg-black/72 p-5 text-white shadow-2xl backdrop-blur-xl">
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
import { ArrowRight, Languages, Moon, Sun } from "@lucide/vue";
import { useAppStore } from "src/stores/app";
import { useSessionStore } from "src/stores/session";

const router = useRouter();
const app = useAppStore();
const session = useSessionStore();
const activeIndex = ref(0);

const languages = [
  { code: "ru", label: "Рус" },
  { code: "tk", label: "Tkm" },
  { code: "en", label: "Eng" },
];

const translations = {
  ru: {
    skip: "Пропустить",
    language: "Сменить язык",
    darkTheme: "Темная тема",
    lightTheme: "Светлая тема",
    next: "Дальше",
    continue: "Продолжить",
    note: "После этого выберем локацию и покажем рестораны именно из доступной зоны доставки.",
    slides: [
      {
        kicker: "Discover",
        title: "Откройте места рядом с вами",
        text: "Находите лучшие рестораны поблизости. Удобный интерфейс помогает быстро изучить варианты, открыть новые любимые места и наслаждаться вкусным путешествием.",
        image: "/onboarding-1.svg",
      },
      {
        kicker: "Customize",
        title: "Заказывайте блюда под себя",
        text: "Выбирайте любимые блюда или собирайте свой вариант из доступных размеров, добавок и свежих ингредиентов.",
        image: "/onboarding-2.svg",
      },
      {
        kicker: "Delivery",
        title: "Быстрая доставка",
        text: "Получайте вкусную еду прямо к двери без лишнего ожидания. После выбора адреса приложение покажет доступные рестораны и реальные варианты доставки.",
        image: "/onboarding-3.svg",
      },
    ],
  },
  tk: {
    skip: "Geç",
    language: "Dili çalyş",
    darkTheme: "Garaňky tema",
    lightTheme: "Ýagty tema",
    next: "Indiki",
    continue: "Dowam et",
    note: "Soňra eltip berilýän zolakdaky hakyky restoranlary görkezmek üçin ýerleşýän ýeriňizi saýlarys.",
    slides: [
      {
        kicker: "Discover",
        title: "Ýakynyňyzdaky ýerleri açyň",
        text: "Töweregiňizdäki iň gowy restoranlary tapyň. Amatly interfeýs dürli tagamlary çalt gözden geçirmäge kömek edýär.",
        image: "/onboarding-1.svg",
      },
      {
        kicker: "Customize",
        title: "Tagamlary öz islegiňize görä sargyt ediň",
        text: "Halaýan tagamlaryňyzy saýlaň ýa-da ölçegler, goşundylar we elýeterli wariantlar bilen öz sargydyňyzy düzüň.",
        image: "/onboarding-2.svg",
      },
      {
        kicker: "Delivery",
        title: "Çalt eltip bermek",
        text: "Lezzetli naharlar gapyňyza çalt gelsin. Salgy saýlanandan soň programma hakyky eltip beriş mümkinçiliklerini görkezer.",
        image: "/onboarding-3.svg",
      },
    ],
  },
  en: {
    skip: "Skip",
    language: "Change language",
    darkTheme: "Dark theme",
    lightTheme: "Light theme",
    next: "Next",
    continue: "Continue",
    note: "Next we will choose your location and show restaurants from the active delivery zone.",
    slides: [
      {
        kicker: "Discover",
        title: "Discover places near you",
        text: "Find the best restaurants nearby. The app helps you explore dining options quickly and discover new favorites.",
        image: "/onboarding-1.svg",
      },
      {
        kicker: "Customize",
        title: "Order customized items",
        text: "Choose your favorite dishes or build your own order with available sizes, add-ons and fresh ingredients.",
        image: "/onboarding-2.svg",
      },
      {
        kicker: "Delivery",
        title: "Faster delivery",
        text: "Enjoy meals delivered straight to your doorstep. After location selection, Tagam shows real restaurants and delivery options.",
        image: "/onboarding-3.svg",
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
  if (activeIndex.value < slides.length - 1) {
    activeIndex.value += 1;
    return;
  }
  finish();
};
</script>

<style scoped>
@media (max-width: 560px), (hover: none) and (pointer: coarse) {
  .onboarding-page {
    min-height: calc(100dvh - var(--native-top) - var(--safe-bottom) - 30px);
  }

  .onboarding-frame {
    min-height: 382px;
  }

  .onboarding-art {
    height: 56%;
    transform: translateY(-22px);
  }

  .onboarding-image {
    width: 104%;
    height: 104%;
  }

  .onboarding-copy {
    right: 12px;
    bottom: 12px;
    left: 12px;
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
}
</style>
