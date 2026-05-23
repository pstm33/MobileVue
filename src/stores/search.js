import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import { useMerchantFeedStore } from "src/stores/merchantFeed";
import { LocalStorage } from "src/services/storage";

const decodeHtml = (value) => {
  if (typeof document === "undefined") {
    return String(value ?? "").replace(/<[^>]+>/g, "");
  }

  const element = document.createElement("div");
  element.innerHTML = String(value ?? "");
  return element.textContent || "";
};

const normalize = (value) =>
  decodeHtml(value)
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const currencyCode = () => LocalStorage.getItem("currency_code") || "TMT";

const flattenMenu = (slug, menuPayload) => {
  const categories = menuPayload?.details?.data?.category ?? [];

  return categories.flatMap((category) =>
    (category.item_list ?? []).map((item) => ({
      ...item,
      slug,
      cat_id: category.cat_id,
      category_name: category.category_name,
      searchText: normalize(`${item.item_name} ${item.item_description} ${category.category_name}`),
    }))
  );
};

export const useSearchStore = defineStore("search", {
  state: () => ({
    loading: false,
    error: "",
    indexedAt: "",
    menusBySlug: {},
  }),
  getters: {
    isReady: (state) => Boolean(state.indexedAt),
    itemCount: (state) => Object.values(state.menusBySlug).reduce((count, items) => count + items.length, 0),
  },
  actions: {
    async ensureIndexed() {
      if (this.loading || this.indexedAt) return;

      this.loading = true;
      this.error = "";

      try {
        const feed = useMerchantFeedStore();
        if (!feed.loadedAt && !feed.loading) {
          await feed.load();
        }

        const pairs = await Promise.all(
          feed.rows.map(async (restaurant) => {
            const slug = restaurant.restaurant_slug;
            if (!slug) return ["", []];

            const menu = await APIinterface.geStoreMenu(slug, currencyCode());
            return [slug, flattenMenu(slug, menu)];
          })
        );

        this.menusBySlug = Object.fromEntries(pairs.filter(([slug]) => slug));
        this.indexedAt = new Date().toISOString();
      } catch (error) {
        this.error = error?.message ?? String(error);
      } finally {
        this.loading = false;
      }
    },
    search(query) {
      const feed = useMerchantFeedStore();
      const q = normalize(query);

      if (!q) {
        return {
          restaurants: feed.rows,
          items: Object.values(this.menusBySlug).flat().slice(0, 18),
        };
      }

      const terms = q.split(" ").filter(Boolean);
      const matches = (value) => terms.every((term) => value.includes(term));

      const restaurants = feed.rows.filter((restaurant) =>
        matches(
          normalize(
            `${restaurant.restaurant_name} ${restaurant.merchant_address} ${(restaurant.cuisine || []).join(" ")}`
          )
        )
      );

      const items = Object.values(this.menusBySlug)
        .flat()
        .filter((item) => matches(item.searchText))
        .slice(0, 36);

      return { restaurants, items };
    },
  },
});
