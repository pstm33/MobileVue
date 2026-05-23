import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "root",
    component: () => import("src/views/OnboardingView.vue"),
    meta: { public: true, hideTabbar: true },
  },
  {
    path: "/onboarding",
    name: "onboarding",
    component: () => import("src/views/OnboardingView.vue"),
    meta: { public: true, hideTabbar: true },
  },
  {
    path: "/select-language",
    redirect: "/onboarding",
  },
  {
    path: "/location",
    name: "location",
    component: () => import("src/views/LocationView.vue"),
    meta: { public: true, hideTabbar: true, requiresIntro: true },
  },
  {
    path: "/location/map",
    redirect: (to) => ({ path: "/location", query: { mode: "map", ...to.query } }),
  },
  {
    path: "/location/add-location",
    redirect: (to) => ({ path: "/location", query: { mode: "add", ...to.query } }),
  },
  {
    path: "/errornetwork",
    name: "errornetwork",
    component: () => import("src/views/NetworkErrorView.vue"),
    meta: { public: true, hideTabbar: true },
  },
  {
    path: "/home",
    name: "home",
    component: () => import("src/views/HomeView.vue"),
  },
  {
    path: "/home/offers",
    name: "home-offers",
    component: () => import("src/views/OffersView.vue"),
  },
  {
    path: "/home/browse",
    name: "browse",
    component: () => import("src/views/SearchView.vue"),
  },
  {
    path: "/feed",
    redirect: "/home",
  },
  {
    path: "/feed/location",
    redirect: "/location",
  },
  {
    path: "/home/orders",
    redirect: "/orders",
  },
  {
    path: "/home/offers-location",
    redirect: "/location",
  },
  {
    path: "/view",
    redirect: "/home",
  },
  {
    path: "/view/categories",
    name: "categories",
    component: () => import("src/views/CategoriesView.vue"),
  },
  {
    path: "/view/quick-results",
    redirect: (to) => ({ path: "/search", query: to.query }),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("src/views/SearchView.vue"),
  },
  {
    path: "/search/items",
    redirect: (to) => ({ path: "/search", query: to.query }),
  },
  {
    path: "/search/location",
    redirect: "/location",
  },
  {
    path: "/theme-preview",
    name: "theme-preview",
    component: () => import("src/views/AppPreferencesView.vue"),
  },
  {
    path: "/restaurant/:slug",
    name: "restaurant",
    component: () => import("src/views/RestaurantView.vue"),
  },
  {
    path: "/menu/:slug/:item_uuid?/:cat_id?",
    redirect: (to) => ({
      path: `/restaurant/${to.params.slug}`,
      query: {
        item: to.params.item_uuid || undefined,
        cat: to.params.cat_id || undefined,
      },
    }),
  },
  {
    path: "/search-menu/:slug",
    redirect: (to) => ({ path: `/restaurant/${to.params.slug}`, query: { panel: "search", ...to.query } }),
  },
  {
    path: "/menu/category",
    redirect: (to) => ({ path: to.query.slug ? `/restaurant/${to.query.slug}` : "/search", query: { cat: to.query.cat_id || to.query.id, ...to.query } }),
  },
  {
    path: "/menu/review",
    redirect: (to) => ({ path: to.query.slug ? `/restaurant/${to.query.slug}` : "/home", query: { panel: "info", reviews: "1", ...to.query } }),
  },
  {
    path: "/store/info",
    redirect: (to) => ({ path: to.query.slug ? `/restaurant/${to.query.slug}` : "/home", query: { panel: "info" } }),
  },
  {
    path: "/store/review",
    redirect: (to) => ({ path: to.query.slug ? `/restaurant/${to.query.slug}` : "/home", query: { panel: "info", reviews: "1" } }),
  },
  {
    path: "/store/booking",
    redirect: (to) => ({ path: "/booking", query: to.query }),
  },
  {
    path: "/store/booking-succesful",
    redirect: (to) => ({ path: "/booking/track", query: { success: "1", ...to.query } }),
  },
  {
    path: "/cart",
    name: "cart",
    component: () => import("src/views/CartView.vue"),
  },
  {
    path: "/checkout",
    name: "checkout",
    component: () => import("src/views/CheckoutView.vue"),
  },
  {
    path: "/address/select",
    redirect: (to) => ({ path: "/addresses", query: { select: "1", ...to.query } }),
  },
  {
    path: "/order/success",
    name: "order-success",
    component: () => import("src/views/OrderDetailsView.vue"),
  },
  {
    path: "/order/successful",
    redirect: (to) => ({ path: "/order/success", query: to.query }),
  },
  {
    path: "/order/details",
    name: "order-details",
    component: () => import("src/views/OrderDetailsView.vue"),
  },
  {
    path: "/order/write-review",
    name: "write-review",
    component: () => import("src/views/WriteReviewView.vue"),
  },
  {
    path: "/order/rate-driver",
    redirect: (to) => ({ path: "/order/write-review", query: to.query }),
  },
  {
    path: "/orders",
    name: "orders",
    component: () => import("src/views/OrderHistoryView.vue"),
  },
  {
    path: "/profile",
    name: "profile-edit",
    component: () => import("src/views/ProfileEditView.vue"),
  },
  {
    path: "/addresses",
    name: "addresses",
    component: () => import("src/views/AddressBookView.vue"),
  },
  {
    path: "/payments",
    name: "payments",
    component: () => import("src/views/PaymentMethodsView.vue"),
  },
  {
    path: "/favourites",
    name: "favourites",
    component: () => import("src/views/FavouritesView.vue"),
  },
  {
    path: "/notifications",
    name: "notifications",
    component: () => import("src/views/NotificationsView.vue"),
  },
  {
    path: "/wallet",
    name: "wallet",
    component: () => import("src/views/WalletView.vue"),
  },
  {
    path: "/wallet/receipt",
    name: "wallet-receipt",
    component: () => import("src/views/WalletReceiptView.vue"),
  },
  {
    path: "/points",
    name: "points",
    component: () => import("src/views/PointsView.vue"),
  },
  {
    path: "/booking",
    name: "booking",
    component: () => import("src/views/BookingView.vue"),
  },
  {
    path: "/booking/track",
    name: "booking-track",
    component: () => import("src/views/BookingView.vue"),
  },
  {
    path: "/booking/cancel",
    redirect: (to) => ({ path: "/booking/track", query: { action: "cancel", ...to.query } }),
  },
  {
    path: "/booking/update",
    redirect: (to) => ({ path: "/booking/track", query: { action: "update", ...to.query } }),
  },
  {
    path: "/booking/search",
    redirect: (to) => ({ path: "/search", query: { booking: "1", ...to.query } }),
  },
  {
    path: "/update-app",
    name: "update-app",
    component: () => import("src/views/UpdateAppView.vue"),
  },
  {
    path: "/account/security",
    name: "account-security",
    component: () => import("src/views/AccountSecurityView.vue"),
  },
  {
    path: "/tracking",
    name: "tracking",
    component: () => import("src/views/TrackingView.vue"),
  },
  {
    path: "/account",
    name: "account",
    component: () => import("src/views/AccountView.vue"),
  },
  {
    path: "/user/:authPage?",
    name: "auth",
    component: () => import("src/views/AuthView.vue"),
  },
  {
    path: "/account-menu",
    redirect: "/account",
  },
  {
    path: "/account/payments/new",
    redirect: (to) => ({ path: "/payments", query: { add: "1", ...to.query } }),
  },
  {
    path: "/account/address",
    redirect: (to) => ({ path: "/addresses", query: to.query }),
  },
  {
    path: "/account/delete",
    redirect: (to) => ({ path: "/account/security", query: { section: "delete", ...to.query } }),
  },
  {
    path: "/account/settings",
    name: "account-settings",
    component: () => import("src/views/AppPreferencesView.vue"),
  },
  {
    path: "/account/language",
    name: "account-language",
    component: () => import("src/views/AppPreferencesView.vue"),
  },
  {
    path: "/account/currency",
    name: "account-currency",
    component: () => import("src/views/AppPreferencesView.vue"),
  },
  {
    path: "/account/upload-deposit",
    redirect: (to) => ({ path: "/wallet", query: { action: "deposit", ...to.query } }),
  },
  {
    path: "/account/chat",
    name: "account-chat",
    component: () => import("src/views/ChatView.vue"),
  },
  {
    path: "/account/chat/conversation",
    name: "account-chat-conversation",
    component: () => import("src/views/ChatView.vue"),
  },
  {
    path: "/account/:section",
    redirect: (to) => {
      if (to.params.section === "allorder") return { path: "/orders", query: to.query };
      if (to.params.section === "orders") return { path: "/orders", query: to.query };
      if (to.params.section === "verify") return { path: "/account/security", query: { section: "verify", ...to.query } };
      if (to.params.section === "complete-registration") return { path: "/profile", query: { complete: "1", ...to.query } };
      if (to.params.section === "profile") return { path: "/profile", query: to.query };
      if (to.params.section === "edit-profile") return { path: "/profile", query: to.query };
      if (to.params.section === "my-address") return { path: "/addresses", query: to.query };
      if (to.params.section === "payment") return { path: "/payments", query: to.query };
      if (to.params.section === "payments") return { path: "/payments", query: to.query };
      if (to.params.section === "favourites") return { path: "/favourites", query: to.query };
      if (to.params.section === "favorite") return { path: "/favourites", query: to.query };
      if (to.params.section === "notifications") return { path: "/notifications", query: to.query };
      if (to.params.section === "wallet") return { path: "/wallet", query: to.query };
      if (to.params.section === "points") return { path: "/points", query: to.query };
      if (to.params.section === "change-password") return { path: "/account/security", query: to.query };
      if (to.params.section === "manage-account") return { path: "/account/security", query: to.query };
      if (to.params.section === "delete-account") return { path: "/account/security", query: to.query };
      if (to.params.section === "trackorder") return { path: "/tracking", query: to.query };
      if (to.params.section === "order-details") return { path: "/order/details", query: to.query };
      return { path: "/account", query: to.query };
    },
  },
  {
    path: "/legal",
    component: () => import("src/views/LegalView.vue"),
  },
  {
    path: "/legal/page/:page_id",
    component: () => import("src/views/LegalView.vue"),
  },
  {
    path: "/privacy-policy",
    component: () => import("src/views/LegalView.vue"),
  },
  {
    path: "/terms-of-service",
    component: () => import("src/views/LegalView.vue"),
  },
  {
    path: "/data-deletion",
    component: () => import("src/views/LegalView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/home",
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to) => {
  const introSeen = Boolean(localStorage.getItem("intro_seen"));
  const coordinates = localStorage.getItem("coordinates");

  if (to.name === "root" && introSeen) {
    return coordinates ? "/home" : "/location";
  }

  if (!to.meta.public && !introSeen) {
    return "/onboarding";
  }

  if (to.meta.requiresIntro && !introSeen) {
    return "/onboarding";
  }

  if (!to.meta.public && !coordinates) {
    return "/location";
  }

  return true;
});
